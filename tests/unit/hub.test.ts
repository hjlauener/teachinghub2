import { describe, expect, it } from 'vitest'

import { allowedOrigins, isAllowedOrigin, LIKE_THRESHOLD, normalizeNote, NOTE_MAX, parseRef, publicLikeCount, safeReturnPath } from '@/hub/rules'

describe('Persönliche Funktionen – Regeln (Phase 5)', () => {
  it('akzeptiert nur bekannte Collections und positive Ganzzahl-IDs', () => {
    expect(parseRef({ collection: 'methods', id: 6 })).toEqual({ collection: 'methods', id: 6 })
    expect(parseRef({ collection: 'methods', id: '6' })).toEqual({ collection: 'methods', id: 6 })
    expect(parseRef({ collection: 'users', id: 1 })).toBeNull()
    expect(parseRef({ collection: 'methods', id: 0 })).toBeNull()
    expect(parseRef({ collection: 'methods', id: 1.5 })).toBeNull()
    expect(parseRef({ collection: 'methods', id: '6 or 1=1' })).toBeNull()
    expect(parseRef(null)).toBeNull()
  })

  it('zeigt Like-Zähler erst ab 3 (Entscheidung 8.1)', () => {
    expect(LIKE_THRESHOLD).toBe(3)
    expect(publicLikeCount(0)).toBeNull()
    expect(publicLikeCount(2)).toBeNull()
    expect(publicLikeCount(3)).toBe(3)
    expect(publicLikeCount(12)).toBe(12)
  })

  it('bereinigt Notizen und begrenzt ihre Länge', () => {
    expect(normalizeNote(undefined)).toBe('')
    expect(normalizeNote('  Für Seminar 2\r\nnutzen \u0007 ')).toBe('Für Seminar 2\nnutzen')
    expect(normalizeNote(42)).toBeNull()
    expect(normalizeNote('x'.repeat(NOTE_MAX))).toHaveLength(NOTE_MAX)
    expect(normalizeNote('x'.repeat(NOTE_MAX + 1))).toBeNull()
  })

  it('führt nach der Anmeldung nur auf lokale Pfade mit Sprachpräfix zurück', () => {
    expect(safeReturnPath('/de/methodenkompass/advance_organizer', 'de')).toBe('/de/methodenkompass/advance_organizer')
    expect(safeReturnPath('/en/suche?q=feedback', 'en')).toBe('/en/suche?q=feedback')
    expect(safeReturnPath(undefined, 'fr')).toBe('/fr/mein-hub')
    expect(safeReturnPath('https://evil.example/de', 'de')).toBe('/de/mein-hub')
    expect(safeReturnPath('//evil.example/de', 'de')).toBe('/de/mein-hub')
    expect(safeReturnPath('/\\evil.example', 'de')).toBe('/de/mein-hub')
    expect(safeReturnPath('/admin', 'de')).toBe('/de/mein-hub')
    expect(safeReturnPath('/de/../admin', 'de')).toBe('/de/mein-hub')
  })

  it('lässt schreibende Anfragen nur von der eigenen Website zu', () => {
    const allowed = allowedOrigins({ BETTER_AUTH_URL: 'http://localhost:3000/', BETTER_AUTH_TRUSTED_ORIGINS: 'http://app:3000, kaputt' })
    expect(allowed).toEqual(['http://localhost:3000', 'http://app:3000'])
    expect(isAllowedOrigin('http://localhost:3000', 'same-origin', allowed)).toBe(true)
    expect(isAllowedOrigin('https://evil.example', 'cross-site', allowed)).toBe(false)
    expect(isAllowedOrigin(null, 'cross-site', allowed)).toBe(false)
    expect(isAllowedOrigin(null, null, allowed)).toBe(true)
  })
})
