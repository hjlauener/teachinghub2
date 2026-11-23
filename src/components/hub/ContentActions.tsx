'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import type { HubCollection } from '@/hub/rules'

import { AddToCollection } from './AddToCollection'
import { ShareMenu } from './ShareMenu'

type State = { member: boolean; liked: boolean; bookmarked: boolean; note: string }

/**
 * „Hilfreich“ (Like), „Merken“, „Zu Meine Methoden/Tools“ und „Teilen“ auf Inhaltsseiten (Entscheidungen 8.1, 2.3, 8.3). Der persönliche Zustand wird
 * clientseitig geladen, damit Seiten nicht pro Person gerendert werden. Gäste werden zur Anmeldung geführt
 * und kommen danach auf dieselbe Seite zurück.
 */
export function ContentActions({ collection, id, title, count: initialCount }: { collection: HubCollection; id: number; title: string; count: number | null }) {
  const t = useTranslations('Hub')
  const locale = useLocale()
  const [state, setState] = useState<State | null>(null)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch(`/api/hub/state?collection=${collection}&id=${id}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? (r.json() as Promise<State>) : null))
      .then((s) => active && setState(s ?? { member: false, liked: false, bookmarked: false, note: '' }))
      .catch(() => active && setState({ member: false, liked: false, bookmarked: false, note: '' }))
    return () => {
      active = false
    }
  }, [collection, id])

  async function call(url: string, method: string, body: Record<string, unknown>) {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, id, ...body }),
      })
      if (!response.ok) throw new Error(String(response.status))
      return (await response.json()) as Record<string, unknown>
    } catch {
      setError(t('error'))
      return null
    } finally {
      setBusy(false)
    }
  }

  async function toggleLike() {
    if (!state) return
    const result = await call('/api/hub/likes', 'POST', { liked: !state.liked })
    if (result) {
      setState({ ...state, liked: Boolean(result.liked) })
      setCount((result.count as number | null) ?? null)
    }
  }

  async function toggleBookmark() {
    if (!state) return
    const result = state.bookmarked
      ? await call('/api/hub/bookmarks', 'DELETE', {})
      : await call('/api/hub/bookmarks', 'PUT', { note: state.note })
    if (result) setState({ ...state, bookmarked: Boolean(result.bookmarked) })
  }

  const returnTo = typeof window === 'undefined' ? `/${locale}` : `${window.location.pathname}${window.location.search}`

  return (
    <div className="content-actions" role="group" aria-label={t('actions')}>
      {count !== null && <span className="content-actions__count">♥ {t('likeCount', { count })}</span>}
      {state?.member ? (
        <>
          <button type="button" className="button button--secondary content-actions__button" aria-pressed={state.liked} disabled={busy} onClick={toggleLike}>
            <span aria-hidden="true">{state.liked ? '♥' : '♡'}</span> {t('like')}
          </button>
          <button type="button" className="button button--secondary content-actions__button" aria-pressed={state.bookmarked} disabled={busy} onClick={toggleBookmark}>
            <span aria-hidden="true">{state.bookmarked ? '★' : '☆'}</span> {state.bookmarked ? t('bookmarked') : t('bookmark')}
          </button>
          {(collection === 'methods' || collection === 'tools') && <AddToCollection kind={collection} id={id} />}
        </>
      ) : state ? (
        <a className="content-actions__signin" href={`/${locale}/anmelden?zurueck=${encodeURIComponent(returnTo)}`}>
          {t('signInToUse')}
        </a>
      ) : null}
      {state && <ShareMenu collection={collection} id={id} title={title} member={state.member} />}
      {error && (
        <span role="alert" className="content-actions__error">
          {error}
        </span>
      )}
    </div>
  )
}
