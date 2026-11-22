import { ASSET_EXTENSIONS, DISALLOWED_PATH_PARTS, LEGACY_INTERNAL_PREFIX, LEGACY_ORIGIN } from './config'

const LEGACY_HOSTS = new Set(['teachinghub.unibe.ch', 'www.teachinghub.unibe.ch'])

/** Normalisiert eine Altsite-URL (Host ohne www, ohne Fragment); `null` wenn extern oder ungültig. */
export function normalizeLegacyUrl(href: string, base = LEGACY_ORIGIN + '/'): string | null {
  let url: URL
  try {
    url = new URL(href.replace(/&amp;/g, '&'), base)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol)) return null
  if (!LEGACY_HOSTS.has(url.hostname)) return null
  url.protocol = 'https:'
  url.hostname = 'teachinghub.unibe.ch'
  url.hash = ''
  // Interner ZMS-Pfad → öffentlicher Pfad
  if (url.pathname.startsWith(LEGACY_INTERNAL_PREFIX)) {
    url.pathname = url.pathname.slice(LEGACY_INTERNAL_PREFIX.length) || '/'
  }
  return url.toString()
}

/** Ist die URL eine (deutsche) HTML-Seite, die gecrawlt werden darf? */
export function isCrawlablePage(url: string): boolean {
  const { pathname, search } = new URL(url)
  if (search) return false
  if (DISALLOWED_PATH_PARTS.some((part) => pathname.includes(part))) return false
  return pathname.endsWith('/index_ger.html') || pathname === '/'
}

export function isAsset(url: string): boolean {
  const ext = new URL(url).pathname.split('.').pop()?.toLowerCase() ?? ''
  return ASSET_EXTENSIONS.includes(ext)
}

/**
 * Altsite-URL → neuer Pfad ohne Sprachpräfix (Entscheidung 7.2):
 * `/journey_der_lehre/tools/zoom/index_ger.html` → `/journey_der_lehre/tools/zoom`, Startseite → `/`.
 */
export function legacyUrlToPath(url: string): string {
  const pathname = new URL(url).pathname.replace(/\/index_(ger|eng|fra)\.html$/, '').replace(/\/$/, '')
  return pathname === '' ? '/' : pathname
}
