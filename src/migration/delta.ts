import type { Payload } from 'payload'

import { buildData } from './build'
import { crawl } from './crawl'
import type { ExtractedDoc } from './extract'
import { hashValue, type ImportCollection, importedFields, locallyModified } from './fields'
import {
  errorMessage,
  emptyReport,
  type ImportContext,
  importedIndex,
  type ImportReport,
  loadSources,
  prepareContext,
  type Sources,
  writeSnapshot,
} from './run'
import { valueToText } from './text'

/**
 * Delta-Abgleich (Plan Abschnitt 6, Schritt 3; Entscheidung 3.2):
 * Altsite ist Quelle; Änderungen landen in der Migrations-Inbox, nichts wird automatisch überschrieben.
 */

export type DeltaReport = ImportReport & { new: number; changed: number; removed: number; unchanged: number; conflicts: number }

export type FieldDiff = { field: string; base: string; proposed: string; current: string; conflict: boolean }

type Source = Pick<ExtractedDoc, 'path' | 'legacyUrl' | 'legacyDate' | 'hash' | 'collection'>

const INBOX = 'migration-inbox'

function pick(collection: ImportCollection, data: Record<string, unknown>) {
  return Object.fromEntries(importedFields[collection].map((f) => [f, data[f] ?? null]))
}

async function openEntryFor(payload: Payload, path: string) {
  const { docs } = await payload.find({
    collection: INBOX,
    where: { and: [{ path: { equals: path } }, { status: { in: ['open', 'later', 'ignored'] } }] },
    sort: '-detectedAt',
    limit: 5,
    overrideAccess: true,
  })
  return docs
}

async function upsertEntry(payload: Payload, path: string, newHash: string, data: Record<string, unknown>): Promise<boolean> {
  const existing = await openEntryFor(payload, path)
  // Bewusst ignorierte Änderung mit gleichem Stand nicht erneut melden
  if (existing.some((e) => e.status === 'ignored' && e.newHash === newHash)) return false
  const active = existing.find((e) => e.status === 'open' || e.status === 'later')
  const entry = { ...data, path, newHash, detectedAt: new Date().toISOString() }
  if (active) await payload.update({ collection: INBOX, id: active.id, data: { ...entry, status: active.status } as never, overrideAccess: true })
  else await payload.create({ collection: INBOX, data: { ...entry, status: 'open' } as never, overrideAccess: true })
  return true
}

/** Vergleicht extrahierte Altsite-Seiten mit dem Import-Stand und füllt die Inbox. */
export async function detectChanges(
  payload: Payload,
  sources: Sources,
  ctx: ImportContext,
  options: { limitToPaths?: string[] } = {},
): Promise<DeltaReport> {
  const report: DeltaReport = { ...emptyReport(), new: 0, changed: 0, removed: 0, unchanged: 0, conflicts: 0 }
  const { snapshots, idByPath } = await importedIndex(payload)
  const seen = new Set<string>()

  for (const doc of sources.docs) {
    seen.add(doc.path)
    const snapshot = snapshots.get(doc.path)
    const source: Source = { path: doc.path, legacyUrl: doc.legacyUrl, legacyDate: doc.legacyDate, hash: doc.hash, collection: doc.collection }
    try {
      if (snapshot && snapshot.hash === doc.hash) {
        report.unchanged++
        continue
      }
      const built = buildData(doc, ctx.lookups, ctx.toLexical, ctx.media)
      if (built.collection === 'methods') {
        built.data.alternatives = doc.sections.alternatives
          .map((a) => ({ method: idByPath.get(a.path)?.id, note: a.note || null }))
          .filter((a) => a.method)
      }
      if (doc.parentPath) {
        const parent = idByPath.get(doc.parentPath)
        if (parent?.collection === built.collection) built.data.parent = parent.id
      }

      if (!snapshot) {
        const created = await upsertEntry(payload, doc.path, doc.hash, {
          changeType: 'new',
          targetCollection: built.collection,
          legacyUrl: doc.legacyUrl,
          legacyDate: doc.legacyDate,
          source,
          proposed: built.data,
          changedFields: importedFields[built.collection],
          conflicts: [],
          diffs: importedFields[built.collection].map((f) => ({ field: f, base: '', proposed: valueToText(built.data[f]), current: '', conflict: false })),
          summary: `Neue Seite auf der Altsite: ${doc.title}`,
        })
        if (created) report.new++
        continue
      }

      const collection = snapshot.targetCollection as ImportCollection
      const baseHashes = (snapshot.fieldHashes ?? {}) as Record<string, string>
      const proposed = pick(collection, built.data)
      const changedFields = importedFields[collection].filter((f) => hashValue(proposed[f]) !== baseHashes[f])
      if (changedFields.length === 0) {
        // Nur nicht übernommene Teile geändert → Import-Stand nachführen
        await payload.update({ collection: 'legacy-snapshots', id: snapshot.id, data: { hash: doc.hash, legacyDate: doc.legacyDate }, overrideAccess: true })
        report.unchanged++
        continue
      }
      const current = (await payload.findByID({
        collection,
        id: snapshot.docId as number,
        depth: 0,
        locale: 'de',
        draft: true,
        overrideAccess: true,
      })) as unknown as Record<string, unknown>
      const local = locallyModified(collection, current, baseHashes)
      const conflicts = changedFields.filter((f) => local.includes(f))
      const base = (snapshot.data ?? {}) as Record<string, unknown>
      const diffs: FieldDiff[] = changedFields.map((f) => ({
        field: f,
        base: valueToText(base[f]),
        proposed: valueToText(proposed[f]),
        current: valueToText(current[f]),
        conflict: conflicts.includes(f),
      }))
      const created = await upsertEntry(payload, doc.path, doc.hash, {
        changeType: 'changed',
        targetCollection: collection,
        docId: snapshot.docId,
        legacyUrl: doc.legacyUrl,
        legacyDate: doc.legacyDate,
        oldHash: snapshot.hash,
        source,
        proposed,
        changedFields,
        conflicts,
        diffs,
        summary: `Geändert: ${changedFields.join(', ')}${conflicts.length ? ` – Konflikt bei ${conflicts.join(', ')}` : ''}`,
      })
      if (created) {
        report.changed++
        if (conflicts.length) report.conflicts++
      }
    } catch (error) {
      report.errors.push({ path: doc.path, error: errorMessage(error) })
    }
  }

  // Auf der Altsite verschwunden (optional nur innerhalb eines Pfad-Ausschnitts, z. B. in Tests)
  const scope = options.limitToPaths ? new Set(options.limitToPaths) : null
  for (const [path, snapshot] of snapshots) {
    if (seen.has(path) || (scope && !scope.has(path))) continue
    const created = await upsertEntry(payload, path, 'removed', {
      changeType: 'removed',
      targetCollection: snapshot.targetCollection,
      docId: snapshot.docId,
      legacyUrl: snapshot.legacyUrl,
      oldHash: snapshot.hash,
      source: { path, legacyUrl: snapshot.legacyUrl, legacyDate: snapshot.legacyDate, hash: 'removed', collection: snapshot.targetCollection },
      changedFields: [],
      conflicts: [],
      diffs: [],
      summary: 'Seite ist auf der Altsite nicht mehr vorhanden.',
    })
    if (created) report.removed++
  }
  return report
}

export type Resolution = 'legacy' | 'local'

/** Inbox-Eintrag übernehmen, ignorieren oder zurückstellen. Konflikte brauchen eine Entscheidung pro Feld. */
export async function resolveEntry(
  payload: Payload,
  id: number,
  action: 'apply' | 'ignore' | 'later',
  options: { resolutions?: Record<string, Resolution>; userId?: number } = {},
) {
  const entry = await payload.findByID({ collection: INBOX, id, overrideAccess: true, depth: 0 })
  if (!['open', 'later'].includes(entry.status)) throw new Error('Eintrag ist bereits erledigt.')
  const done = { resolvedAt: new Date().toISOString(), resolvedBy: options.userId ?? null }

  if (action === 'later') return payload.update({ collection: INBOX, id, data: { status: 'later' }, overrideAccess: true })
  if (action === 'ignore') return payload.update({ collection: INBOX, id, data: { status: 'ignored', ...done }, overrideAccess: true })

  const source = entry.source as Source
  const collection = entry.targetCollection as ImportCollection
  const proposed = (entry.proposed ?? {}) as Record<string, unknown>

  if (entry.changeType === 'new') {
    const saved = (await payload.create({ collection, data: proposed as never, locale: 'de', depth: 0, overrideAccess: true })) as unknown as Record<string, unknown> & { id: number }
    await writeSnapshot(payload, source, collection, saved)
    return payload.update({ collection: INBOX, id, data: { status: 'applied', docId: saved.id, ...done }, overrideAccess: true })
  }

  if (entry.changeType === 'removed') {
    // Nicht löschen, nur zurückziehen (Entwurf) – die Redaktion entscheidet über das endgültige Löschen
    await payload.update({ collection, id: entry.docId as number, data: { _status: 'draft' } as never, overrideAccess: true })
    return payload.update({ collection: INBOX, id, data: { status: 'applied', ...done }, overrideAccess: true })
  }

  // Geändert: Konflikte müssen entschieden sein
  const conflicts = (entry.conflicts ?? []) as string[]
  const resolutions = options.resolutions ?? {}
  const unresolved = conflicts.filter((f) => !resolutions[f])
  if (unresolved.length) throw new Error(`Bitte für jedes Konfliktfeld entscheiden: ${unresolved.join(', ')}`)
  const changed = (entry.changedFields ?? []) as string[]
  const keepLocal = changed.filter((f) => resolutions[f] === 'local')
  const data = Object.fromEntries(changed.filter((f) => !keepLocal.includes(f)).map((f) => [f, proposed[f]]))
  const saved = (await payload.update({
    collection,
    id: entry.docId as number,
    data: data as never,
    locale: 'de',
    depth: 0,
    overrideAccess: true,
  })) as unknown as Record<string, unknown> & { id: number }
  // Behaltene lokale Fassungen bleiben „lokal geändert“ gegenüber dem neuen Altsite-Stand
  await writeSnapshot(payload, source, collection, saved, Object.fromEntries(keepLocal.map((f) => [f, hashValue(proposed[f])])))
  // TODO Phase 3: Übersetzungs-Cache der geänderten Felder verwerfen, menschliche Übersetzungen als „veraltet“ markieren
  return payload.update({ collection: INBOX, id, data: { status: 'applied', ...done }, overrideAccess: true })
}

let running: Promise<DeltaReport> | null = null

/** Vollständiger Lauf: Crawl → Extraktion → Abgleich. Läuft höchstens einmal gleichzeitig. */
export function runDelta(payload: Payload, options: { crawl?: boolean; log?: (msg: string) => void } = {}): Promise<DeltaReport> {
  if (running) return running
  const log = options.log ?? ((msg: string) => payload.logger.info(`[Delta] ${msg}`))
  running = (async () => {
    if (options.crawl !== false) {
      const manifest = await crawl({ log })
      log(`Crawl: ${manifest.pages.length} Seiten`)
    }
    const sources = await loadSources()
    const report = emptyReport()
    const ctx = await prepareContext(payload, sources, report, log)
    const delta = await detectChanges(payload, sources, ctx)
    delta.failedAssets.push(...report.failedAssets)
    log(`neu ${delta.new}, geändert ${delta.changed} (Konflikte ${delta.conflicts}), entfernt ${delta.removed}, unverändert ${delta.unchanged}`)
    return delta
  })().finally(() => {
    running = null
  })
  return running
}

export const isDeltaRunning = () => running !== null
