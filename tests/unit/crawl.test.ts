// @vitest-environment node
import { mkdtempSync, readFileSync, rmSync } from 'fs'
import os from 'os'
import path from 'path'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

// Rohdaten des Tests in ein temporäres Verzeichnis statt nach data/legacy/
const tmp = mkdtempSync(path.join(os.tmpdir(), 'th2-crawl-'))
vi.mock('@/migration/config', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/migration/config')>()
  return {
    ...original,
    DATA_DIR: tmp,
    PAGES_DIR: path.join(tmp, 'pages'),
    MANIFEST_FILE: path.join(tmp, 'manifest.json'),
    SEARCH_FILE: path.join(tmp, 'search.html'),
    METHODS_CSV_FILE: path.join(tmp, 'methodenkompass.csv'),
  }
})

const { crawl, searchIndexUrls } = await import('@/migration/crawl')
const { SEARCH_INDEX_URL } = await import('@/migration/config')

const fixture = (name: string) => readFileSync(path.resolve(__dirname, '../fixtures/legacy', name), 'utf-8')
const BASE = 'https://teachinghub.unibe.ch'
const ONLY_SEARCH = `${BASE}/journey_der_lehre/beispiel_rubrik/beispiel_thema/nur_ueber_suche/index_ger.html`
const SECOND = `${BASE}/journey_der_lehre/beispiel_rubrik/beispiel_thema/zweite_seite/index_ger.html`
const METHOD = `${BASE}/methodenkompass/beispielmethode/index_ger.html`

afterEach(() => vi.unstubAllGlobals())
afterAll(() => rmSync(tmp, { recursive: true, force: true }))

describe('Suchliste als Startpunkte des Crawls', () => {
  it('liest alle crawlbaren Links der Suchkarten (ohne Duplikate, extern, robots.txt, Abfragen)', () => {
    expect(searchIndexUrls(fixture('search.html')).sort()).toEqual([METHOD, ONLY_SEARCH, SECOND].sort())
  })

  it('crawlt Seiten, die nur über die Suche erreichbar sind, und zählt 404 als Fehler ohne Abbruch', async () => {
    const page = (body: string) => new Response(`<html><body>${body}</body></html>`, { headers: { 'content-type': 'text/html' } })
    const responses = new Map<string, () => Response>([
      [`${BASE}/index_ger.html`, () => page('Startseite ohne Links auf die Suchseiten')],
      [`${BASE}/methodenkompass/index_ger.html`, () => page('Kompass ohne CSV')],
      [SEARCH_INDEX_URL, () => new Response(fixture('search.html'), { headers: { 'content-type': 'text/html' } })],
      [ONLY_SEARCH, () => page('Nur über die Suche')],
      [METHOD, () => page('Methode')],
    ])
    const requested: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL) => {
        const url = String(input)
        requested.push(url)
        const response = responses.get(url)?.() ?? new Response('Nicht gefunden', { status: 404, headers: { 'content-type': 'text/html' } })
        Object.defineProperty(response, 'url', { value: url })
        return response
      }),
    )

    const manifest = await crawl({ delayMs: 0 })

    expect(manifest.pages.map((p) => p.path)).toEqual([
      '/',
      '/journey_der_lehre/beispiel_rubrik/beispiel_thema/nur_ueber_suche',
      '/methodenkompass/beispielmethode',
    ])
    expect(manifest.errors).toEqual([{ url: SECOND, error: 'HTTP 404' }])
    // Jede Seite nur einmal angefragt, auch wenn sie doppelt in der Suchliste steht
    expect(requested.filter((u) => u === ONLY_SEARCH)).toHaveLength(1)
    expect(readFileSync(path.join(tmp, 'search.html'), 'utf-8')).toBe(fixture('search.html'))
  })
})
