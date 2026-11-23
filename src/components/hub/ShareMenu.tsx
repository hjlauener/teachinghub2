'use client'

import { useTranslations } from 'next-intl'
import React, { useId, useState } from 'react'

import { type HubCollection, publicShareLinks } from '@/hub/rules'

import { MemberPicker, type PickedMember } from './MemberPicker'

/**
 * Teilen (Entscheidung 8.3): für alle Link kopieren, E-Mail, LinkedIn; für Mitglieder zusätzlich
 * „An Kolleg:innen senden“ (nur registrierte Mitglieder, optionale Nachricht).
 */
export function ShareMenu({
  collection,
  id,
  title,
  member,
}: {
  collection: HubCollection
  id: number
  title: string
  member: boolean
}) {
  const t = useTranslations('Share')
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [toMembers, setToMembers] = useState(false)
  const [recipients, setRecipients] = useState<PickedMember[]>([])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  const links = publicShareLinks(url, title)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setStatus({ ok: false, text: t('copyFailed') })
    }
  }

  async function send(event: React.FormEvent) {
    event.preventDefault()
    if (!recipients.length) return setStatus({ ok: false, text: t('noRecipients') })
    const response = await fetch('/api/hub/share', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, id, memberIds: recipients.map((r) => r.id), message }),
    }).catch(() => null)
    if (!response?.ok) return setStatus({ ok: false, text: t('error') })
    setStatus({ ok: true, text: t('sent', { count: recipients.length }) })
    setRecipients([])
    setMessage('')
    setToMembers(false)
  }

  return (
    <div className="share-menu">
      <button
        type="button"
        className="button button--secondary content-actions__button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setUrl(window.location.href.split('#')[0].split('?')[0])
          setOpen((v) => !v)
        }}
      >
        <span aria-hidden="true">↗</span> {t('button')}
      </button>
      <div id={panelId} className="share-menu__panel" hidden={!open}>
        <ul className="share-menu__links">
          <li>
            <button type="button" className="link-button" onClick={copy}>
              {copied ? t('copied') : t('copyLink')}
            </button>
          </li>
          <li>
            <a href={links.mail}>{t('email')}</a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer">
              {t('linkedin')}
              <span className="visually-hidden"> {t('newWindow')}</span>
            </a>
          </li>
          {member && (
            <li>
              <button
                type="button"
                className="link-button"
                aria-expanded={toMembers}
                onClick={() => setToMembers((v) => !v)}
              >
                {t('toColleagues')}
              </button>
            </li>
          )}
        </ul>
        {member && toMembers && (
          <form className="share-menu__form" onSubmit={send}>
            <MemberPicker value={recipients} onChange={setRecipients} />
            <label htmlFor={`${panelId}-message`}>{t('message')}</label>
            <textarea
              id={`${panelId}-message`}
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="button button--primary">
              {t('send')}
            </button>
          </form>
        )}
        {status && (
          <p role={status.ok ? 'status' : 'alert'} className="meta">
            {status.text}
          </p>
        )}
      </div>
    </div>
  )
}
