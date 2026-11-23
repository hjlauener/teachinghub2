import 'server-only'

import { hubDatabase } from '@/hub/database'

import { decryptApiKey, keyringFromEnv } from './crypto'
import { configuredEmbedder, type Embedder } from './embed'
import { nearestChunks, type ScoredChunk } from './index-repo'
import { preferLocale } from './select'
import { generate, ProviderError } from './providers'
import type { QuestionSource, StoredKey } from './repo'

export { suggestionsFrom } from './select'
import { buildUserMessage, isNoSource, selectHits, SYSTEM_PROMPT } from './rules'

/**
 * Ablauf einer Frage (Entscheidungen 8.6, 8.7): lokale Suche im Index → nur bei passenden Quellen eine
 * Anfrage an den Anbieter des Mitglieds (spart dessen Tokens) → Antwort mit nummerierten Quellen.
 */
export type RetrievedSource = QuestionSource & { text: string; score: number }

export async function retrieve(question: string, locale: string, embedder: Embedder = configuredEmbedder()): Promise<{ sources: RetrievedSource[]; nearest: ScoredChunk[] }> {
  const [vector] = await embedder.embed([question])
  const nearest = preferLocale(await nearestChunks(hubDatabase(), vector, embedder.name, 40), locale)
  const hits = selectHits(nearest, embedder.minScore)
  const sources = hits.map((c, i) => ({
    n: i + 1,
    collection: c.collection,
    docId: c.docId,
    title: c.title,
    path: c.path,
    anchor: c.anchor,
    label: c.label,
    text: c.text,
    score: c.score,
  }))
  return { sources, nearest }
}

export type AnswerResult = { outcome: 'answered' | 'no_source' | 'error'; text: string; inputTokens: number; outputTokens: number; error?: ProviderError['code'] | 'refused' }

export async function answer(question: string, sources: RetrievedSource[], key: StoredKey, memberId: string, onText: (delta: string) => void, signal?: AbortSignal): Promise<AnswerResult> {
  // Den Marker NO_SOURCE nicht als Teilantwort anzeigen: erst weitergeben, wenn klar ist, dass es kein Marker ist
  let buffer = ''
  let passing = false
  const relay = (delta: string) => {
    if (passing) return onText(delta)
    buffer += delta
    if (!'NO_SOURCE'.startsWith(buffer.trimStart().slice(0, 9)) || buffer.trimStart().length > 12) {
      if (isNoSource(buffer)) return
      passing = true
      onText(buffer)
    }
  }
  try {
    const apiKey = decryptApiKey(key.keyEncrypted, memberId, keyringFromEnv())
    const result = await generate({
      provider: key.provider,
      model: key.model,
      apiKey,
      baseUrl: key.baseUrl,
      system: SYSTEM_PROMPT,
      user: buildUserMessage(question, sources.map((s) => ({ n: s.n, title: s.title, section: s.label, text: s.text }))),
      onText: relay,
      signal,
    })
    if (result.refused) return { outcome: 'error', text: '', inputTokens: result.inputTokens, outputTokens: result.outputTokens, error: 'refused' }
    if (isNoSource(result.text)) return { outcome: 'no_source', text: '', inputTokens: result.inputTokens, outputTokens: result.outputTokens }
    if (!passing && buffer) onText(buffer)
    return { outcome: 'answered', text: result.text.trim(), inputTokens: result.inputTokens, outputTokens: result.outputTokens }
  } catch (error) {
    return { outcome: 'error', text: '', inputTokens: 0, outputTokens: 0, error: error instanceof ProviderError ? error.code : 'other' }
  }
}
