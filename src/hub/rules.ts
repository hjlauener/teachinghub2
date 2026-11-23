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
