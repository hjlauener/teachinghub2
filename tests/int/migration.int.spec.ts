import { readFileSync } from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { detectChanges, resolveEntry } from '@/migration/delta'
import { extractPage, parseMethodsCsv } from '@/migration/extract'
import { emptyReport, importDocs, prepareContext, type Sources } from '@/migration/run'
import { valueToText } from '@/migration/text'
import config from '@/payload.config'
import { seed } from '@/seed/seed'

/**
 * Abnahme Phase 2 mit künstlichen Testseiten (keine Altsite-Daten im Repository):
 * Erstimport, Delta-Abgleich erkennt Änderung, Konflikt mit lokaler Änderung, Übernehmen, Entfernt.
 */
let payload: Payload
const run = Math.random().toString(36).slice(2, 8)
const BASE = 'https://teachinghub.unibe.ch'
const fixture = (name: string) => readFileSync(path.resolve(__dirname, '../fixtures/legacy', name), 'utf-8')

const articlePath = `/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/test_${run}`
const methodPath = `/methodenkompass/test_${run}`
const otherMethodPath = '/methodenkompass/andere_methode'
// Angebotsseite unter Lehr|Impulse, die nur über die Suchliste gecrawlt wird
const offerPath = `/journey_der_lehre/lehrimpulse__unibe/beratung__services/test_angebot_${run}`
const paths = [articlePath, methodPath, otherMethodPath]

function sources(articleHtml = fixture('article.html'), withMethods = true): Sources {
  const csv = parseMethodsCsv(fixture('methods.csv')).map((row) =>
    row.path === '/methodenkompass/testmethode' ? { ...row, path: methodPath } : row,
  )
  const docs = [extractPage(articleHtml, `${BASE}${articlePath}/index_ger.html`)]
  if (withMethods) {
    docs.push(extractPage(fixture('method.html'), `${BASE}${methodPath}/index_ger.html`))
    docs.push(extractPage(fixture('method.html').replace(/Testmethode/g, 'Andere Methode'), `${BASE}${otherMethodPath}/index_ger.html`))
  }
  return { docs, teasers: [], search: new Map(), csv }
}

async function cleanup() {
  for (const p of [...paths, offerPath]) {
    for (const collection of ['articles', 'methods', 'legacy-snapshots', 'migration-inbox'] as const) {
      await payload.delete({ collection, where: { path: { equals: p } }, overrideAccess: true }).catch(() => undefined)
    }
  }
}

async function findByPath(collection: 'articles' | 'methods', p: string) {
  const { docs } = await payload.find({ collection, where: { path: { equals: p } }, depth: 0, draft: true, overrideAccess: true })
  return docs[0] as unknown as Record<string, unknown> & { id: number }
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  await seed(payload)
  await cleanup()
})

afterAll(async () => {
  await cleanup()
  await payload?.destroy()
})

describe('Erstimport', () => {
  it('legt Artikel und Methoden mit Zuordnungen und Verknüpfungen an', async () => {
    const src = sources()
    const report = emptyReport()
    const ctx = await prepareContext(payload, src, report, undefined, { downloadAssets: false })
    await importDocs(payload, src, ctx, report)
    expect(report.errors).toEqual([])
    expect(report.created).toMatchObject({ articles: 1, methods: 2 })

    const article = await findByPath('articles', articlePath)
    expect(article.title).toBe('Testartikel')
    expect((article.rubrics as number[]).length).toBe(1) // aus dem Pfad: lehre_konzipieren
    expect((article.themes as number[]).length).toBe(1) // aus dem Pfad: didaktische_grundlagen
    expect(valueToText(article.gettingStarted)).toContain('Tipp eins')
    expect(JSON.stringify(article.gettingStarted)).toContain('"blockType":"videoEmbed"')
    expect(JSON.stringify(article.gettingStarted)).toContain('"type":"table"')

    const method = await findByPath('methods', methodPath)
    expect(method._status).toBe('published')
    expect((method.purposes as number[]).length).toBe(2)
    const other = await findByPath('methods', otherMethodPath)
    expect(method.alternatives).toEqual([expect.objectContaining({ method: other.id, note: 'Vergleich in einem Satz.' })])
  })

  it('ein zweiter Lauf legt nichts doppelt an', async () => {
    const src = sources()
    const report = emptyReport()
    const ctx = await prepareContext(payload, src, report, undefined, { downloadAssets: false })
    await importDocs(payload, src, ctx, report)
    expect(report.created).toEqual({})
    expect(report.skipped).toBe(3)
  })
})

describe('Seiten aus der Suchliste', () => {
  it('importiert eine nur über die Suche erreichbare Seite wie die übrigen Angebote (Rubrik Lehrimpulse)', async () => {
    const doc = extractPage(fixture('article.html'), `${BASE}${offerPath}/index_ger.html`)
    const search = new Map([[offerPath, [{ key: 'LEHRIMPULSE1758246', name: 'Lehrimpulse' }, { key: 'BERATUNG', name: 'Beratung & Services' }]]])
    const src: Sources = { docs: [doc], teasers: [], search, csv: [] }
    const report = emptyReport()
    const ctx = await prepareContext(payload, src, report, undefined, { downloadAssets: false })
    await importDocs(payload, src, ctx, report)
    expect(report.errors).toEqual([])
    expect(report.created).toEqual({ articles: 1 })

    const offer = await findByPath('articles', offerPath)
    expect(offer.kind).toBe('offer')
    expect(offer._status).toBe('published')
    const rubrics = await payload.find({ collection: 'taxonomies', where: { id: { in: offer.rubrics as number[] } }, depth: 0, locale: 'de', overrideAccess: true })
    expect(rubrics.docs.map((d) => d.slug)).toEqual(['lehrimpulse__unibe'])
    expect((offer.themes as number[]).length).toBe(1)
  })
})

describe('Delta-Abgleich (Entscheidung 3.2)', () => {
  it('meldet nichts, solange die Altsite unverändert ist', async () => {
    const src = sources()
    const ctx = await prepareContext(payload, src, emptyReport(), undefined, { downloadAssets: false })
    const delta = await detectChanges(payload, src, ctx, { limitToPaths: paths })
    expect(delta).toMatchObject({ new: 0, changed: 0, removed: 0, unchanged: 3 })
  })

  it('erkennt eine Änderung und einen Konflikt mit lokaler Bearbeitung', async () => {
    // Redaktion ergänzt lokal denselben Abschnitt
    const article = await findByPath('articles', articlePath)
    const local = structuredClone(article.gettingStarted) as { root: { children: unknown[] } }
    local.root.children.unshift({
      type: 'paragraph',
      version: 1,
      format: '',
      indent: 0,
      direction: 'ltr',
      children: [{ type: 'text', version: 1, text: 'Lokale Ergänzung.', format: 0, detail: 0, mode: 'normal', style: '' }],
    })
    await payload.update({ collection: 'articles', id: article.id, data: { gettingStarted: local as never }, locale: 'de', overrideAccess: true })

    const src = sources(fixture('article.html').replace('Tipp eins', 'Tipp EINS (neu auf der Altsite)'))
    const ctx = await prepareContext(payload, src, emptyReport(), undefined, { downloadAssets: false })
    const delta = await detectChanges(payload, src, ctx, { limitToPaths: paths })
    expect(delta).toMatchObject({ changed: 1, conflicts: 1, unchanged: 2 })

    const { docs } = await payload.find({ collection: 'migration-inbox', where: { path: { equals: articlePath } }, overrideAccess: true })
    expect(docs[0].changedFields).toEqual(['gettingStarted'])
    expect(docs[0].conflicts).toEqual(['gettingStarted'])
  })

  it('Übernehmen verlangt eine Entscheidung pro Konflikt und übernimmt dann die Altsite-Fassung', async () => {
    const { docs } = await payload.find({ collection: 'migration-inbox', where: { path: { equals: articlePath } }, overrideAccess: true })
    await expect(resolveEntry(payload, docs[0].id, 'apply')).rejects.toThrow(/Konfliktfeld/)
    await resolveEntry(payload, docs[0].id, 'apply', { resolutions: { gettingStarted: 'legacy' } })

    const article = await findByPath('articles', articlePath)
    const text = valueToText(article.gettingStarted)
    expect(text).toContain('Tipp EINS (neu auf der Altsite)')
    expect(text).not.toContain('Lokale Ergänzung.')

    // Danach ist der neue Stand die Basis: kein erneuter Eintrag
    const src = sources(fixture('article.html').replace('Tipp eins', 'Tipp EINS (neu auf der Altsite)'))
    const ctx = await prepareContext(payload, src, emptyReport(), undefined, { downloadAssets: false })
    const delta = await detectChanges(payload, src, ctx, { limitToPaths: paths })
    expect(delta).toMatchObject({ changed: 0, unchanged: 3 })
  })

  it('verschwundene Seiten werden gemeldet und beim Übernehmen nur zurückgezogen', async () => {
    const src = sources(fixture('article.html').replace('Tipp eins', 'Tipp EINS (neu auf der Altsite)'), false)
    const ctx = await prepareContext(payload, src, emptyReport(), undefined, { downloadAssets: false })
    const delta = await detectChanges(payload, src, ctx, { limitToPaths: paths })
    expect(delta.removed).toBe(2)

    const { docs } = await payload.find({ collection: 'migration-inbox', where: { path: { equals: methodPath } }, overrideAccess: true })
    expect(docs[0].changeType).toBe('removed')
    await resolveEntry(payload, docs[0].id, 'apply')
    const method = await findByPath('methods', methodPath)
    expect(method).toBeDefined()
    expect(method._status).toBe('draft')
  })
})
