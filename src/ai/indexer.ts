import { createHash } from 'node:crypto'

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig, Payload } from 'payload'

import de from '../../messages/de.json'
import en from '../../messages/en.json'
import fr from '../../messages/fr.json'
import { hubDatabase, type Queryable } from '../hub/database'

import { configuredEmbedder, type Embedder } from './embed'
import { deleteDocument, existingHashes, pruneChunks, type StoredChunk, touchChunk, upsertChunk } from './index-repo'
import { AI_COLLECTIONS, type AiCollection, buildChunks, isIndexable } from './sections'

/**
 * Hält den KI-Index aktuell (Entscheidungen 8.6, 8.9): Deutsch immer, EN/FR nur mit menschlicher Übersetzung
 * (maschinelle Fassungen landen nicht im Index). Nur geänderte Abschnitte werden neu eingebettet.
 * Ohne `server-only`, weil CLI-Skripte (`npm run ai:reindex`) es auch nutzen.
 */
const LOCALES = ['de', 'en', 'fr'] as const
type IndexLocale = (typeof LOCALES)[number]
const MESSAGES: Record<IndexLocale, Record<string, Record<string, string>>> = { de, en, fr } as never

export function sectionLabel(key: string | null, locale: IndexLocale): string | null {
  if (!key) return null
  const [ns, name] = key.split('.')
  return MESSAGES[locale][ns]?.[name] ?? MESSAGES.de[ns]?.[name] ?? null
}

const hash = (value: string) => createHash('sha256').update(value).digest('hex')

async function fetchLocale(payload: Payload, collection: AiCollection, id: number, locale: IndexLocale): Promise<Record<string, unknown> | null> {
  try {
    const doc = await payload.findByID({
      collection,
      id,
      locale,
      fallbackLocale: false,
      depth: 0,
      overrideAccess: false, // nur Publiziertes, wie für Gäste
      disableErrors: true,
    })
    return (doc as Record<string, unknown> | null) ?? null
  } catch {
    return null
  }
}

/** Ein Dokument (neu) indexieren oder aus dem Index entfernen; liefert die Zahl der neu eingebetteten Abschnitte. */
export async function indexDocument(payload: Payload, collection: AiCollection, id: number, options: { db?: Queryable; embedder?: Embedder; now?: Date } = {}): Promise<number> {
  const db = options.db ?? hubDatabase()
  const embedder = options.embedder ?? configuredEmbedder()
  const base = await fetchLocale(payload, collection, id, 'de')
  if (!base || !base.title || !isIndexable(collection, base, options.now)) {
    await deleteDocument(db, collection, id)
    return 0
  }

  const wanted: StoredChunk[] = []
  const keep: { locale: string; parts: number }[] = []
  for (const locale of LOCALES) {
    const doc = locale === 'de' ? base : await fetchLocale(payload, collection, id, locale)
    // Übersetzt = Titel in dieser Sprache vorhanden (wie `isTranslated` auf der Website)
    if (!doc || typeof doc.title !== 'string' || !doc.title.trim()) continue
    const title = doc.title.trim()
    const path = typeof base.path === 'string' ? base.path : null
    const parts = buildChunks(collection, doc)
    keep.push({ locale, parts: parts.length })
    parts.forEach((c, part) => {
      const label = sectionLabel(c.label, locale)
      wanted.push({ collection, docId: id, locale, part, title, path, anchor: c.anchor, label, text: c.text, contentHash: hash(`${title}\n${label ?? ''}\n${c.text}`) })
    })
  }

  const existing = await existingHashes(db, collection, id)
  const changed = wanted.filter((c) => existing.get(`${c.locale}:${c.part}`) !== `${c.contentHash}|${embedder.name}`)
  const unchanged = wanted.filter((c) => !changed.includes(c))
  if (changed.length) {
    const vectors = await embedder.embed(changed.map((c) => [c.title, c.label, c.text].filter(Boolean).join('\n')))
    for (let i = 0; i < changed.length; i++) await upsertChunk(db, changed[i], embedder.name, vectors[i])
  }
  for (const c of unchanged) await touchChunk(db, c)
  await pruneChunks(db, collection, id, keep)
  return changed.length
}

/** Gesamten Index neu aufbauen bzw. abgleichen (`npm run ai:reindex`). */
export async function reindexAll(payload: Payload, log: (msg: string) => void = console.log): Promise<{ documents: number; embedded: number }> {
  let documents = 0
  let embedded = 0
  for (const collection of AI_COLLECTIONS) {
    const { docs } = await payload.find({ collection, depth: 0, limit: 0, pagination: false, overrideAccess: true, select: { title: true } })
    for (const doc of docs) {
      embedded += await indexDocument(payload, collection, doc.id as number)
      documents++
    }
    log(`KI-Index: ${collection} – ${docs.length} Dokumente geprüft`)
  }
  // Dokumente, die es nicht mehr gibt
  const db = hubDatabase()
  for (const collection of AI_COLLECTIONS) {
    const { rows } = await db.query<{ doc_id: number }>(`select distinct doc_id from ai.chunks where collection = $1`, [collection])
    for (const { doc_id } of rows) {
      const exists = await payload.count({ collection, where: { id: { equals: doc_id } }, overrideAccess: true })
      if (!exists.totalDocs) await deleteDocument(db, collection, doc_id)
    }
  }
  return { documents, embedded }
}

/* ---------- Hooks: nach dem Speichern im CMS den Abschnitt-Index nachführen ---------- */

const pending = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Indexierung kurz verzögert und ausserhalb der Speicher-Transaktion (sonst wäre der neue Stand noch nicht sichtbar).
 * Fehler (z. B. Embedding-Dienst nicht erreichbar) blockieren das Speichern nie; `npm run ai:reindex` holt nach.
 */
function schedule(payload: Payload, collection: AiCollection, id: number) {
  if (process.env.AI_INDEX_ON_SAVE === 'off') return
  const key = `${collection}:${id}`
  clearTimeout(pending.get(key))
  pending.set(
    key,
    setTimeout(() => {
      pending.delete(key)
      indexDocument(payload, collection, id).catch((error) => payload.logger.warn({ err: error, msg: `KI-Index: ${key} nicht aktualisiert` }))
    }, 1500),
  )
}

const afterChange: CollectionAfterChangeHook = ({ doc, req, collection }) => {
  schedule(req.payload, collection.slug as AiCollection, doc.id as number)
  return doc
}

const afterDelete: CollectionAfterDeleteHook = ({ id, req, collection }) => {
  schedule(req.payload, collection.slug as AiCollection, Number(id))
}

/** Hängt die Index-Hooks an die Inhalts-Collections (Artikel, Methoden, Tools, News, Seiten, Themen). */
export function withAiIndex(config: CollectionConfig): CollectionConfig {
  if (!(AI_COLLECTIONS as readonly string[]).includes(config.slug)) return config
  return {
    ...config,
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(config.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
