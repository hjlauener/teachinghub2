'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import type { SearchMode } from '@/ai/rules'

/**
 * Umschalter „Suchen / Fragen“ auf der Suchseite (Entscheidung 8.8). Ohne `?modus=` in der Adresse gilt die
 * zuletzt gewählte Einstellung des Mitglieds; jede Wahl wird für angemeldete Mitglieder gespeichert.
 * Ohne JavaScript bleibt die Suche voll nutzbar (Fragen braucht ohnehin JavaScript).
 */
export function SearchModes({ initialMode, explicit, search, ask }: { initialMode: SearchMode; explicit: boolean; search: React.ReactNode; ask: React.ReactNode }) {
  const t = useTranslations('Ask')
  const [mode, setMode] = useState<SearchMode>(initialMode)
  const [member, setMember] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/hub/search-mode', { credentials: 'same-origin' })
      .then((r) => (r.ok ? (r.json() as Promise<{ member: boolean; mode: SearchMode }>) : null))
      .then((data) => {
        if (!active || !data) return
        setMember(data.member)
        if (!explicit && data.member) setMode(data.mode)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [explicit])

  function choose(next: SearchMode) {
    setMode(next)
    const url = new URL(window.location.href)
    url.searchParams.set('modus', next)
    window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    if (member)
      void fetch('/api/hub/search-mode', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: next }),
      }).catch(() => undefined)
  }

  const tab = (value: SearchMode, label: string) => (
    <button
      type="button"
      role="tab"
      id={`modus-${value}`}
      aria-selected={mode === value}
      aria-controls={`panel-${value}`}
      tabIndex={mode === value ? 0 : -1}
      className="tabs__tab"
      onClick={() => choose(value)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const next = value === 'suchen' ? 'fragen' : 'suchen'
          choose(next)
          document.getElementById(`modus-${next}`)?.focus()
        }
      }}
    >
      {label}
    </button>
  )

  return (
    <>
      <div role="tablist" aria-label={t('modeLabel')} className="tabs__list search-modes">
        {tab('suchen', t('modeSearch'))}
        {tab('fragen', t('modeAsk'))}
      </div>
      <div role="tabpanel" id="panel-suchen" aria-labelledby="modus-suchen" hidden={mode !== 'suchen'}>
        {search}
      </div>
      <div role="tabpanel" id="panel-fragen" aria-labelledby="modus-fragen" hidden={mode !== 'fragen'}>
        {mode === 'fragen' && ask}
      </div>
    </>
  )
}
