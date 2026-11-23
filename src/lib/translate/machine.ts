import { createHash } from 'crypto'
import type { Payload } from 'payload'

import type { TranslationProvider } from './provider'

/**
 * Übersetzt die Textknoten von Feldwerten (Strings, Lexical, Listen, Gruppen) – Struktur, Links und
 * Formatierung bleiben erhalten. Ergebnisse werden pro Feld und DE-Hash gecacht (nur bei Änderung neu).
 */
type Node = Record<string, unknown>

const SKIP_KEYS = new Set(['id', 'url', 'path', 'blockType', 'type', 'format', 'mode', 'style', 'direction', 'tag', 'listType', 'linkType', 'relationTo', 'value', 'fields', 'version', 'detail', 'indent', 'textFormat', 'headerState', 'colSpan', 'rowSpan', 'checked', 'newTab'])

/** Alle übersetzbaren Texte eines Wertes in fester Reihenfolge sammeln. */
export function collectTexts(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    if (value.trim()) out.push(value)
  } else if (Array.isArray(value)) value.forEach((v) => collectTexts(v, out))
  else if (value && typeof value === 'object') {
    const node = value as Node
    if (node.type === 'text' && typeof node.text === 'string') {
      if (node.text.trim()) out.push(node.text)
      return out
    }
    for (const [key, v] of Object.entries(node)) if (!SKIP_KEYS.has(key)) collectTexts(v, out)
  }
  return out
}

/** Texte in derselben Reihenfolge wieder einsetzen. */
export function applyTexts<T>(value: T, texts: string[]): T {
  let i = 0
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return v.trim() ? (texts[i++] ?? v) : v
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') {
      const node = v as Node
      if (node.type === 'text' && typeof node.text === 'string') {
        return node.text.trim() ? { ...node, text: texts[i++] ?? node.text } : node
      }
      return Object.fromEntries(Object.entries(node).map(([k, val]) => [k, SKIP_KEYS.has(k) ? val : walk(val)]))
    }
    return v
  }
  return walk(value) as T
}

const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex').slice(0, 32)

export async function translateFields<T extends Record<string, unknown>>(
  payload: Payload,
  provider: TranslationProvider,
  doc: T,
  ref: { collection: string; id: number },
  fields: string[],
  target: 'en' | 'fr',
): Promise<T> {
  const result: Record<string, unknown> = { ...doc }
  for (const field of fields) {
    const value = doc[field]
    if (value === null || value === undefined) continue
    const key = `${ref.collection}:${ref.id}:${field}:${target}:${hash(value)}`
    const cached = await payload.find({ collection: 'translation-cache', where: { key: { equals: key } }, limit: 1, overrideAccess: true })
    if (cached.docs[0]) {
      result[field] = cached.docs[0].value
      continue
    }
    const texts = collectTexts(value)
    if (texts.length === 0) continue
    const translated = applyTexts(value, await provider.translate(texts, target))
    result[field] = translated
    await payload.create({ collection: 'translation-cache', data: { key, value: translated as never, provider: provider.name }, overrideAccess: true })
  }
  return result as T
}
