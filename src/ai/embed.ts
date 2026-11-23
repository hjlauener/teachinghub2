import { createHash } from 'node:crypto'

import { MIN_SCORE } from './rules'

/**
 * Embeddings für den KI-Index (Entscheidung 8.6): lokal über Ollama mit `bge-m3` (mehrsprachig, 1024 Dimensionen).
 * Kein Text verlässt dafür den Server. Für Tests und CI gibt es einen deterministischen Ersatz ohne Modell
 * (`AI_EMBEDDER=fake`), der Wortüberschneidung abbildet.
 */
export const EMBEDDING_DIMENSIONS = 1024

export type Embedder = {
  name: string
  /** Ab dieser Ähnlichkeit gilt ein Treffer als passend (modellabhängig). */
  minScore: number
  embed(texts: string[]): Promise<number[][]>
}

export function ollamaEmbedder(baseUrl = process.env.OLLAMA_URL ?? 'http://ollama:11434', model = process.env.EMBEDDING_MODEL ?? 'bge-m3'): Embedder {
  return {
    name: `ollama:${model}`,
    minScore: MIN_SCORE,
    async embed(texts) {
      const out: number[][] = []
      // in kleinen Paketen, damit lange Inhalte den Dienst nicht blockieren
      for (let i = 0; i < texts.length; i += 16) {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, input: texts.slice(i, i + 16) }),
          signal: AbortSignal.timeout(120_000),
        })
        if (!response.ok) throw new Error(`Ollama antwortet mit ${response.status}`)
        const data = (await response.json()) as { embeddings?: number[][] }
        if (!data.embeddings || data.embeddings.length !== Math.min(16, texts.length - i)) throw new Error('Ollama: unerwartete Antwort')
        out.push(...data.embeddings.map(normalize))
      }
      for (const v of out) if (v.length !== EMBEDDING_DIMENSIONS) throw new Error(`Embedding mit ${v.length} statt ${EMBEDDING_DIMENSIONS} Dimensionen`)
      return out
    },
  }
}

/** Wörter (Unicode-Buchstaben/Ziffern), klein, ab 3 Zeichen. */
export const words = (text: string): string[] => (text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])

/** Deterministischer Ersatz für Tests: Worthäufigkeiten in 1024 Fächer gehasht, normiert. */
export function fakeEmbedder(): Embedder {
  return {
    name: 'fake',
    minScore: 0.15,
    async embed(texts) {
      return texts.map((text) => {
        const v = new Array<number>(EMBEDDING_DIMENSIONS).fill(0)
        for (const word of words(text)) v[createHash('md5').update(word).digest().readUInt32BE(0) % EMBEDDING_DIMENSIONS] += 1
        return normalize(v)
      })
    },
  }
}

export function normalize(v: number[]): number[] {
  const length = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0))
  return length ? v.map((x) => x / length) : v
}

/** Embedder gemäss Konfiguration; `AI_MIN_SCORE` überschreibt den Schwellwert. */
export function configuredEmbedder(env: Record<string, string | undefined> = process.env): Embedder {
  const embedder = env.AI_EMBEDDER === 'fake' ? fakeEmbedder() : ollamaEmbedder(env.OLLAMA_URL, env.EMBEDDING_MODEL)
  const override = Number(env.AI_MIN_SCORE)
  return Number.isFinite(override) && override > 0 ? { ...embedder, minScore: override } : embedder
}

/** Vektor als pgvector-Literal. */
export const toVector = (v: number[]): string => `[${v.map((x) => (Number.isFinite(x) ? x.toFixed(6) : '0')).join(',')}]`
