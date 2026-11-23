'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useId, useState } from 'react'

import type { CollectionAccess } from '@/hub/rules'
import { Link, useRouter } from '@/i18n/navigation'

import { hubRequest } from './HubSections'
import { MemberPicker, type PickedMember } from './MemberPicker'

export type EditorItem = {
  id: string
  title: string
  docTitle: string | null
  docPath: string | null
  missing: boolean
  note: string
  suggestion: { stateLabel: string } | null
}
export type EditorShare = { id: string; name: string; email: string; canEdit: boolean }

type Props = {
  collection: {
    id: string
    title: string
    description: string
    kindLabel: string
    ownerName: string
  }
  access: CollectionAccess
  items: EditorItem[]
  shares: EditorShare[]
}

/** Bearbeiten einer Sammlung „Meine Methoden/Tools“ (Entscheidungen 2.3, 8.3). */
export function CollectionEditor({
  collection,
  access,
  items: initialItems,
  shares: initialShares,
}: Props) {
  const t = useTranslations('Collections')
  const router = useRouter()
  const base = `/api/hub/collections/${collection.id}`
  const [items, setItems] = useState(initialItems)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const say = (ok: boolean, text: string) => setMessage({ ok, text })

  return (
    <>
      {access.edit && (
        <DetailsForm
          base={base}
          title={collection.title}
          description={collection.description}
          onSaved={() => router.refresh()}
        />
      )}

      <section className="content-section" aria-labelledby="items-heading">
        <h2 id="items-heading">{t('items')}</h2>
        {items.length === 0 ? (
          <p>{t('noItems')}</p>
        ) : (
          <ul className="hub-list">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                base={base}
                access={access}
                onRemoved={() => setItems((list) => list.filter((i) => i.id !== item.id))}
                onSuggested={(label) =>
                  setItems((list) =>
                    list.map((i) =>
                      i.id === item.id ? { ...i, suggestion: { stateLabel: label } } : i,
                    ),
                  )
                }
              />
            ))}
          </ul>
        )}
        {access.edit && (
          <OwnEntryForm base={base} onAdded={(item) => setItems((list) => [...list, item])} />
        )}
      </section>

      {access.manage ? (
        <SharesSection base={base} initial={initialShares} />
      ) : (
        <section className="content-section" aria-labelledby="shared-heading">
          <h2 id="shared-heading">{t('sharedBy', { name: collection.ownerName })}</h2>
          <p>{access.edit ? t('youCanEdit') : t('youCanRead')}</p>
          <div className="hub-item__actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={async () => {
                const copy = await hubRequest(`${base}/copy`, 'POST', {})
                if (copy) router.push(`/mein-hub/sammlung/${copy.id as string}`)
                else say(false, t('error'))
              }}
            >
              {t('copy')}
            </button>
            <button
              type="button"
              className="button button--secondary"
              onClick={async () =>
                (await hubRequest(`${base}/shares`, 'DELETE', {}))
                  ? router.push('/mein-hub#geteilt')
                  : say(false, t('error'))
              }
            >
              {t('leave')}
            </button>
          </div>
        </section>
      )}

      {access.manage && (
        <section className="content-section" aria-labelledby="danger-heading">
          <h2 id="danger-heading">{t('deleteHeading')}</h2>
          <button
            type="button"
            className="button button--secondary"
            onClick={async () => {
              if (!window.confirm(t('deleteConfirm', { title: collection.title }))) return
              if (await hubRequest(base, 'DELETE')) router.push('/mein-hub')
              else say(false, t('error'))
            }}
          >
            {t('delete')}
          </button>
        </section>
      )}
      {message && (
        <p role={message.ok ? 'status' : 'alert'} className="meta">
          {message.text}
        </p>
      )}
    </>
  )
}

function DetailsForm({
  base,
  title: initialTitle,
  description: initialDescription,
  onSaved,
}: {
  base: string
  title: string
  description: string
  onSaved: () => void
}) {
  const t = useTranslations('Collections')
  const id = useId()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [status, setStatus] = useState<string | null>(null)
  return (
    <form
      className="content-section stack-form"
      onSubmit={async (e) => {
        e.preventDefault()
        const ok = await hubRequest(base, 'PATCH', { title, description })
        setStatus(ok ? t('saved') : t('error'))
        if (ok) onSaved()
      }}
    >
      <label htmlFor={`${id}-title`}>{t('title')}</label>
      <input
        id={`${id}-title`}
        type="text"
        required
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor={`${id}-description`}>{t('description')}</label>
      <textarea
        id={`${id}-description`}
        maxLength={2000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="hub-item__actions">
        <button type="submit" className="button button--secondary">
          {t('save')}
        </button>
        {status && (
          <span role="status" className="meta">
            {status}
          </span>
        )}
      </div>
    </form>
  )
}

function ItemRow({
  item,
  base,
  access,
  onRemoved,
  onSuggested,
}: {
  item: EditorItem
  base: string
  access: CollectionAccess
  onRemoved: () => void
  onSuggested: (label: string) => void
}) {
  const t = useTranslations('Collections')
  const locale = useLocale()
  const id = useId()
  const [title, setTitle] = useState(item.title)
  const [note, setNote] = useState(item.note)
  const [status, setStatus] = useState<string | null>(null)
  const heading = item.docTitle ?? item.title
  const url = `${base}/items/${item.id}`

  return (
    <li className="hub-item">
      <div className="hub-item__head">
        <div>
          <span className="hub-item__type">
            {item.docTitle || item.missing ? t('fromHub') : t('ownEntry')}
          </span>
          <h3>
            {item.docPath ? (
              <Link href={item.docPath}>{heading}</Link>
            ) : (
              heading || t('unavailable')
            )}
          </h3>
        </div>
        {item.suggestion && (
          <span className="state-badge">
            {t('suggested', { state: item.suggestion.stateLabel })}
          </span>
        )}
      </div>
      {access.edit ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setStatus((await hubRequest(url, 'PATCH', { title, note })) ? t('saved') : t('error'))
          }}
        >
          {!item.docTitle && !item.missing && (
            <>
              <label htmlFor={`${id}-title`} className="meta">
                {t('title')}
              </label>
              <input
                id={`${id}-title`}
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </>
          )}
          <label htmlFor={`${id}-note`} className="meta">
            {t('noteFor', { title: heading })}
          </label>
          <textarea
            id={`${id}-note`}
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="hub-item__actions">
            <button type="submit" className="button button--secondary">
              {t('save')}
            </button>
            <button
              type="button"
              className="button button--secondary"
              aria-label={`${t('removeItem')}: ${heading}`}
              onClick={async () =>
                (await hubRequest(url, 'DELETE')) ? onRemoved() : setStatus(t('error'))
              }
            >
              {t('removeItem')}
            </button>
            {access.manage && !item.suggestion && (
              <button
                type="button"
                className="button button--secondary"
                aria-label={`${t('suggest')}: ${heading}`}
                onClick={async () => {
                  const result = await hubRequest(`${url}/suggest`, 'POST', { locale })
                  if (result) onSuggested(t('state_neu'))
                  setStatus(result ? t('suggestedThanks') : t('error'))
                }}
              >
                {t('suggest')}
              </button>
            )}
            {status && (
              <span role="status" className="meta">
                {status}
              </span>
            )}
          </div>
        </form>
      ) : (
        item.note && <p className="hub-item__message">{item.note}</p>
      )}
    </li>
  )
}

function OwnEntryForm({ base, onAdded }: { base: string; onAdded: (item: EditorItem) => void }) {
  const t = useTranslations('Collections')
  const id = useId()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  return (
    <form
      className="hub-item stack-form"
      aria-labelledby={`${id}-heading`}
      onSubmit={async (e) => {
        e.preventDefault()
        const created = await hubRequest(`${base}/items`, 'POST', { title, note })
        setStatus(created ? t('added') : t('error'))
        if (created) {
          onAdded({
            id: created.id as string,
            title,
            docTitle: null,
            docPath: null,
            missing: false,
            note,
            suggestion: null,
          })
          setTitle('')
          setNote('')
        }
      }}
    >
      <h3 id={`${id}-heading`}>{t('ownEntryHeading')}</h3>
      <p className="meta">{t('ownEntryLead')}</p>
      <label htmlFor={`${id}-title`}>{t('title')}</label>
      <input
        id={`${id}-title`}
        type="text"
        required
        maxLength={200}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor={`${id}-note`}>{t('ownEntryNote')}</label>
      <textarea
        id={`${id}-note`}
        maxLength={2000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="hub-item__actions">
        <button type="submit" className="button button--secondary">
          {t('add')}
        </button>
        {status && (
          <span role="status" className="meta">
            {status}
          </span>
        )}
      </div>
    </form>
  )
}

function SharesSection({ base, initial }: { base: string; initial: EditorShare[] }) {
  const t = useTranslations('Collections')
  const s = useTranslations('Share')
  const id = useId()
  const [shares, setShares] = useState(initial)
  const [recipients, setRecipients] = useState<PickedMember[]>([])
  const [canEdit, setCanEdit] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  async function share(event: React.FormEvent) {
    event.preventDefault()
    if (!recipients.length) return setStatus({ ok: false, text: s('noRecipients') })
    for (const r of recipients) {
      if (!(await hubRequest(`${base}/shares`, 'POST', { memberId: r.id, canEdit, message })))
        return setStatus({ ok: false, text: t('error') })
    }
    setShares((list) => [
      ...list.filter((x) => !recipients.some((r) => r.id === x.id)),
      ...recipients.map((r) => ({ ...r, canEdit })),
    ])
    setStatus({ ok: true, text: s('sent', { count: recipients.length }) })
    setRecipients([])
    setMessage('')
  }

  return (
    <section className="content-section" aria-labelledby={`${id}-heading`} id="teilen">
      <h2 id={`${id}-heading`}>{t('sharesHeading')}</h2>
      <p className="meta">{t('sharesLead')}</p>
      {shares.length > 0 && (
        <ul className="hub-list">
          {shares.map((m) => (
            <li key={m.id} className="hub-item hub-item__head">
              <span>
                {m.name ? `${m.name} (${m.email})` : m.email} ·{' '}
                {m.canEdit ? t('rightEdit') : t('rightRead')}
              </span>
              <button
                type="button"
                className="button button--secondary"
                aria-label={`${t('revoke')}: ${m.name || m.email}`}
                onClick={async () =>
                  (await hubRequest(`${base}/shares`, 'DELETE', { memberId: m.id }))
                    ? setShares((list) => list.filter((x) => x.id !== m.id))
                    : setStatus({ ok: false, text: t('error') })
                }
              >
                {t('revoke')}
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="stack-form" onSubmit={share}>
        <MemberPicker value={recipients} onChange={setRecipients} />
        <label className="checkbox">
          <input type="checkbox" checked={canEdit} onChange={(e) => setCanEdit(e.target.checked)} />{' '}
          {t('allowEdit')}
        </label>
        <label htmlFor={`${id}-message`}>{s('message')}</label>
        <textarea
          id={`${id}-message`}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="hub-item__actions">
          <button type="submit" className="button button--primary">
            {t('shareButton')}
          </button>
          {status && (
            <span role={status.ok ? 'status' : 'alert'} className="meta">
              {status.text}
            </span>
          )}
        </div>
      </form>
    </section>
  )
}
