import type { ScoredChunk } from './index-repo'

/** Auswahl aus Suchtreffern (rein, getestet). */

/** Treffer pro Abschnitt nur einmal: bevorzugt die Sprache der Seite, sonst Deutsch. */
export function preferLocale(chunks: ScoredChunk[], locale: string): ScoredChunk[] {
  const byPart = new Map<string, ScoredChunk>()
  for (const c of chunks) {
    const key = `${c.collection}:${c.docId}:${c.part}`
    const current = byPart.get(key)
    const better = !current || (c.locale === locale && current.locale !== locale) || (current.locale !== locale && c.score > current.score)
    if (better) byPart.set(key, c)
  }
  return [...byPart.values()]
}

/** Vorschläge, wenn nichts passt: die ähnlichsten Seiten (je einmal), auch unter dem Schwellwert. */
export function suggestionsFrom(nearest: ScoredChunk[], max = 3): { title: string; path: string }[] {
  const seen = new Set<string>()
  const out: { title: string; path: string }[] = []
  for (const c of [...nearest].sort((a, b) => b.score - a.score)) {
    if (!c.path || seen.has(c.path)) continue
    seen.add(c.path)
    out.push({ title: c.title, path: c.path })
    if (out.length >= max) break
  }
  return out
}

