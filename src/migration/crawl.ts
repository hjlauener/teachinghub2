import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { JSDOM } from 'jsdom'
import path from 'path'

import {
  LEGACY_START,
  MANIFEST_FILE,
  METHODS_CSV_FILE,
  PAGES_DIR,
  REQUEST_DELAY_MS,
  SEARCH_FILE,
  SEARCH_INDEX_URL,
  USER_AGENT,
} from './config'
import { isAsset, isCrawlablePage, legacyUrlToPath, normalizeLegacyUrl } from './urls'

export type ManifestPage = {
  url: string
  path: string
  file: string
  status: number
  fetchedAt: string
  /** SHA-1 des rohen HTML – nur zur Erkennung unveränderter Downloads */
  rawSha1: string
}

export type Manifest = {
  crawledAt: string
  pages: ManifestPage[]
  assets: string[]
  errors: { url: string; error: string }[]
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function get(url: string): Promise<Response> {
  return fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow' })
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>()
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const normalized = normalizeLegacyUrl(match[1], baseUrl)
    if (normalized) links.add(normalized)
  }
  return [...links]
}

/** Methoden, die nur über die Tabelle verlinkt sind (Analyse 5.1), aus der CSV. */
export function methodUrlsFromCsv(csv: string): string[] {
  const urls = new Set<string>()
  for (const match of csv.matchAll(/(\/[^;"\s]*methodenkompass\/[^;"\s]+\/index_ger\.html)/g)) {
    const normalized = normalizeLegacyUrl(match[1])
    if (normalized) urls.add(normalized)
  }
  return [...urls]
}

/**
 * Seiten aus der Suchliste (Analyse 5.2) – manche sind nur über die Suche erreichbar,
 * weder über Startseite/Menü noch über die Methodenkompass-CSV.
 */
export function searchIndexUrls(html: string): string[] {
  const urls = new Set<string>()
  for (const article of new JSDOM(html).window.document.querySelectorAll('article.mdl-article_filter')) {
    const href = article.querySelector('a[href]')?.getAttribute('href')
    const normalized = href ? normalizeLegacyUrl(href) : null
    if (normalized && isCrawlablePage(normalized)) urls.add(normalized)
  }
  return [...urls]
}

/**
 * Höflicher Breitensuche-Crawl der Altsite: robots.txt-Regeln, Pause zwischen Anfragen, neutraler User-Agent.
 */
export async function crawl(options: { maxPages?: number; delayMs?: number; log?: (msg: string) => void } = {}): Promise<Manifest> {
  const { maxPages = 1000, delayMs = REQUEST_DELAY_MS, log = () => undefined } = options
  await fs.mkdir(PAGES_DIR, { recursive: true })

  const queue: string[] = [LEGACY_START]
  const seen = new Set<string>()
  const assets = new Set<string>()
  const manifest: Manifest = { crawledAt: new Date().toISOString(), pages: [], assets: [], errors: [] }

  // Methodenkompass-CSV zuerst, damit auch nur dort verlinkte Methoden in die Warteschlange kommen
  const methodsPage = await get(`${new URL(LEGACY_START).origin}/methodenkompass/index_ger.html`)
  const methodsHtml = await methodsPage.text()
  await sleep(delayMs)
  const csvMatch = methodsHtml.match(/["']([^"']+\.csv)["']/)
  if (csvMatch) {
    const csvUrl = normalizeLegacyUrl(csvMatch[1])
    if (csvUrl) {
      const csv = await (await get(csvUrl)).text()
      await fs.writeFile(METHODS_CSV_FILE, csv)
      const methodUrls = methodUrlsFromCsv(csv)
      queue.push(...methodUrls)
      log(`Methodenkompass-CSV: ${methodUrls.length} Methoden`)
      await sleep(delayMs)
    }
  }

  // Such-Index mit allen Rubrik-/Thema-Zuordnungen; seine Links sind zusätzliche Startpunkte
  // (Seiten, die nur über die Suche erreichbar sind). Fehlerhafte Einträge (z. B. 404) zählen
  // später im Durchlauf als Fehler, brechen aber nicht ab.
  const searchResponse = await get(SEARCH_INDEX_URL)
  const searchHtml = await searchResponse.text()
  if (searchResponse.ok) {
    await fs.writeFile(SEARCH_FILE, searchHtml)
    const searchUrls = searchIndexUrls(searchHtml)
    queue.push(...searchUrls)
    log(`Suchliste: ${searchUrls.length} Einträge`)
  } else {
    manifest.errors.push({ url: SEARCH_INDEX_URL, error: `HTTP ${searchResponse.status}` })
  }
  await sleep(delayMs)

  while (queue.length > 0 && manifest.pages.length < maxPages) {
    const url = queue.shift()!
    if (seen.has(url)) continue
    seen.add(url)
    try {
      const response = await get(url)
      const finalUrl = normalizeLegacyUrl(response.url) ?? url
      if (!response.ok || !(response.headers.get('content-type') ?? '').includes('html')) {
        manifest.errors.push({ url, error: `HTTP ${response.status}` })
        continue
      }
      const html = await response.text()
      const pagePath = legacyUrlToPath(finalUrl)
      const file = `${createHash('sha1').update(pagePath).digest('hex').slice(0, 16)}.html`
      await fs.writeFile(path.join(PAGES_DIR, file), html)
      manifest.pages.push({
        url: finalUrl,
        path: pagePath,
        file,
        status: response.status,
        fetchedAt: new Date().toISOString(),
        rawSha1: createHash('sha1').update(html).digest('hex'),
      })
      for (const link of extractLinks(html, finalUrl)) {
        if (isAsset(link)) assets.add(link)
        else if (isCrawlablePage(link) && !seen.has(link)) queue.push(link)
      }
      if (manifest.pages.length % 25 === 0) log(`${manifest.pages.length} Seiten …`)
    } catch (error) {
      manifest.errors.push({ url, error: String(error) })
    }
    await sleep(delayMs)
  }

  // Doppelte Pfade (z. B. Startseite unter / und /index_ger.html) entfernen
  const byPath = new Map(manifest.pages.map((p) => [p.path, p]))
  manifest.pages = [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path))
  manifest.assets = [...assets].sort()
  await fs.writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 1))
  return manifest
}

export async function readManifest(): Promise<Manifest> {
  return JSON.parse(await fs.readFile(MANIFEST_FILE, 'utf-8')) as Manifest
}
