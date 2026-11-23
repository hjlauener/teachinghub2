/**
 * Regeln der persönlichen Funktionen (Phase 5, Entscheidungen 8.1, 2.3). Reine Funktionen, ohne Datenbank.
 */

/** Inhalte, die man liken und merken kann. */
export const HUB_COLLECTIONS = ['articles', 'methods', 'tools', 'news', 'pages', 'topics', 'subtopics'] as const
export type HubCollection = (typeof HUB_COLLECTIONS)[number]

export type ContentRef = { collection: HubCollection; id: number }

/** Ab dieser Zahl ist der Like-Zähler öffentlich (Entscheidung 8.1). */
export const LIKE_THRESHOLD = 3

/** Maximale Länge einer Notiz zu einem Bookmark. */
export const NOTE_MAX = 2000

export const isHubCollection = (value: unknown): value is HubCollection =>
  typeof value === 'string' && (HUB_COLLECTIONS as readonly string[]).includes(value)

/** Verweis auf einen Inhalt aus einer Anfrage prüfen (Collection aus der Liste, positive Ganzzahl). */
export function parseRef(input: unknown): ContentRef | null {
  if (!input || typeof input !== 'object') return null
  const { collection, id } = input as { collection?: unknown; id?: unknown }
  const num = typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id
  if (!isHubCollection(collection) || typeof num !== 'number' || !Number.isSafeInteger(num) || num <= 0) return null
  return { collection, id: num }
}

/** Öffentlich sichtbarer Zähler: erst ab der Schwelle, sonst nichts (schützt Anonymität bei wenigen Likes). */
export const publicLikeCount = (count: number): number | null => (count >= LIKE_THRESHOLD ? count : null)

/** Notiz bereinigen: getrimmt, Steuerzeichen ausser Zeilenumbruch entfernt, höchstens NOTE_MAX Zeichen. */
export function normalizeNote(value: unknown): string | null {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') return null
  const clean = value.replace(/\r\n/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim()
  return clean.length > NOTE_MAX ? null : clean
}

/**
 * Rücksprung nach der Anmeldung (z. B. Gast klickt „Merken“): nur lokale Pfade mit Sprachpräfix,
 * keine fremden Hosts („//evil“, „/\evil“), keine Steuerzeichen.
 */
export function safeReturnPath(value: unknown, locale: string): string {
  const fallback = `/${locale}/mein-hub`
  if (typeof value !== 'string' || value.length > 500) return fallback
  if (!/^\/(de|en|fr)(\/[^\s\\]*)?(\?[^\s\\]*)?(#[^\s\\]*)?$/.test(value)) return fallback
  if (value.startsWith('//') || value.includes('/../') || /[\u0000-\u001F]/.test(value)) return fallback
  return value
}

/** Same-Origin-Prüfung für schreibende Anfragen (zusätzlich zu SameSite-Cookies). */
export function isAllowedOrigin(origin: string | null, fetchSite: string | null, allowed: string[]): boolean {
  if (origin) return allowed.includes(origin)
  // Ohne Origin-Header (ältere Clients): nur, wenn der Browser die Anfrage nicht als fremd kennzeichnet
  return fetchSite !== 'cross-site' && fetchSite !== 'same-site'
}

/** Erlaubte Origins aus der Konfiguration (Basis-URL + vertrauenswürdige Origins). */
export function allowedOrigins(env: Record<string, string | undefined> = process.env): string[] {
  const list = [env.BETTER_AUTH_URL, ...(env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',')]
  return list
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return new URL(value).origin
      } catch {
        return null
      }
    })
    .filter((value): value is string => Boolean(value))
}

/* ---------- Phase 5, Teil 2: Sammlungen, Teilen, Feedback ---------- */

/** „Meine Methoden“ und „Meine Tools“ (Entscheidung 2.3). */
export const COLLECTION_KINDS = ['methods', 'tools'] as const
export type CollectionKind = (typeof COLLECTION_KINDS)[number]
export const isCollectionKind = (value: unknown): value is CollectionKind =>
  value === 'methods' || value === 'tools'

export const TITLE_MAX = 200
export const MESSAGE_MAX = 1000
export const FEEDBACK_MESSAGE_MAX = 5000
export const PLACE_MAX = 300

/**
 * Freitext bereinigen: getrimmt, Steuerzeichen entfernt (Zeilenumbrüche nur mehrzeilig), Länge begrenzt.
 * Liefert null bei ungültiger Eingabe (falscher Typ, zu lang, leer trotz Pflicht).
 */
export function normalizeText(value: unknown, max: number, options: { required?: boolean; multiline?: boolean } = {}): string | null {
  if (value === undefined || value === null) return options.required ? null : ''
  if (typeof value !== 'string') return null
  let clean = value.replace(/\r\n/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, options.multiline ? '' : ' ')
  if (!options.multiline) clean = clean.replace(/\s+/g, ' ')
  clean = clean.trim()
  if (clean.length > max) return null
  if (options.required && !clean) return null
  return clean
}

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

/** Rechte an einer Sammlung: Besitzer:in alles; Geteilte lesen, optional bearbeiten (Entscheidung 8.3). */
export type CollectionAccess = { read: boolean; edit: boolean; manage: boolean }
export function collectionAccess(ownerId: string, memberId: string, share: { canEdit: boolean } | null): CollectionAccess {
  if (ownerId === memberId) return { read: true, edit: true, manage: true }
  if (share) return { read: true, edit: share.canEdit, manage: false }
  return { read: false, edit: false, manage: false }
}

/** Suche nach Mitgliedern zum Teilen: ab 3 Zeichen; Platzhalter von LIKE werden maskiert. */
export const MEMBER_SEARCH_MIN = 3
export const MEMBER_SEARCH_LIMIT = 8
export function memberSearchPattern(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const term = value.trim()
  if (term.length < MEMBER_SEARCH_MIN || term.length > 100) return null
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
}

/* Feedback (Entscheidungen 8.2, 8.2a, 8.2b) */
export const FEEDBACK_KINDS = ['fehler', 'verbesserung', 'idee', 'frage'] as const
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]
export const isFeedbackKind = (value: unknown): value is FeedbackKind =>
  typeof value === 'string' && (FEEDBACK_KINDS as readonly string[]).includes(value)

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024
export type ImageType = 'image/png' | 'image/jpeg' | 'image/webp'

/** Bildtyp anhand der ersten Bytes (nicht der Dateiendung/Angabe des Browsers). */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  const starts = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b)
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (starts([0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return 'image/webp'
  return null
}

export const imageExtension = (type: ImageType) => ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' })[type]

/**
 * „Stelle“ im Feedback (Entscheidung 8.2b): Seitentitel und die Abschnittsüberschrift, die in der Ansicht
 * zuletzt oberhalb der Bildschirmmitte beginnt. Im Dialog änderbar.
 */
export function feedbackPlace(pageTitle: string, heading: string | null | undefined): string {
  const title = pageTitle.replace(/\s+/g, ' ').trim()
  const section = (heading ?? '').replace(/\s+/g, ' ').trim()
  const place = section && section !== title ? `${title} › ${section}` : title
  return place.length > PLACE_MAX ? `${place.slice(0, PLACE_MAX - 1)}…` : place
}

/** Öffentliches Teilen (Entscheidung 8.3): Link kopieren, E-Mail, LinkedIn. */
export function publicShareLinks(url: string, title: string): { mail: string; linkedin: string } {
  return {
    mail: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  }
}

/** Missbrauchsschutz (Entscheidung 9.1): höchstens so viele Feedbacks bzw. geteilte Einträge pro Stunde und Mitglied. */
export const FEEDBACK_PER_HOUR = 10
export const SHARES_PER_HOUR = 50
