import type { Queryable } from '../hub/database'

import { AI_SCHEMA } from './database'
import { toVector } from './embed'
import type { AiCollection } from './sections'

/** Datenzugriff auf den KI-Index (SQL, parametrisiert). */
const chunks = `${AI_SCHEMA}.chunks`

export type StoredChunk = {
  collection: AiCollection
  docId: number
  locale: string
  part: number
  title: string
  path: string | null
  anchor: string | null
  label: string | null
  text: string
  contentHash: string
}

export type ScoredChunk = StoredChunk & { id: number; score: number }

/** Bestehende Hashes eines Dokuments je Sprache und Teil (um nur Geändertes neu einzubetten). */
export async function existingHashes(db: Queryable, collection: AiCollection, docId: number): Promise<Map<string, string>> {
  const { rows } = await db.query<{ locale: string; part: number; content_hash: string; embedder: string }>(
    `select locale, part, content_hash, embedder from ${chunks} where collection = $1 and doc_id = $2`,
    [collection, docId],
  )
  return new Map(rows.map((r) => [`${r.locale}:${r.part}`, `${r.content_hash}|${r.embedder}`]))
}

export async function upsertChunk(db: Queryable, chunk: StoredChunk, embedder: string, embedding: number[]): Promise<void> {
  await db.query(
    `insert into ${chunks} (collection, doc_id, locale, part, title, path, anchor, label, text, content_hash, embedder, embedding)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::vector)
     on conflict (collection, doc_id, locale, part) do update set title = excluded.title, path = excluded.path,
       anchor = excluded.anchor, label = excluded.label, text = excluded.text, content_hash = excluded.content_hash,
       embedder = excluded.embedder, embedding = excluded.embedding, updated_at = now()`,
    [chunk.collection, chunk.docId, chunk.locale, chunk.part, chunk.title, chunk.path, chunk.anchor, chunk.label, chunk.text, chunk.contentHash, embedder, toVector(embedding)],
  )
}

/** Metadaten ohne neuen Vektor aktualisieren (z. B. geänderter Pfad bei gleichem Text). */
export async function touchChunk(db: Queryable, chunk: StoredChunk): Promise<void> {
  await db.query(
    `update ${chunks} set title = $5, path = $6, anchor = $7, label = $8, updated_at = now()
     where collection = $1 and doc_id = $2 and locale = $3 and part = $4`,
    [chunk.collection, chunk.docId, chunk.locale, chunk.part, chunk.title, chunk.path, chunk.anchor, chunk.label],
  )
}

/** Teile entfernen, die es nicht mehr gibt (Sprache weg oder Text kürzer geworden). */
export async function pruneChunks(db: Queryable, collection: AiCollection, docId: number, keep: { locale: string; parts: number }[]): Promise<void> {
  const locales = keep.map((k) => k.locale)
  await db.query(`delete from ${chunks} where collection = $1 and doc_id = $2 and not (locale = any($3::text[]))`, [collection, docId, locales])
  for (const k of keep) await db.query(`delete from ${chunks} where collection = $1 and doc_id = $2 and locale = $3 and part >= $4`, [collection, docId, k.locale, k.parts])
}

export async function deleteDocument(db: Queryable, collection: AiCollection, docId: number): Promise<void> {
  await db.query(`delete from ${chunks} where collection = $1 and doc_id = $2`, [collection, docId])
}

/** Nächste Abschnitte zu einem Frage-Vektor (Kosinus-Ähnlichkeit), nur aus demselben Embedding-Modell. */
export async function nearestChunks(db: Queryable, embedding: number[], embedder: string, limit = 40): Promise<ScoredChunk[]> {
  const { rows } = await db.query<{
    id: string
    collection: AiCollection
    doc_id: number
    locale: string
    part: number
    title: string
    path: string | null
    anchor: string | null
    label: string | null
    text: string
    content_hash: string
    score: number
  }>(
    `select id, collection, doc_id, locale, part, title, path, anchor, label, text, content_hash,
       1 - (embedding <=> $1::vector) as score
     from ${chunks} where embedder = $2 order by embedding <=> $1::vector limit $3`,
    [toVector(embedding), embedder, limit],
  )
  return rows.map((r) => ({
    id: Number(r.id),
    collection: r.collection,
    docId: r.doc_id,
    locale: r.locale,
    part: r.part,
    title: r.title,
    path: r.path,
    anchor: r.anchor,
    label: r.label,
    text: r.text,
    contentHash: r.content_hash,
    score: Number(r.score),
  }))
}

export async function indexStats(db: Queryable): Promise<{ chunks: number; documents: number }> {
  const { rows } = await db.query<{ chunks: string; documents: string }>(
    `select count(*) as chunks, count(distinct (collection, doc_id)) as documents from ${chunks}`,
  )
  return { chunks: Number(rows[0]?.chunks ?? 0), documents: Number(rows[0]?.documents ?? 0) }
}
