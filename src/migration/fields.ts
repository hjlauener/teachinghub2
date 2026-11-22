import { createHash } from 'crypto'

/** Felder, die der Importer pro Sammlung verantwortet (alles andere pflegt die Redaktion, Entscheidung 3.2). */
export const importedFields = {
  articles: ['title', 'lead', 'whatIsBehind', 'insights', 'gettingStarted', 'resources'],
  methods: ['title', 'lead', 'whatIsBehind', 'insights', 'gettingStarted', 'resources', 'alternatives'],
  tools: ['title', 'lead', 'whatIsBehind', 'insights', 'gettingStarted', 'resources'],
  pages: ['title', 'intro'],
  news: ['title', 'lead', 'body'],
} as const

export type ImportCollection = keyof typeof importedFields

/** Entfernt Array-IDs und andere technische Schlüssel, damit Hashes nur Inhalte vergleichen. */
export function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'id' || key === '$' || key === 'textFormat' || key === 'textStyle') continue
      out[key] = stripIds(v)
    }
    return out
  }
  return value
}

/** Relationen auf IDs reduzieren (z. B. `{ method: { id: 3, … } }` → `{ method: 3 }`). */
export function relationIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(relationIds)
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(record)) {
      out[key] =
        v && typeof v === 'object' && !Array.isArray(v) && 'id' in (v as object) && 'createdAt' in (v as object)
          ? (v as { id: unknown }).id
          : relationIds(v)
    }
    return out
  }
  return value
}

export function hashValue(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(stripIds(relationIds(value ?? null))))
    .digest('hex')
}

export function fieldHashes(collection: ImportCollection, data: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(importedFields[collection].map((f) => [f, hashValue(data[f])]))
}

/** Felder, die seit dem Import lokal geändert wurden (aktueller Hash ≠ Hash beim Import). */
export function locallyModified(
  collection: ImportCollection,
  current: Record<string, unknown>,
  importedHashes: Record<string, string> | null | undefined,
): string[] {
  if (!importedHashes) return []
  return importedFields[collection].filter((f) => importedHashes[f] && importedHashes[f] !== hashValue(current[f]))
}
