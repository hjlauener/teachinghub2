'use client'

import { Button } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

/** Startet den Delta-Abgleich mit der Altsite (Crawl + Vergleich) aus der Inbox-Liste. */
export function DeltaRunButton() {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const poll = useCallback(
    () =>
      fetch('/api/migration-inbox/delta-status', { credentials: 'include' })
        .then((response) => (response.ok ? (response.json() as Promise<{ running: boolean }>) : { running: false }))
        .then(({ running: isRunning }) => {
          setRunning(isRunning)
          return isRunning
        }),
    [],
  )

  useEffect(() => {
    poll().catch(() => undefined)
  }, [poll])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(async () => {
      if (!(await poll())) {
        setMessage('Abgleich abgeschlossen.')
        router.refresh()
      }
    }, 10_000)
    return () => clearInterval(timer)
  }, [running, poll, router])

  async function start() {
    setMessage(null)
    const response = await fetch('/api/migration-inbox/run-delta', { method: 'POST', credentials: 'include' })
    if (response.status === 202 || response.status === 409) {
      setRunning(true)
      setMessage('Abgleich läuft (Crawl der Altsite, einige Minuten) …')
    } else setMessage('Start fehlgeschlagen.')
  }

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '0 0 24px', flexWrap: 'wrap' }}>
      <Button onClick={start} disabled={running}>
        {running ? 'Abgleich läuft …' : 'Abgleich mit der Altsite starten'}
      </Button>
      <span role="status">{message ?? 'Neue, geänderte und entfernte Seiten erscheinen hier. Nichts wird automatisch übernommen.'}</span>
    </div>
  )
}
