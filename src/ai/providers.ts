import { lookup as lookupCallback, type LookupAddress } from 'node:dns'
import { lookup } from 'node:dns/promises'

import Anthropic from '@anthropic-ai/sdk'
import { Agent, fetch as pinnedFetch } from 'undici'

import { isPrivateAddress, NO_SOURCE, type Provider } from './rules'

/**
 * Anbieter-Adapter (Entscheidung 8.5): gleicher Ablauf für alle – System-Prompt + Quellen + Frage, Antwort gestreamt,
 * Token-Zahlen zurück. Der Schlüssel des Mitglieds wird nur hier, serverseitig, verwendet.
 */
export type Generation = { text: string; inputTokens: number; outputTokens: number; refused: boolean }

export type GenerateInput = {
  provider: Provider
  model: string
  apiKey: string
  baseUrl?: string | null
  system: string
  user: string
  onText: (delta: string) => void
  signal?: AbortSignal
}

export class ProviderError extends Error {
  constructor(
    public readonly code: 'auth' | 'model' | 'rate' | 'quota' | 'network' | 'blocked' | 'other',
    message: string,
  ) {
    super(message)
  }
}

export const OPENAI_BASE = 'https://api.openai.com/v1'

/** Modelle, die die serverseitigen Refusal-Fallbacks kennen (sonst würde der Parameter abgelehnt). */
const FALLBACK_MODELS = /^claude-(fable-5|mythos-5|opus-5|sonnet-5-5)/

/** Kein Guthaben beim Anbieter (OpenAI: 429 insufficient_quota, Anthropic: 400 „credit balance is too low“). */
export function isQuotaError(body: string): boolean {
  return /insufficient_quota|credit balance is too low/i.test(body)
}

function anthropicError(error: unknown): ProviderError {
  if (error instanceof Anthropic.APIError && isQuotaError(error.message)) return new ProviderError('quota', 'Kein Guthaben beim Anbieter')
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) return new ProviderError('auth', 'Schlüssel abgelehnt')
  if (error instanceof Anthropic.NotFoundError) return new ProviderError('model', 'Modell nicht gefunden')
  if (error instanceof Anthropic.RateLimitError) return new ProviderError('rate', 'Limit beim Anbieter erreicht')
  if (error instanceof Anthropic.APIConnectionError) return new ProviderError('network', 'Anbieter nicht erreichbar')
  if (error instanceof Anthropic.APIError) return new ProviderError('other', `Anbieter-Fehler ${error.status ?? ''}`.trim())
  return new ProviderError('other', 'Unbekannter Fehler')
}

async function anthropicGenerate(input: GenerateInput): Promise<Generation> {
  const client = new Anthropic({ apiKey: input.apiKey, maxRetries: 1, timeout: 180_000 })
  const fallback = FALLBACK_MODELS.test(input.model)
  try {
    const stream = client.beta.messages.stream(
      {
        model: input.model,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        system: input.system,
        messages: [{ role: 'user', content: input.user }],
        // Ablehnung durch Sicherheitsfilter: serverseitig auf ein passendes Modell ausweichen
        ...(fallback ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      },
      { signal: input.signal },
    )
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') input.onText(event.delta.text)
    }
    const message = await stream.finalMessage()
    const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    return { text, inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens, refused: message.stop_reason === 'refusal' }
  } catch (error) {
    throw anthropicError(error)
  }
}

/** Vorprüfung mit verständlicher Meldung; die eigentliche Sperre macht `publicOnlyAgent` beim Verbinden. */
async function assertPublicHost(baseUrl: string) {
  const { hostname } = new URL(baseUrl)
  const addresses = await lookup(hostname, { all: true }).catch(() => [])
  if (!addresses.length) throw new ProviderError('network', 'Adresse nicht auflösbar')
  if (addresses.some((a) => isPrivateAddress(a.address))) throw new ProviderError('blocked', 'Interne Adressen sind nicht erlaubt')
}

/**
 * Verbindungen zu „OpenAI-kompatiblen“ Adressen: die Namensauflösung der Verbindung selbst prüft, dass alle
 * Adressen öffentlich sind. So kann ein Name nicht zwischen Prüfung und Verbindung auf ein internes Ziel
 * umschwenken (DNS-Rebinding).
 */
export function publicOnlyLookup(
  hostname: string,
  options: { all?: boolean },
  callback: (error: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void,
): void {
  lookupCallback(hostname, { all: true }, (error, addresses) => {
    if (error) return callback(error, [])
    const list = addresses as LookupAddress[]
    if (!list.length || list.some((a) => isPrivateAddress(a.address))) return callback(Object.assign(new Error('Interne Adressen sind nicht erlaubt'), { code: 'EBLOCKED' }), [])
    return options.all ? callback(null, list) : callback(null, list[0].address, list[0].family)
  })
}

const publicOnlyAgent = new Agent({ connect: { lookup: publicOnlyLookup as never } })

/** fetch für Anbieter: bei eigener Adresse nur über die geprüfte Verbindung. */
async function providerFetch(provider: Provider, url: string, init: RequestInit): Promise<Response> {
  try {
    if (provider !== 'compatible') return await fetch(url, init)
    return (await pinnedFetch(url, { ...(init as object), dispatcher: publicOnlyAgent } as never)) as unknown as Response
  } catch (error) {
    const code = (error as { cause?: { code?: string } }).cause?.code
    throw new ProviderError(code === 'EBLOCKED' ? 'blocked' : 'network', code === 'EBLOCKED' ? 'Interne Adressen sind nicht erlaubt' : 'Anbieter nicht erreichbar')
  }
}

async function httpError(response: Response): Promise<ProviderError> {
  const status = response.status
  const body = await response.text().catch(() => '')
  // Meldung des Anbieters ins Server-Protokoll (enthält nie den Schlüssel), damit Fehler nachvollziehbar sind
  console.warn(`KI-Anbieter antwortet ${status}: ${body.replace(/\s+/g, ' ').slice(0, 300)}`)
  if (isQuotaError(body)) return new ProviderError('quota', 'Kein Guthaben beim Anbieter')
  if (status === 401 || status === 403) return new ProviderError('auth', 'Schlüssel abgelehnt')
  if (status === 404) return new ProviderError('model', 'Modell oder Adresse nicht gefunden')
  if (status === 429) return new ProviderError('rate', 'Limit beim Anbieter erreicht')
  return new ProviderError('other', `Anbieter-Fehler ${status}`)
}

async function openaiGenerate(input: GenerateInput): Promise<Generation> {
  const base = input.provider === 'openai' ? OPENAI_BASE : (input.baseUrl ?? '')
  if (input.provider === 'compatible') await assertPublicHost(base)
  const response = await providerFetch(input.provider, `${base}/chat/completions`, {
    method: 'POST',
    redirect: 'error',
    signal: input.signal ?? AbortSignal.timeout(180_000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${input.apiKey}` },
    body: JSON.stringify({
      model: input.model,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.user },
      ],
    }),
  })
  if (!response.ok || !response.body) throw await httpError(response)

  let text = ''
  let usage = { prompt_tokens: 0, completion_tokens: 0 }
  let refused = false
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const data = line.startsWith('data:') ? line.slice(5).trim() : ''
      if (!data || data === '[DONE]') continue
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string | null; refusal?: string | null }; finish_reason?: string | null }[]
          usage?: { prompt_tokens: number; completion_tokens: number } | null
        }
        const delta = json.choices?.[0]?.delta
        if (delta?.content) {
          text += delta.content
          input.onText(delta.content)
        }
        if (delta?.refusal || json.choices?.[0]?.finish_reason === 'content_filter') refused = true
        if (json.usage) usage = json.usage
      } catch {
        // unvollständige Zeile: ignorieren
      }
    }
  }
  return { text, inputTokens: usage.prompt_tokens ?? 0, outputTokens: usage.completion_tokens ?? 0, refused }
}

/**
 * Testanbieter (nur mit AI_TEST_PROVIDER=1): antwortet deterministisch aus der ersten Quelle, damit E2E-Tests
 * ohne echten Schlüssel laufen. Enthält die Frage „NOSOURCE“, meldet er fehlende Quellen.
 */
async function testGenerate(input: GenerateInput): Promise<Generation> {
  const question = input.user.match(/<frage>\n([\s\S]*?)\n<\/frage>/)?.[1] ?? ''
  const first = input.user.match(/<quelle nr="1" titel="([^"]*)"[^>]*>\n([\s\S]*?)\n<\/quelle>/)
  const text = question.includes('NOSOURCE') || !first ? NO_SOURCE : `Laut «${first[1]}»: ${first[2].split(/(?<=[.!?])\s/)[0].slice(0, 200)} [1]`
  for (const piece of text.match(/.{1,20}/gs) ?? []) input.onText(piece)
  return { text, inputTokens: Math.ceil(input.user.length / 4), outputTokens: Math.ceil(text.length / 4), refused: false }
}

export const testProviderEnabled = () => process.env.AI_TEST_PROVIDER === '1'

export async function generate(input: GenerateInput): Promise<Generation> {
  if (input.provider === 'anthropic') return anthropicGenerate(input)
  if (input.provider === 'test') {
    if (!testProviderEnabled()) throw new ProviderError('other', 'Testanbieter ist abgeschaltet')
    return testGenerate(input)
  }
  return openaiGenerate(input)
}

/**
 * Schlüssel beim Speichern prüfen (kurzer Aufruf ohne Kosten): Anthropic – Modell abrufen; OpenAI/kompatibel – Modellliste.
 */
export async function verifyKey(input: { provider: Provider; model: string; apiKey: string; baseUrl?: string | null }): Promise<void> {
  if (input.provider === 'test') {
    if (!testProviderEnabled()) throw new ProviderError('other', 'Testanbieter ist abgeschaltet')
    return
  }
  if (input.provider === 'anthropic') {
    const client = new Anthropic({ apiKey: input.apiKey, maxRetries: 0, timeout: 20_000 })
    try {
      await client.models.retrieve(input.model)
    } catch (error) {
      throw anthropicError(error)
    }
    return
  }
  const base = input.provider === 'openai' ? OPENAI_BASE : (input.baseUrl ?? '')
  if (input.provider === 'compatible') await assertPublicHost(base)
  const response = await providerFetch(input.provider, `${base}/models`, {
    redirect: 'error',
    signal: AbortSignal.timeout(20_000),
    headers: { Authorization: `Bearer ${input.apiKey}` },
  })
  if (!response.ok) throw await httpError(response)
}
