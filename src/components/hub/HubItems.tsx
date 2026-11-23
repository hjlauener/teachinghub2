'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import type { HubCollection } from '@/hub/rules'
import { Link } from '@/i18n/navigation'

type Item = { collection: HubCollection; id: number; title: string; path: string | null }

async function send(url: string, method: string, body: Record<string, unknown>): Promise<boolean> {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)
  return Boolean(response?.ok)
}

function ItemHead({ item }: { item: Item }) {
  const t = useTranslations('Hub')
  return (
    <div>
      <span className="hub-item__type">{t(`type_${item.collection}`)}</span>
      <h3>{item.path ? <Link href={item.path}>{item.title}</Link> : item.title}</h3>
    </div>
  )
}

/** Gemerkter Inhalt mit Notiz (Entscheidung 8.x „Bookmark mit optionaler Notiz“). */
export function BookmarkItem({ item, note: initialNote }: { item: Item; note: string }) {
  const t = useTranslations('Hub')
  const [note, setNote] = useState(initialNote)
  const [message, setMessage] = useState<string | null>(null)
  const [removed, setRemoved] = useState(false)
  if (removed) return null
  const fieldId = `note-${item.collection}-${item.id}`

  async function save(event: React.FormEvent) {
    event.preventDefault()
    const ok = await send('/api/hub/bookmarks', 'PUT', { collection: item.collection, id: item.id, note })
    setMessage(ok ? t('noteSaved') : t('error'))
  }

  async function remove() {
    if (await send('/api/hub/bookmarks', 'DELETE', { collection: item.collection, id: item.id })) setRemoved(true)
    else setMessage(t('error'))
  }

  return (
    <li className="hub-item">
      <ItemHead item={item} />
      <form onSubmit={save}>
        <label htmlFor={fieldId} className="meta">
          {t('note', { title: item.title })}
        </label>
        <textarea id={fieldId} value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} />
        <div className="hub-item__actions">
          <button type="submit" className="button button--secondary">
            {t('saveNote')}
          </button>
          <button type="button" className="button button--secondary" onClick={remove}>
            {t('removeBookmark')}
          </button>
          {message && (
            <span role="status" className="meta">
              {message}
            </span>
          )}
        </div>
      </form>
    </li>
  )
}

/** Als hilfreich markierter Inhalt (nur für die Person selbst sichtbar). */
export function LikeItem({ item }: { item: Item }) {
  const t = useTranslations('Hub')
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState(false)
  if (removed) return null
  return (
    <li className="hub-item">
      <div className="hub-item__head">
        <ItemHead item={item} />
        <button
          type="button"
          className="button button--secondary"
          aria-label={`${t('removeLike')}: ${item.title}`}
          onClick={async () => {
            if (await send('/api/hub/likes', 'POST', { collection: item.collection, id: item.id, liked: false })) setRemoved(true)
            else setError(true)
          }}
        >
          {t('removeLike')}
        </button>
      </div>
      {error && (
        <p role="alert" className="meta">
          {t('error')}
        </p>
      )}
    </li>
  )
}
