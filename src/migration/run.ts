import { promises as fs } from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { buildData, loadLookups, teaserNewsData } from './build'
import { METHODS_CSV_FILE, PAGES_DIR, SEARCH_FILE } from './config'
import { readManifest } from './crawl'
import { type ExtractedDoc, extractHomeTeasers, extractPage, parseMethodsCsv, parseSearchIndex } from './extract'
import { fieldHashes, type ImportCollection } from './fields'
import { createHtmlConverter } from './lexical'
import { importAssets } from './media'

export type ImportReport = {
  created: Record<string, number>
  skipped: number
  teaserNews: number
  warnings: { path: string; message: string }[]
  failedAssets: { url: string; error: string }[]
  errors: { path: string; error: string }[]
}

const ORDER: ImportCollection[] = ['pages', 'articles', 'tools', 'methods', 'news']

/** Alle Seiten der letzten Crawl-Daten extrahieren. */
export async function extractAll(): Promise<{ docs: ExtractedDoc[]; homeHtml: string; homeUrl: string }> {
  const manifest = await readManifest()
  const docs: ExtractedDoc[] = []
  let homeHtml = ''
  let homeUrl = ''
  for (const page of manifest.pages) {
    const html = await fs.readFile(path.join(PAGES_DIR, page.file), 'utf-8')
    if (page.path === '/') {
      homeHtml = html
      homeUrl = page.url
    }
    docs.push(extractPage(html, page.url))
  }
  return { docs, homeHtml, homeUrl }
}

/** Speichert den Import-Stand (Basis für den Delta-Abgleich). */
export async function writeSnapshot(
  payload: Payload,
  doc: ExtractedDoc,
  collection: ImportCollection,
  saved: Record<string, unknown> & { id: number },
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
    fieldHashes: fieldHashes(collection, saved),
  }
  const existing = await payload.find({ collection: 'legacy-snapshots', where: { path: { equals: doc.path } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]) await payload.update({ collection: 'legacy-snapshots', id: existing.docs[0].id, data, overrideAccess: true })
  else await payload.create({ collection: 'legacy-snapshots', data, overrideAccess: true })
}

/**
 * Erstimport (Plan Abschnitt 6, Schritt 1–2). Bereits importierte Pfade werden übersprungen –
 * spätere Änderungen laufen über den Delta-Abgleich und die Migrations-Inbox.
 */
export async function runInitialImport(payload: Payload, log: (msg: string) => void = () => undefined): Promise<ImportReport> {
  const report: ImportReport = { created: {}, skipped: 0, teaserNews: 0, warnings: [], failedAssets: [], errors: [] }
  const { docs, homeHtml, homeUrl } = await extractAll()
  const teasers = homeHtml ? extractHomeTeasers(homeHtml, homeUrl) : []
  const search = parseSearchIndex(await fs.readFile(SEARCH_FILE, 'utf-8'))
  const csv = parseMethodsCsv(await fs.readFile(METHODS_CSV_FILE, 'utf-8'))
  const lookups = await loadLookups(payload, search, csv, teasers)
  log(`${docs.length} Seiten extrahiert, ${teasers.length} Startseiten-Teaser`)

  const assets = [
    ...docs.flatMap((d) => d.assets),
    ...teasers.filter((t) => t.image).map((t) => ({ url: t.image as string, alt: '' })),
  ]
  const { media, failed } = await importAssets(payload, assets, log)
  report.failedAssets = failed
  log(`Mediathek: ${media.size} Dateien verfügbar, ${failed.length} fehlgeschlagen`)

  const toLexical = await createHtmlConverter(payload)
  const snapshots = await payload.find({ collection: 'legacy-snapshots', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  const known = new Set(snapshots.docs.map((s) => s.path))
  const snapshotData = new Map(snapshots.docs.map((s) => [s.path, (s.data ?? {}) as Record<string, unknown>]))
  const idByPath = new Map<string, { collection: ImportCollection; id: number }>(
    snapshots.docs.map((s) => [s.path, { collection: s.targetCollection as ImportCollection, id: s.docId as number }]),
  )

  // Durchgang 1: Dokumente anlegen
  for (const collection of ORDER) {
    for (const doc of docs.filter((d) => d.collection === collection)) {
      if (known.has(doc.path)) {
        report.skipped++
        continue
      }
      try {
        const built = buildData(doc, lookups, toLexical, media)
        built.warnings.forEach((message) => report.warnings.push({ path: doc.path, message }))
        const saved = (await payload.create({
          collection: built.collection,
          data: built.data as never,
          locale: 'de',
          depth: 0,
          overrideAccess: true,
        })) as unknown as Record<string, unknown> & { id: number }
        await writeSnapshot(payload, doc, built.collection, saved)
        idByPath.set(doc.path, { collection: built.collection, id: saved.id })
        report.created[collection] = (report.created[collection] ?? 0) + 1
      } catch (error) {
        report.errors.push({ path: doc.path, error: errorMessage(error) })
      }
    }
    log(`${collection}: ${report.created[collection] ?? 0} angelegt`)
  }

  // Durchgang 2: Eltern-Seiten und alternative Methoden verknüpfen – für neue Dokumente und für
  // ältere, deren Import-Stand die Verknüpfung noch nicht enthält (z. B. nach abgebrochenem Lauf)
  for (const doc of docs) {
    const target = idByPath.get(doc.path)
    if (!target) continue
    const base = known.has(doc.path) ? snapshotData.get(doc.path) : undefined
    const missing = (field: string) => !base || base[field] === null || base[field] === undefined || (Array.isArray(base[field]) && (base[field] as unknown[]).length === 0)
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

  // Startseiten-Teaser ohne eigene News-Seite → News mit Link
  const newsPaths = new Set(docs.filter((d) => d.collection === 'news').map((d) => d.path))
  const existingNews = await payload.find({ collection: 'news', limit: 0, pagination: false, depth: 0, locale: 'de', overrideAccess: true })
  const newsTitles = new Set(existingNews.docs.map((n) => n.title))
  for (const teaser of teasers) {
    if (newsPaths.has(teaser.href) || newsTitles.has(teaser.title)) continue
    const data = teaserNewsData(teaser, media)
    const internal = teaser.href.startsWith('/') ? idByPath.get(teaser.href) : undefined
    const link = data.link as Record<string, unknown>
    if (teaser.href.startsWith('/')) {
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
  return report
}

export function errorMessage(error: unknown): string {
  const data = (error as { data?: { errors?: { path?: string; message?: string }[] } })?.data
  if (data?.errors?.length) return data.errors.map((e) => `${e.path}: ${e.message}`).join('; ')
  return error instanceof Error ? error.message : String(error)
}
