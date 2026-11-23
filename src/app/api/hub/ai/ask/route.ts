import { answer, retrieve, suggestionsFrom } from '@/ai/ask'
import { getKey, recentQuestionCount, saveQuestion } from '@/ai/repo'
import { normalizeQuestion } from '@/ai/rules'
import { db, json, readBody, requireMember } from '@/hub/server'
import { isLocale } from '@/i18n/routing'

/** Höchstens so viele Fragen pro Stunde und Mitglied (Server-Last; die Kosten trägt der eigene Schlüssel). */
const QUESTIONS_PER_HOUR = 60

export const dynamic = 'force-dynamic'

/**
 * Frage stellen (Phase 6): POST { question, locale } → Antwort als NDJSON-Strom:
 * `sources` (nummerierte Quellen), `delta` (Antworttext), `done` (Ergebnis, Tokens, ID im Verlauf) bzw.
 * `nosource` (Vorschläge) oder `error`. Ohne passende Quelle wird der Anbieter gar nicht angefragt.
 */
export async function POST(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const { member } = checked
  const body = await readBody(request)
  const question = normalizeQuestion(body.question)
  const locale = typeof body.locale === 'string' && isLocale(body.locale) ? body.locale : 'de'
  if (!question) return json({ error: 'invalid' }, 400)
  const key = await getKey(db(), member.id)
  if (!key) return json({ error: 'no-key' }, 409)
  if ((await recentQuestionCount(db(), member.id)) >= QUESTIONS_PER_HOUR) return json({ error: 'rate-limit' }, 429)

  let retrieved: Awaited<ReturnType<typeof retrieve>>
  try {
    retrieved = await retrieve(question, locale)
  } catch (error) {
    console.error('[Ask] Suche im KI-Index fehlgeschlagen', error)
    return json({ error: 'index-unavailable' }, 503)
  }
  const { sources, nearest } = retrieved
  const publicSources = sources.map(({ text: _text, score: _score, ...s }) => s)
  const base = { question, sources: publicSources, locale, provider: key.provider, model: key.model }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
      const noSource = async (inputTokens = 0, outputTokens = 0) => {
        const id = await saveQuestion(db(), member.id, { ...base, sources: [], answer: '', outcome: 'no_source', inputTokens, outputTokens })
        send({ type: 'nosource', id, suggestions: suggestionsFrom(nearest), inputTokens, outputTokens })
      }
      try {
        if (!sources.length) {
          await noSource()
          return
        }
        send({ type: 'sources', sources: publicSources })
        const result = await answer(question, sources, key, member.id, (text) => send({ type: 'delta', text }), request.signal)
        if (result.outcome === 'no_source') {
          await noSource(result.inputTokens, result.outputTokens)
          return
        }
        const id = await saveQuestion(db(), member.id, { ...base, answer: result.text, outcome: result.outcome, inputTokens: result.inputTokens, outputTokens: result.outputTokens })
        if (result.outcome === 'error') send({ type: 'error', id, code: result.error })
        else send({ type: 'done', id, inputTokens: result.inputTokens, outputTokens: result.outputTokens })
      } catch (error) {
        console.error('[Ask] Fehler', error)
        send({ type: 'error', code: 'other' })
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Accel-Buffering': 'no' } })
}
