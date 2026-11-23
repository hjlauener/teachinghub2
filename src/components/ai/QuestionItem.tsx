'use client'

import { useFormatter, useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { hubRequest } from '@/components/hub/HubSections'
import { MemberPicker, type PickedMember } from '@/components/hub/MemberPicker'
import { Link, useRouter } from '@/i18n/navigation'

export type QuestionEntry = { id: string; question: string; outcome: 'answered' | 'no_source' | 'error'; createdAt: string; tokens: number }

/** Eintrag im Verlauf (Entscheidung 8.12): öffnen, mit Mitgliedern teilen (nur beantwortete), löschen. */
export function QuestionItem({ entry }: { entry: QuestionEntry }) {
  const t = useTranslations('AskHistory')
  const s = useTranslations('Share')
  const format = useFormatter()
  const [removed, setRemoved] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [recipients, setRecipients] = useState<PickedMember[]>([])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  if (removed) return null

  async function share(event: React.FormEvent) {
    event.preventDefault()
    if (!recipients.length) return setStatus({ ok: false, text: s('noRecipients') })
    const ok = await hubRequest('/api/hub/ai/share', 'POST', { id: entry.id, memberIds: recipients.map((r) => r.id), message })
    setStatus(ok ? { ok: true, text: s('sent', { count: recipients.length }) } : { ok: false, text: t('error') })
    if (ok) {
      setRecipients([])
      setMessage('')
      setSharing(false)
    }
  }

  return (
    <li className="hub-item">
      <div className="hub-item__head">
        <div>
          <span className="hub-item__type">
            {format.dateTime(new Date(entry.createdAt), { dateStyle: 'medium', timeStyle: 'short' })} · {t(`outcome_${entry.outcome}`)}
            {entry.tokens > 0 && ` · ${t('tokens', { count: entry.tokens })}`}
          </span>
          <h3>
            <Link href={`/mein-hub/frage/${entry.id}`}>{entry.question}</Link>
          </h3>
        </div>
      </div>
      <div className="hub-item__actions">
        {entry.outcome === 'answered' && (
          <button type="button" className="button button--secondary" aria-expanded={sharing} onClick={() => setSharing((v) => !v)}>
            {t('share')}
          </button>
        )}
        <button
          type="button"
          className="button button--secondary"
          aria-label={`${t('delete')}: ${entry.question}`}
          onClick={async () => ((await hubRequest(`/api/hub/ai/questions?id=${entry.id}`, 'DELETE')) ? setRemoved(true) : setStatus({ ok: false, text: t('error') }))}
        >
          {t('delete')}
        </button>
        {status && (
          <span role={status.ok ? 'status' : 'alert'} className="meta">
            {status.text}
          </span>
        )}
      </div>
      {sharing && (
        <form className="stack-form" onSubmit={share}>
          <MemberPicker value={recipients} onChange={setRecipients} />
          <label htmlFor={`share-message-${entry.id}`}>{s('message')}</label>
          <textarea id={`share-message-${entry.id}`} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" className="button button--primary">
            {s('send')}
          </button>
        </form>
      )}
    </li>
  )
}

/** Ganzen Verlauf löschen. */
export function DeleteAllQuestions() {
  const t = useTranslations('AskHistory')
  const router = useRouter()
  const [error, setError] = useState(false)
  return (
    <p>
      <button
        type="button"
        className="button button--secondary"
        onClick={async () => {
          if (!window.confirm(t('deleteAllConfirm'))) return
          if (await hubRequest('/api/hub/ai/questions?alle=1', 'DELETE')) router.refresh()
          else setError(true)
        }}
      >
        {t('deleteAll')}
      </button>
      {error && (
        <span role="alert" className="meta">
          {' '}
          {t('error')}
        </span>
      )}
    </p>
  )
}
