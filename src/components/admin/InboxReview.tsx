'use client'

import { Button, useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { wordDiff } from './wordDiff'

type FieldDiff = { field: string; base: string; proposed: string; current: string; conflict: boolean }
type Entry = {
  id: number
  path: string
  status: string
  changeType: 'new' | 'changed' | 'removed'
  summary?: string
  legacyUrl?: string
  diffs?: FieldDiff[]
  conflicts?: string[]
}

const box: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 4,
  padding: 12,
  whiteSpace: 'pre-wrap',
  fontSize: 13,
  lineHeight: 1.5,
  maxHeight: 420,
  overflow: 'auto',
  background: 'var(--theme-elevation-0)',
}

function Diff({ before, after }: { before: string; after: string }) {
  const parts = useMemo(() => wordDiff(before, after), [before, after])
  return (
    <div style={box}>
      {parts.map((part, i) =>
        part.type === 'same' ? (
          <span key={i}>{part.text}</span>
        ) : part.type === 'added' ? (
          <ins key={i} style={{ background: 'var(--theme-success-100)', textDecoration: 'none' }}>
            {part.text}
          </ins>
        ) : (
          <del key={i} style={{ background: 'var(--theme-error-100)' }}>
            {part.text}
          </del>
        ),
      )}
    </div>
  )
}

/** 3-Wege-Ansicht eines Inbox-Eintrags mit Aktionen (Plan Abschnitt 6, Entscheidung 3.2). */
export function InboxReview() {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [resolutions, setResolutions] = useState<Record<string, 'legacy' | 'local'>>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/migration-inbox/${id}?depth=0`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setEntry)
      .catch(() => setMessage('Eintrag konnte nicht geladen werden.'))
  }, [id])

  if (!entry) return <p>{message ?? 'Lade …'}</p>

  const open = entry.status === 'open' || entry.status === 'later'
  const conflicts = entry.conflicts ?? []
  const unresolved = conflicts.filter((f) => !resolutions[f])

  async function act(action: 'apply' | 'ignore' | 'later') {
    setBusy(true)
    setMessage(null)
    const response = await fetch(`/api/migration-inbox/${id}/resolve`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, resolutions }),
    })
    const result = await response.json()
    setBusy(false)
    if (!response.ok) return setMessage(result.error ?? 'Fehler')
    setEntry(result.doc)
    setMessage(action === 'apply' ? 'Übernommen.' : action === 'ignore' ? 'Ignoriert.' : 'Zurückgestellt.')
    router.refresh()
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ marginTop: 0 }}>{entry.summary}</h3>
      {entry.legacyUrl && (
        <p>
          Altsite:{' '}
          <a href={entry.legacyUrl} target="_blank" rel="noreferrer">
            {entry.legacyUrl}
          </a>
        </p>
      )}

      {entry.changeType === 'removed' && <p>Übernehmen setzt die Seite auf „Entwurf“ (nicht öffentlich). Gelöscht wird nichts.</p>}

      {(entry.diffs ?? []).map((diff) => (
        <section key={diff.field} style={{ margin: '24px 0' }}>
          <h4 style={{ marginBottom: 8 }}>
            {diff.field}
            {diff.conflict && <span style={{ color: 'var(--theme-error-500)', marginLeft: 8 }}>Konflikt: lokal geändert</span>}
          </h4>
          {entry.changeType === 'new' ? (
            <div style={box}>{diff.proposed}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: diff.conflict ? '1fr 1fr' : '1fr', gap: 12 }}>
              <div>
                <strong>Altsite: Basis → neu</strong>
                <Diff before={diff.base} after={diff.proposed} />
              </div>
              {diff.conflict && (
                <div>
                  <strong>Aktuell im CMS (lokal geändert)</strong>
                  <div style={box}>{diff.current}</div>
                </div>
              )}
            </div>
          )}
          {diff.conflict && open && (
            <fieldset style={{ border: 0, padding: 0, marginTop: 8 }}>
              <legend className="visually-hidden">Fassung für {diff.field}</legend>
              <label style={{ marginRight: 16 }}>
                <input
                  type="radio"
                  name={`res-${diff.field}`}
                  checked={resolutions[diff.field] === 'legacy'}
                  onChange={() => setResolutions({ ...resolutions, [diff.field]: 'legacy' })}
                />{' '}
                Altsite übernehmen
              </label>
              <label>
                <input
                  type="radio"
                  name={`res-${diff.field}`}
                  checked={resolutions[diff.field] === 'local'}
                  onChange={() => setResolutions({ ...resolutions, [diff.field]: 'local' })}
                />{' '}
                Lokale Fassung behalten
              </label>
            </fieldset>
          )}
        </section>
      ))}

      {open ? (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => act('apply')} disabled={busy || unresolved.length > 0}>
            Übernehmen
          </Button>
          <Button buttonStyle="secondary" onClick={() => act('later')} disabled={busy}>
            Später
          </Button>
          <Button buttonStyle="secondary" onClick={() => act('ignore')} disabled={busy}>
            Ignorieren
          </Button>
          {unresolved.length > 0 && <span>Bitte zuerst bei jedem Konflikt eine Fassung wählen.</span>}
        </div>
      ) : (
        <p>
          Status: <strong>{entry.status}</strong>
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  )
}
