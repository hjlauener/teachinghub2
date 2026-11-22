import { promises as fs } from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { buildData, loadLookups, type Lookups, teaserNewsData } from './build'
import { METHODS_CSV_FILE, PAGES_DIR, SEARCH_FILE } from './config'
import { readManifest } from './crawl'
import {
  type ExtractedDoc,
  extractHomeTeasers,
  extractPage,
  type HomeTeaser,
  type MethodCsvRow,
  parseMethodsCsv,
  parseSearchIndex,
  type SearchTag,
} from './extract'
import { fieldHashes, hashValue, type ImportCollection, importedFields, locallyModified } from './fields'
import { createHtmlConverter, type LexicalState, type MediaRef } from './lexical'
import { importAssets } from './media'

export type ImportReport = {
  created: Record<string, number>
  skipped: number
  teaserNews: number
  warnings: { path: string; message: string }[]
  failedAssets: { url: string; error: string }[]
  errors: { path: string; error: string }[]
}

export const emptyReport = (): ImportReport => ({ created: {}, skipped: 0, teaserNews: 0, warnings: [], failedAssets: [], errors: [] })

export type Sources = { docs: ExtractedDoc[]; teasers: HomeTeaser[]; search: Map<string, SearchTag[]>; csv: MethodCsvRow[] }

export type ImportContext = {
  lookups: Lookups
  media: Map<string, MediaRef>
  toLexical: (html: string, media: Map<string, MediaRef>) => LexicalState | null
}

const ORDER: ImportCollection[] = ['pages', 'articles', 'tools', 'methods', 'news']

/** Rohdaten des letzten Crawls von der Festplatte lesen und extrahieren. */
export async function loadSources(): Promise<Sources> {
  const manifest = await readManifest()
  const docs: ExtractedDoc[] = []
  let teasers: HomeTeaser[] = []
  for (const page of manifest.pages) {
    const html = await fs.readFile(path.join(PAGES_DIR, page.file), 'utf-8')
    if (page.path === '/') teasers = extractHomeTeasers(html, page.url)
    docs.push(extractPage(html, page.url))
  }
  return {
    docs,
    teasers,
    search: parseSearchIndex(await fs.readFile(SEARCH_FILE, 'utf-8')),
    csv: parseMethodsCsv(await fs.readFile(METHODS_CSV_FILE, 'utf-8')),
  }
}

/** Nachschlagetabellen, Mediathek (lädt fehlende Dateien) und HTML-Konverter. */
export async function prepareContext(
  payload: Payload,
  sources: Sources,
  report: ImportReport,
  log: (msg: string) => void = () => undefined,
  options: { downloadAssets?: boolean } = {},
): Promise<ImportContext> {
  const lookups = await loadLookups(payload, sources.search, sources.csv, sources.teasers)
  const assets = options.downloadAssets === false
    ? []
    : [...sources.docs.flatMap((d) => d.assets), ...sources.teasers.filter((t) => t.image).map((t) => ({ url: t.image as string, alt: '' }))]
  const { media, failed } = await importAssets(payload, assets, log)
  report.failedAssets.push(...failed)
  return { lookups, media, toLexical: await createHtmlConverter(payload) }
}

/** Speichert den Import-Stand (Basis für den Delta-Abgleich). `hashes` überschreibt einzelne Feld-Hashes. */
export async function writeSnapshot(
  payload: Payload,
  doc: Pick<ExtractedDoc, 'path' | 'legacyUrl' | 'legacyDate' | 'hash'>,
  collection: ImportCollection,
  saved: Record<string, unknown> & { id: number },
  hashes: Record<string, string> = {},
) {
  const data = {
    path: doc.path,
    targetCollection: collection,
    docId: saved.id,
    legacyUrl: doc.legacyUrl,
    legacyDate: doc.legacyDate,
    hash: doc.hash,
    importedAt: new Date().toISOString(),
    data: saved,
    fieldHashes: { ...fieldHashes(collection, saved), ...hashes },
  }
  const existing = await payload.find({ collection: 'legacy-snapshots', where: { path: { equals: doc.path } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]) await payload.update({ collection: 'legacy-snapshots', id: existing.docs[0].id, data, overrideAccess: true })
  else await payload.create({ collection: 'legacy-snapshots', data, overrideAccess: true })
}

/** Legt ein extrahiertes Dokument an und speichert den Import-Stand. */
export async function createFromLegacy(payload: Payload, doc: ExtractedDoc, ctx: ImportContext, report: ImportReport) {
  const built = buildData(doc, ctx.lookups, ctx.toLexical, ctx.media)
  built.warnings.forEach((message) => report.warnings.push({ path: doc.path, message }))
  const saved = (await payload.create({
    collection: built.collection,
    data: built.data as never,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown> & { id: number }
  await writeSnapshot(payload, doc, built.collection, saved)
  report.created[built.collection] = (report.created[built.collection] ?? 0) + 1
  return { collection: built.collection, id: saved.id }
}

/** Pfad → Dokument aller importierten Seiten. */
export async function importedIndex(payload: Payload) {
  const snapshots = await payload.find({ collection: 'legacy-snapshots', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  return {
    snapshots: new Map(snapshots.docs.map((s) => [s.path, s])),
    idByPath: new Map<string, { collection: ImportCollection; id: number }>(
      snapshots.docs.map((s) => [s.path, { collection: s.targetCollection as ImportCollection, id: s.docId as number }]),
    ),
  }
}

/**
 * Eltern-Seiten und alternative Methoden verknüpfen – für neue Dokumente und für ältere,
 * deren Import-Stand die Verknüpfung noch nicht enthält (z. B. nach abgebrochenem Lauf).
 */
export async function linkRelations(payload: Payload, docs: ExtractedDoc[], report: ImportReport) {
  const { snapshots, idByPath } = await importedIndex(payload)
  for (const doc of docs) {
    const target = idByPath.get(doc.path)
    if (!target) continue
    const base = (snapshots.get(doc.path)?.data ?? {}) as Record<string, unknown>
    const missing = (field: string) =>
      base[field] === null || base[field] === undefined || (Array.isArray(base[field]) && (base[field] as unknown[]).length === 0)
    const data: Record<string, unknown> = {}
    if (doc.parentPath && (target.collection === 'articles' || target.collection === 'tools') && missing('parent')) {
      const parent = idByPath.get(doc.parentPath)
      if (parent?.collection === target.collection) data.parent = parent.id
    }
    if (target.collection === 'methods' && doc.sections.alternatives.length && missing('alternatives')) {
      data.alternatives = doc.sections.alternatives
        .map((a) => ({ method: idByPath.get(a.path)?.id, note: a.note || null }))
        .filter((a) => a.method)
    }
    if (Object.keys(data).length === 0) continue
    try {
      const saved = (await payload.update({
        collection: target.collection,
        id: target.id,
        data: data as never,
        locale: 'de',
        depth: 0,
        overrideAccess: true,
      })) as unknown as Record<string, unknown> & { id: number }
      await writeSnapshot(payload, doc, target.collection, saved)
    } catch (error) {
      report.errors.push({ path: doc.path, error: `Verknüpfung: ${errorMessage(error)}` })
    }
  }
}

/** Erstimport: legt alle noch nicht importierten Seiten an (Plan Abschnitt 6, Schritt 1–2). */
export async function importDocs(payload: Payload, sources: Sources, ctx: ImportContext, report: ImportReport, log: (msg: string) => void = () => undefined) {
  const { snapshots, idByPath } = await importedIndex(payload)
  for (const collection of ORDER) {
    for (const doc of sources.docs.filter((d) => d.collection === collection)) {
      if (snapshots.has(doc.path)) {
        report.skipped++
        continue
      }
      try {
        idByPath.set(doc.path, await createFromLegacy(payload, doc, ctx, report))
      } catch (error) {
        report.errors.push({ path: doc.path, error: errorMessage(error) })
      }
    }
    log(`${collection}: ${report.created[collection] ?? 0} angelegt`)
  }
  await linkRelations(payload, sources.docs, report)

  // Startseiten-Teaser ohne eigene News-Seite → News mit Link
  const newsPaths = new Set(sources.docs.filter((d) => d.collection === 'news').map((d) => d.path))
  const existingNews = await payload.find({ collection: 'news', limit: 0, pagination: false, depth: 0, locale: 'de', overrideAccess: true })
  const newsTitles = new Set(existingNews.docs.map((n) => n.title))
  const { idByPath: ids } = await importedIndex(payload)
  for (const teaser of sources.teasers) {
    if (newsPaths.has(teaser.href) || newsTitles.has(teaser.title)) continue
    const data = teaserNewsData(teaser, ctx.media)
    const link = data.link as Record<string, unknown>
    if (teaser.href.startsWith('/')) {
      const internal = ids.get(teaser.href)
      if (internal) link.internal = { relationTo: internal.collection, value: internal.id }
      else {
        link.linkType = 'external'
        link.url = `https://teachinghub.unibe.ch${teaser.href}/index_ger.html`
      }
    }
    try {
      await payload.create({ collection: 'news', data: data as never, locale: 'de', overrideAccess: true })
      report.teaserNews++
    } catch (error) {
      report.errors.push({ path: `Teaser „${teaser.title}“`, error: errorMessage(error) })
    }
  }
}

export async function runInitialImport(payload: Payload, log: (msg: string) => void = () => undefined): Promise<ImportReport> {
  const report = emptyReport()
  const sources = await loadSources()
  log(`${sources.docs.length} Seiten extrahiert, ${sources.teasers.length} Startseiten-Teaser`)
  const ctx = await prepareContext(payload, sources, report, log)
  log(`Mediathek: ${ctx.media.size} Dateien verfügbar, ${report.failedAssets.length} fehlgeschlagen`)
  await importDocs(payload, sources, ctx, report, log)
  return report
}

export function errorMessage(error: unknown): string {
  const data = (error as { data?: { errors?: { path?: string; message?: string }[] } })?.data
  if (data?.errors?.length) return data.errors.map((e) => `${e.path}: ${e.message}`).join('; ')
  return error instanceof Error ? error.message : String(error)
}

/**
 * Bereits importierte Seiten mit dem aktuellen Konverter neu umwandeln (z. B. nach Verbesserungen).
 * Lokal geänderte Felder bleiben unangetastet; die Altsite-Rohdaten müssen unverändert sein.
 */
export async function reconvertImported(payload: Payload, sources: Sources, ctx: ImportContext, report: ImportReport) {
  const { snapshots } = await importedIndex(payload)
  let updated = 0
  for (const doc of sources.docs) {
    const snapshot = snapshots.get(doc.path)
    if (!snapshot || snapshot.hash !== doc.hash) continue
    const collection = snapshot.targetCollection as ImportCollection
    try {
      const current = (await payload.findByID({ collection, id: snapshot.docId as number, depth: 0, locale: 'de', draft: true, overrideAccess: true })) as unknown as Record<string, unknown>
      const baseHashes = (snapshot.fieldHashes ?? {}) as Record<string, string>
      const local = locallyModified(collection, current, baseHashes)
      const built = buildData(doc, ctx.lookups, ctx.toLexical, ctx.media)
      // Relationen (Alternativen, Eltern) unverändert lassen – der Konverter betrifft nur Texte
      const fields = importedFields[collection].filter((f) => f !== 'alternatives' && !local.includes(f))
      const data = Object.fromEntries(fields.filter((f) => hashValue(built.data[f]) !== hashValue(current[f])).map((f) => [f, built.data[f]]))
      if (Object.keys(data).length === 0) continue
      const saved = (await payload.update({ collection, id: snapshot.docId as number, data: data as never, locale: 'de', depth: 0, overrideAccess: true })) as unknown as Record<string, unknown> & { id: number }
      // Basis für lokal geänderte Felder unverändert lassen
      await writeSnapshot(payload, doc, collection, saved, Object.fromEntries(local.map((f) => [f, baseHashes[f]])))
      updated++
    } catch (error) {
      report.errors.push({ path: doc.path, error: `Neu umwandeln: ${errorMessage(error)}` })
    }
  }
  return updated
}
