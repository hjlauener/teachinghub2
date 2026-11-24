import { describe, expect, it } from 'vitest'

import { formatChanges } from '@/migration/changes'

describe('Liste der Altsite-Änderungen', () => {
  const date = new Date('2026-11-24T10:00:00Z')

  it('meldet, wenn nichts offen ist', () => {
    expect(formatChanges([], date)).toContain('Keine offenen Änderungen')
  })

  it('gruppiert nach Art, sortiert nach Pfad und zeigt Felder, Konflikte und Status', () => {
    const text = formatChanges(
      [
        { path: '/b', changeType: 'changed', status: 'open', changedFields: ['lead'], summary: 'Geändert: lead', legacyUrl: 'https://teachinghub.unibe.ch/b/index_ger.html' },
        { path: '/a', changeType: 'changed', status: 'later', changedFields: ['body'], summary: 'Geändert: body – Konflikt bei body' },
        { path: '/neu', changeType: 'new', status: 'open' },
        { path: '/weg', changeType: 'removed', status: 'open' },
      ],
      date,
    )
    expect(text).toContain('# Änderungen der Altsite (Stand 2026-11-24)')
    expect(text).toContain('4 offene Einträge')
    expect(text.indexOf('`/a`')).toBeLessThan(text.indexOf('`/b`'))
    expect(text).toContain('- `/a` [später] – Felder: body ⚠ Konflikt mit lokaler Bearbeitung')
    expect(text).toContain('https://teachinghub.unibe.ch/b/index_ger.html')
    expect(text).toContain('## Neu auf der Altsite (1)')
    expect(text).toContain('## Auf der Altsite entfernt (1)')
  })
})
