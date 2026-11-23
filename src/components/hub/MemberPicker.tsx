'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useId, useState } from 'react'

export type PickedMember = { id: string; name: string; email: string }

const label = (m: PickedMember) => (m.name ? `${m.name} (${m.email})` : m.email)

/**
 * Mitglieder suchen und auswählen (Entscheidung 8.3): Autovervollständigung über Name/E-Mail ab 3 Zeichen.
 * Combobox nach ARIA-Muster; Pfeiltasten wählen, Enter übernimmt.
 */
export function MemberPicker({
  value,
  onChange,
  multiple = true,
}: {
  value: PickedMember[]
  onChange: (members: PickedMember[]) => void
  multiple?: boolean
}) {
  const t = useTranslations('Share')
  const id = useId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PickedMember[]>([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    if (query.trim().length < 3) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetch(`/api/hub/members?q=${encodeURIComponent(query.trim())}`, {
        credentials: 'same-origin',
        signal: controller.signal,
      })
        .then((r) => (r.ok ? (r.json() as Promise<{ members: PickedMember[] }>) : { members: [] }))
        .then((data) => {
          setResults(data.members.filter((m) => !value.some((v) => v.id === m.id)))
          setActive(-1)
        })
        .catch(() => null)
    }, 200)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, value])

  function pick(member: PickedMember) {
    onChange(multiple ? [...value, member] : [member])
    setQuery('')
    setResults([])
  }

  const listId = `${id}-list`
  const shown = query.trim().length >= 3 ? results : []
  const open = shown.length > 0
  return (
    <div className="member-picker">
      <label htmlFor={`${id}-input`}>{t('recipients')}</label>
      {value.length > 0 && (
        <ul className="member-picker__chips">
          {value.map((m) => (
            <li key={m.id}>
              {label(m)}{' '}
              <button
                type="button"
                className="link-button"
                aria-label={t('removeRecipient', { name: label(m) })}
                onClick={() => onChange(value.filter((v) => v.id !== m.id))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={`${id}-input`}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-describedby={`${id}-hint`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && open) {
            e.preventDefault()
            setActive((a) => (a + 1) % shown.length)
          } else if (e.key === 'ArrowUp' && open) {
            e.preventDefault()
            setActive((a) => (a <= 0 ? shown.length - 1 : a - 1))
          } else if (e.key === 'Enter' && open) {
            e.preventDefault()
            pick(shown[Math.max(active, 0)])
          } else if (e.key === 'Escape') {
            setResults([])
          }
        }}
      />
      <span id={`${id}-hint`} className="meta">
        {t('searchHint')}
      </span>
      <ul
        id={listId}
        role="listbox"
        className="member-picker__list"
        hidden={!open}
        aria-label={t('recipients')}
      >
        {shown.map((m, i) => (
          <li
            key={m.id}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(m)}
          >
            {label(m)}
          </li>
        ))}
      </ul>
    </div>
  )
}
