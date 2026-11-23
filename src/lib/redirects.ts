/**
 * Alte URLs der Altsite → neue Pfade (Entscheidung 7.2), als Regel statt Liste:
 * `/journey_der_lehre/tools/zoom/index_ger.html` → `/de/journey_der_lehre/tools/zoom`
 * `…/index_eng.html` → `/en/…`, `…/index_fra.html` → `/fr/…`; interne ZMS-Pfade werden mit abgebildet.
 */
const LANGUAGE: Record<string, 'de' | 'en' | 'fr'> = { ger: 'de', eng: 'en', fra: 'fr' }
const ZMS_PREFIX = '/unibe/portal/microsites/micro_teachinghub/content'

export function legacyRedirect(pathname: string): string | null {
  const match = pathname.match(/^(.*?)\/index_(ger|eng|fra)\.html$/)
  if (!match) return null
  let path = match[1]
  if (path.startsWith(ZMS_PREFIX)) path = path.slice(ZMS_PREFIX.length)
  return `/${LANGUAGE[match[2]]}${path}`
}
