'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useRef, useState } from 'react'

import { QUESTION_MAX, QUESTION_MIN } from '@/ai/rules'

import { AnswerView, type PublicSource } from './AnswerView'

type Status = 'loading' | 'guest' | 'no-key' | 'ready'
type Result =
  | { kind: 'answer'; text: string; sources: PublicSource[]; streaming: boolean; tokens?: { input: number; output: number } }
  | { kind: 'nosource'; suggestions: { title: string; path: string }[] }
  | { kind: 'error'; code: string }

/** Ereignis, mit dem „Inhalt fehlt – der Redaktion melden“ den Feedback-Dialog öffnet (Art „Idee“, 8.7). */
export const FEEDBACK_EVENT = 'teachinghub:feedback'

/**
 * „Fragen“ auf der Suchseite (Entscheidungen 8.7, 8.8): Antwort nur aus Hub-Inhalten, mit Quellen.
 * Gäste sehen einen Anmeldelink, Mitglieder ohne Schlüssel eine Anleitung.
 */
export function AskPanel({ initialQuestion = '' }: { initialQuestion?: string }) {
  const t = useTranslations('Ask')
  const locale = useLocale()
  const [status, setStatus] = useState<Status>('loading')
  const [question, setQuestion] = useState(initialQuestion)
  const [asked, setAsked] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const abort = useRef<AbortController | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/hub/ai/key', { credentials: 'same-origin' })
      .then(async (r) => {
        // Antwort immer ganz lesen (sonst bleibt die Anfrage offen)
        const data = (await r.json().catch(() => ({}))) as { key?: unknown }
        if (!active) return
        if (r.status === 401) return setStatus('guest')
        setStatus(data.key ? 'ready' : 'no-key')
      })
      .catch(() => active && setStatus('guest'))
    return () => {
      active = false
      abort.current?.abort()
    }
  }, [])

  async function ask(event: React.FormEvent) {
    event.preventDefault()
    const text = question.trim()
    if (text.length < QUESTION_MIN) return setResult({ kind: 'error', code: 'too-short' })
    abort.current?.abort()
    const controller = new AbortController()
    abort.current = controller
    setBusy(true)
    setAsked(text)
    setResult(null)
    try {
      const response = await fetch('/api/hub/ai/ask', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, locale }),
        signal: controller.signal,
      })
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        if (data.error === 'no-key') setStatus('no-key')
        return setResult({ kind: 'error', code: data.error ?? 'other' })
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let sources: PublicSource[] = []
      let answer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as Record<string, unknown>
          if (event.type === 'sources') {
            sources = event.sources as PublicSource[]
            setResult({ kind: 'answer', text: '', sources, streaming: true })
          } else if (event.type === 'delta') {
            answer += String(event.text)
            setResult({ kind: 'answer', text: answer, sources, streaming: true })
          } else if (event.type === 'done') {
            setResult({ kind: 'answer', text: answer, sources, streaming: false, tokens: { input: Number(event.inputTokens), output: Number(event.outputTokens) } })
          } else if (event.type === 'nosource') {
            setResult({ kind: 'nosource', suggestions: event.suggestions as { title: string; path: string }[] })
          } else if (event.type === 'error') {
            setResult({ kind: 'error', code: String(event.code ?? 'other') })
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setResult({ kind: 'error', code: 'other' })
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return <p className="meta">{t('loading')}</p>
  if (status === 'guest')
    return (
      <div className="ask">
        <p>{t('guestLead')}</p>
        <a className="button button--primary" href={`/${locale}/anmelden?zurueck=${encodeURIComponent(`/${locale}/suche?modus=fragen`)}`}>
          {t('signIn')}
        </a>
      </div>
    )
  if (status === 'no-key')
    return (
      <div className="ask">
        <p>{t('noKeyLead')}</p>
        <ul>
          <li>{t('noKeyStep1')}</li>
          <li>{t('noKeyStep2')}</li>
        </ul>
        <a className="button button--primary" href={`/${locale}/mein-hub#ki`}>
          {t('toSettings')}
        </a>
      </div>
    )

  return (
    <div className="ask">
      <form className="stack-form" onSubmit={ask}>
        <label htmlFor="ask-question">{t('questionLabel')}</label>
        <textarea id="ask-question" value={question} minLength={QUESTION_MIN} maxLength={QUESTION_MAX} rows={3} required onChange={(e) => setQuestion(e.target.value)} aria-describedby="ask-hint" />
        <span id="ask-hint" className="meta">
          {t('hint')}
        </span>
        <div className="hub-item__actions">
          <button type="submit" className="button button--primary" disabled={busy}>
            {busy ? t('asking') : t('ask')}
          </button>
          {busy && (
            <button type="button" className="button button--secondary" onClick={() => abort.current?.abort()}>
              {t('stop')}
            </button>
          )}
        </div>
      </form>

      <div role="region" aria-label={t('answerRegion')} className="ask__result">
        {busy && !result && (
          <p role="status" className="meta">
            {t('searching')}
          </p>
        )}
        {result?.kind === 'answer' && (
          <>
            <h2 className="ask__question">{asked}</h2>
            <AnswerView answer={result.text} sources={result.sources} locale={locale} streaming={result.streaming} />
            {result.tokens && (
              <p className="meta" role="status">
                {t('tokens', { input: result.tokens.input, output: result.tokens.output })} · <a href={`/${locale}/mein-hub#fragen`}>{t('toHistory')}</a>
              </p>
            )}
          </>
        )}
        {result?.kind === 'nosource' && (
          <div className="alertbox alertbox--warning" role="status">
            <p>
              <strong>{t('noSource')}</strong>
            </p>
            {result.suggestions.length > 0 && (
              <>
                <p>{t('suggestions')}</p>
                <ul>
                  {result.suggestions.map((s) => (
                    <li key={s.path}>
                      <a href={`/${locale}${s.path}`}>{s.title}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="hub-item__actions">
              <a className="button button--secondary" href={`/${locale}/suche?q=${encodeURIComponent(asked)}&modus=suchen`}>
                {t('fullText')}
              </a>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => window.dispatchEvent(new CustomEvent(FEEDBACK_EVENT, { detail: { kind: 'idee', message: t('missingMessage', { question: asked }) } }))}
              >
                {t('reportMissing')}
              </button>
            </div>
          </div>
        )}
        {result?.kind === 'error' && (
          <p role="alert" className="form-error">
            {t.has(`error_${result.code}`) ? t(`error_${result.code}`) : t('error_other')}
          </p>
        )}
      </div>
    </div>
  )
}
