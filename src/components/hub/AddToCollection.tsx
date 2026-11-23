'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useId, useState } from 'react'

import type { CollectionKind } from '@/hub/rules'

type Option = { id: string; title: string; ownerName: string; canEdit: boolean }
const NEW = '__new__'

/**
 * „Zu Meine Methoden / Meine Tools hinzufügen“ auf Methoden- und Toolseiten (Entscheidung 2.3):
 * bestehende Sammlung wählen (eigene oder geteilt mit Bearbeitungsrecht) oder neue anlegen; optionale Notiz/Variante.
 */
export function AddToCollection({ kind, id }: { kind: CollectionKind; id: number }) {
  const t = useTranslations('Collections')
  const locale = useLocale()
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<Option[] | null>(null)
  const [target, setTarget] = useState(NEW)
  const [newTitle, setNewTitle] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; text: string; href?: string } | null>(null)

  async function toggle() {
    const next = !open
    setOpen(next)
    setStatus(null)
    if (next && options === null) {
      const response = await fetch(`/api/hub/collections?kind=${kind}&editable=1`, {
        credentials: 'same-origin',
      }).catch(() => null)
      const list = response?.ok
        ? ((await response.json()) as { collections: Option[] }).collections
        : []
      setOptions(list)
      setTarget(list[0]?.id ?? NEW)
      setNewTitle(t(`defaultTitle_${kind}`))
    }
  }

  async function post(url: string, body: unknown) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null)
    return response?.ok ? ((await response.json()) as { id: string }) : null
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    let collectionId = target
    if (target === NEW) {
      const created = await post('/api/hub/collections', { kind, title: newTitle })
      if (!created) return setStatus({ ok: false, text: t('error') })
      collectionId = created.id
      setOptions((o) => [
        { id: created.id, title: newTitle, ownerName: '', canEdit: true },
        ...(o ?? []),
      ])
      setTarget(created.id)
    }
    const item = await post(`/api/hub/collections/${collectionId}/items`, {
      ref: { collection: kind, id },
      note,
    })
    if (!item) return setStatus({ ok: false, text: t('error') })
    setNote('')
    setStatus({ ok: true, text: t('added'), href: `/${locale}/mein-hub/sammlung/${collectionId}` })
  }

  return (
    <div className="add-to-collection">
      <button
        type="button"
        className="button button--secondary content-actions__button"
        aria-expanded={open}
        aria-controls={formId}
        onClick={toggle}
      >
        <span aria-hidden="true">＋</span> {t(`addTo_${kind}`)}
      </button>
      <form id={formId} className="share-menu__panel" hidden={!open} onSubmit={submit}>
        {options === null ? (
          <p className="meta">{t('loading')}</p>
        ) : (
          <>
            <label htmlFor={`${formId}-target`}>{t('collection')}</label>
            <select
              id={`${formId}-target`}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.ownerName ? `${o.title} (${o.ownerName})` : o.title}
                </option>
              ))}
              <option value={NEW}>{t('newCollection')}</option>
            </select>
            {target === NEW && (
              <>
                <label htmlFor={`${formId}-title`}>{t('newTitle')}</label>
                <input
                  id={`${formId}-title`}
                  type="text"
                  required
                  maxLength={200}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </>
            )}
            <label htmlFor={`${formId}-note`}>{t('itemNote')}</label>
            <textarea
              id={`${formId}-note`}
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button type="submit" className="button button--primary">
              {t('add')}
            </button>
          </>
        )}
        {status && (
          <p role={status.ok ? 'status' : 'alert'} className="meta">
            {status.text} {status.href && <a href={status.href}>{t('open')}</a>}
          </p>
        )}
      </form>
    </div>
  )
}
