'use client'

import { useFormatter, useLocale, useTranslations } from 'next-intl'
import React, { useId, useState } from 'react'

import type { CollectionKind } from '@/hub/rules'
import { Link, useRouter } from '@/i18n/navigation'

export async function hubRequest(
  url: string,
  method: string,
  body?: unknown,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => null)
  if (!response?.ok) return null
  return ((await response.json().catch(() => ({}))) as Record<string, unknown>) ?? {}
}

/** Neue Sammlung in „Meine Methoden“ / „Meine Tools“ anlegen und öffnen. */
export function NewCollectionForm({ kind }: { kind: CollectionKind }) {
  const t = useTranslations('Collections')
  const router = useRouter()
  const id = useId()
  const [title, setTitle] = useState('')
  const [error, setError] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const created = await hubRequest('/api/hub/collections', 'POST', { kind, title })
    if (!created) return setError(true)
    router.push(`/mein-hub/sammlung/${created.id as string}`)
  }

  return (
    <form className="inline-form" onSubmit={submit}>
      <label htmlFor={id}>{t(`newLabel_${kind}`)}</label>
      <input
        id={id}
        type="text"
        required
        maxLength={200}
        value={title}
        placeholder={t(`defaultTitle_${kind}`)}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" className="button button--secondary">
        {t('create')}
      </button>
      {error && (
        <span role="alert" className="meta">
          {t('error')}
        </span>
      )}
    </form>
  )
}

export type InboxEntry = {
  id: string
  sender: string
  title: string
  typeLabel: string
  href: string | null
  collectionId: string | null
  message: string
  read: boolean
  createdAt: string
}

/** Eintrag in „Mit mir geteilt“: Inhalt oder Sammlung, Nachricht, gelesen/entfernen, Kopie übernehmen. */
export function InboxItem({ entry }: { entry: InboxEntry }) {
  const t = useTranslations('Inbox')
  const format = useFormatter()
  const router = useRouter()
  const [read, setRead] = useState(entry.read)
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState(false)
  if (removed) return null

  const markRead = async () =>
    (await hubRequest('/api/hub/inbox', 'PATCH', { id: entry.id })) && setRead(true)

  return (
    <li className={`hub-item${read ? '' : ' hub-item--unread'}`}>
      <div className="hub-item__head">
        <div>
          <span className="hub-item__type">
            {entry.typeLabel} · {t('from', { name: entry.sender })} ·{' '}
            {format.dateTime(new Date(entry.createdAt), { dateStyle: 'medium' })}
            {!read && <strong> · {t('new')}</strong>}
          </span>
          <h3>
            {entry.href ? (
              <Link href={entry.href} onClick={() => void markRead()}>
                {entry.title}
              </Link>
            ) : (
              entry.title
            )}
          </h3>
        </div>
      </div>
      {entry.message && <blockquote className="hub-item__message">{entry.message}</blockquote>}
      <div className="hub-item__actions">
        {!read && (
          <button type="button" className="button button--secondary" onClick={markRead}>
            {t('markRead')}
          </button>
        )}
        {entry.collectionId && (
          <button
            type="button"
            className="button button--secondary"
            onClick={async () => {
              const copy = await hubRequest(
                `/api/hub/collections/${entry.collectionId}/copy`,
                'POST',
                {},
              )
              if (copy) router.push(`/mein-hub/sammlung/${copy.id as string}`)
              else setError(true)
            }}
          >
            {t('copy')}
          </button>
        )}
        <button
          type="button"
          className="button button--secondary"
          aria-label={`${t('remove')}: ${entry.title}`}
          onClick={async () =>
            (await hubRequest('/api/hub/inbox', 'DELETE', { id: entry.id }))
              ? setRemoved(true)
              : setError(true)
          }
        >
          {t('remove')}
        </button>
        {error && (
          <span role="alert" className="meta">
            {t('error')}
          </span>
        )}
      </div>
    </li>
  )
}

export type FeedbackEntry = {
  id: number
  kindLabel: string
  stateLabel: string
  done: boolean
  place: string
  pageUrl: string | null
  message: string
  reply: string | null
  hasImage: boolean
  createdAt: string
}

/** Eigenes Feedback mit Status und Antwort; löschbar inkl. Bild (Entscheidung 8.2a). */
export function FeedbackItem({ entry }: { entry: FeedbackEntry }) {
  const t = useTranslations('Feedback')
  const format = useFormatter()
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState(false)
  if (removed) return null
  return (
    <li className="hub-item">
      <div className="hub-item__head">
        <div>
          <span className="hub-item__type">
            {entry.kindLabel} ·{' '}
            {format.dateTime(new Date(entry.createdAt), { dateStyle: 'medium' })}
            {entry.hasImage && ` · ${t('withImage')}`}
          </span>
          <h3>{entry.pageUrl ? <a href={entry.pageUrl}>{entry.place}</a> : entry.place}</h3>
        </div>
        <span className={`state-badge${entry.done ? ' state-badge--done' : ''}`}>
          {entry.stateLabel}
        </span>
      </div>
      <p className="hub-item__message">{entry.message}</p>
      {entry.reply && (
        <div className="hub-item__reply">
          <strong>{t('reply')}</strong>
          <p>{entry.reply}</p>
        </div>
      )}
      <div className="hub-item__actions">
        <button
          type="button"
          className="button button--secondary"
          aria-label={`${t('delete')}: ${entry.place}`}
          onClick={async () =>
            (await hubRequest(`/api/hub/feedback?id=${entry.id}`, 'DELETE'))
              ? setRemoved(true)
              : setError(true)
          }
        >
          {t('delete')}
        </button>
        {error && (
          <span role="alert" className="meta">
            {t('error')}
          </span>
        )}
      </div>
    </li>
  )
}

/** Mail-Benachrichtigung bei geteilten Inhalten ein-/ausschalten (Entscheidung 8.3). */
export function PreferencesForm({ notifyShares: initial }: { notifyShares: boolean }) {
  const t = useTranslations('Hub')
  const locale = useLocale()
  const [notify, setNotify] = useState(initial)
  const [message, setMessage] = useState<string | null>(null)
  return (
    <p>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={notify}
          onChange={async (e) => {
            const next = e.target.checked
            setNotify(next)
            const saved = await hubRequest('/api/hub/preferences', 'PUT', {
              notifyShares: next,
              locale,
            })
            if (!saved) setNotify(!next)
            setMessage(saved ? t('preferencesSaved') : t('error'))
          }}
        />{' '}
        {t('notifyShares')}
      </label>
      {message && (
        <span role="status" className="meta">
          {' '}
          {message}
        </span>
      )}
    </p>
  )
}
