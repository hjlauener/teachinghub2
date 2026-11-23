/**
 * Reine Validierungsfunktionen – ohne Payload-Abhängigkeit, damit sie unit-testbar sind.
 * Rückgabe: `true` oder eine Fehlermeldung (Payload-Konvention).
 */

/**
 * Seitenpfad wie auf der Altsite, ohne Sprachpräfix und ohne `index_ger.html` (Entscheidung 7.2):
 * beginnt mit `/`, Kleinbuchstaben, Ziffern, `_` und `-`, Segmente durch `/` getrennt, kein `/` am Ende.
 */
export const PATH_PATTERN = /^\/[a-z0-9_-]+(\/[a-z0-9_-]+)*$/

export function validatePath(value: unknown): true | string {
  if (typeof value !== 'string' || value.length === 0) return 'Pfad fehlt.'
  if (value === '/') return true // Startseite
  if (!PATH_PATTERN.test(value)) {
    return 'Pfad muss mit „/“ beginnen und darf nur Kleinbuchstaben, Ziffern, „_“, „-“ und „/“ enthalten (kein „/“ am Ende).'
  }
  return true
}

/** Wandelt einen Titel in ein URL-Segment um (Umlaute wie die Altsite: ä → ae). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * „Kommentierter Link“: genau ein Satz (Landingpage-Konzept). Abkürzungen wie „z. B.“, „u. a.“,
 * „bzw.“ und Zahlen wie „1.“ zählen nicht als Satzende.
 */
const ABBREVIATIONS = [
  'z. B.', 'z.B.', 'u. a.', 'u.a.', 'd. h.', 'd.h.', 'z. T.', 'z.T.', 'o. J.', 'o.J.',
  'bzw.', 'ca.', 'etc.', 'evtl.', 'ggf.', 'inkl.', 'vgl.', 'usw.', 'Nr.', 'Dr.', 'Prof.', 'S.',
  'e.g.', 'i.e.', 'cf.', 'resp.',
]

export function countSentences(text: string): number {
  let cleaned = text.trim()
  if (cleaned === '') return 0
  for (const abbr of ABBREVIATIONS) cleaned = cleaned.split(abbr).join(abbr.replace(/\./g, ''))
  cleaned = cleaned.replace(/(\d)\.(?=\s|\d)/g, '$1') // Ordinalzahlen und Dezimalpunkte
  const ends = cleaned.match(/[.!?…]+(?=\s|$)/g)?.length ?? 0
  const endsWithTerminal = /[.!?…]$/.test(cleaned)
  return ends + (endsWithTerminal ? 0 : 1)
}

export function validateOneSentence(value: unknown): true | string {
  if (typeof value !== 'string' || value.trim() === '') return 'Ein Satz ist erforderlich.'
  if (countSentences(value) > 1) return 'Bitte genau einen Satz schreiben.'
  return true
}

export function validateUrl(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true
  if (typeof value !== 'string') return 'Ungültige URL.'
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? true : 'Nur http(s)-Links.'
  } catch {
    return 'Ungültige URL.'
  }
}

/**
 * Landingpages: Pflichtangaben und Anzahlen gelten erst, wenn die Seite „live“ ist (Konzept: Kapitel-Vorlagen).
 * Themen mit Status „folgt“ erscheinen in der Übersicht, ohne vollständig zu sein.
 */
export function validateCountWhenLive(value: unknown, data: { pageStatus?: unknown } | undefined, min?: number, max?: number): true | string {
  if (data?.pageStatus !== 'live') return true
  const count = Array.isArray(value) ? value.length : 0
  if (min !== undefined && count < min) return `Für eine live geschaltete Seite mindestens ${min} Einträge.`
  if (max !== undefined && count > max) return `Höchstens ${max} Einträge.`
  return true
}

export function validateRequiredWhenLive(value: unknown, data: { pageStatus?: unknown } | undefined): true | string {
  if (data?.pageStatus !== 'live') return true
  const empty =
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (typeof value === 'object' && 'root' in (value as object) && !((value as { root: { children?: unknown[] } }).root.children?.length))
  return empty ? 'Pflichtfeld für eine live geschaltete Seite.' : true
}
