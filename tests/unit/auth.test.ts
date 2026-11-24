import { describe, expect, it } from 'vitest'

import { magicLinkEmail } from '@/auth/email'
import { DEFAULT_SETTINGS, emailDomain, ipAddressHeaders, localeFromMagicLink, localeFromPath, mayRegister, NAME_MAX, normalizeName } from '@/auth/rules'

describe('Zulassung neuer Konten (Entscheidungen 2.1/2.2)', () => {
  it('Standard: nur @unibe.ch, keine Subdomains', () => {
    expect(mayRegister('Anna.Muster@UNIBE.ch', DEFAULT_SETTINGS, false)).toEqual({ allowed: true })
    expect(mayRegister('anna@students.unibe.ch', DEFAULT_SETTINGS, false)).toEqual({ allowed: false, reason: 'domain' })
    expect(mayRegister('anna@gmail.com', DEFAULT_SETTINGS, false)).toEqual({ allowed: false, reason: 'domain' })
  })

  it('Einladung erlaubt auch fremde Domains', () => {
    expect(mayRegister('gast@phbern.ch', DEFAULT_SETTINGS, true)).toEqual({ allowed: true })
  })

  it('Modus „nur Einladung“ und „offen“', () => {
    expect(mayRegister('anna@unibe.ch', { mode: 'invite', domains: [] }, false)).toEqual({ allowed: false, reason: 'invite' })
    expect(mayRegister('anna@unibe.ch', { mode: 'invite', domains: [] }, true)).toEqual({ allowed: true })
    expect(mayRegister('jemand@example.org', { mode: 'open', domains: [] }, false)).toEqual({ allowed: true })
  })

  it('Domain-Liste ist konfigurierbar', () => {
    expect(mayRegister('anna@students.unibe.ch', { mode: 'domains', domains: ['unibe.ch', '@students.unibe.ch'] }, false)).toEqual({ allowed: true })
  })

  it('lehnt ungültige Adressen ab', () => {
    expect(mayRegister('keine-adresse', DEFAULT_SETTINGS, false)).toEqual({ allowed: false, reason: 'invalid' })
    expect(emailDomain(' A@Unibe.CH ')).toBe('unibe.ch')
  })
})

describe('Mail mit Anmeldelink', () => {
  it('ist dreisprachig und maskiert den Link', () => {
    const mail = magicLinkEmail('http://x/verify?token=a&b="c"', 'fr')
    expect(mail.subject).toMatch(/lien de connexion/)
    expect(mail.text).toContain('15 minutes')
    expect(mail.html).toContain('&quot;c&quot;')
    expect(mail.html).not.toContain('"c"')
  })
})

describe('Anmeldemail und Name (Review Phase 4/5)', () => {
  it('liest die Sprache aus dem kodierten Rücksprungpfad des Magic Links', () => {
    expect(localeFromMagicLink('http://localhost:3000/api/auth/magic-link/verify?token=abc&callbackURL=%2Ffr%2Fmein-hub')).toBe('fr')
    expect(localeFromMagicLink('http://localhost:3000/api/auth/magic-link/verify?token=abc&callbackURL=%2Fen')).toBe('en')
    expect(localeFromMagicLink('http://localhost:3000/api/auth/magic-link/verify?token=abc&callbackURL=%2F')).toBe('de')
    expect(localeFromMagicLink('kein url')).toBe('de')
    expect(localeFromPath('/en/methodenkompass?x=1')).toBe('en')
    expect(localeFromPath('/english')).toBe('de')
  })

  it('lässt als Namen nur einzeiligen Text bis 100 Zeichen zu', () => {
    expect(normalizeName('  Eva\r\nBcc: x@example.com ')).toBe('Eva Bcc: x@example.com')
    expect(normalizeName(undefined)).toBe('')
    expect(normalizeName({ evil: true })).toBeNull()
    expect(normalizeName(42)).toBeNull()
    expect(normalizeName('x'.repeat(NAME_MAX))).toHaveLength(NAME_MAX)
    expect(normalizeName('x'.repeat(NAME_MAX + 1))).toBeNull()
  })
})

describe('IP-Header für das Rate-Limit', () => {
  it('nimmt nur gültige Header-Namen, Standard x-forwarded-for', () => {
    expect(ipAddressHeaders(undefined)).toEqual(['x-forwarded-for'])
    expect(ipAddressHeaders(' X-Real-IP , cf-connecting-ip ')).toEqual(['x-real-ip', 'cf-connecting-ip'])
    expect(ipAddressHeaders('bad header!,')).toEqual(['x-forwarded-for'])
  })
})

describe('edu-ID (Phase 7)', () => {
  it('liest den Namen aus dem Profil', async () => {
    const { nameFromProfile } = await import('@/auth/eduid')
    expect(nameFromProfile({ name: ' Dora Dozentin ' })).toBe('Dora Dozentin')
    expect(nameFromProfile({ given_name: 'Dora', family_name: 'Dozentin' })).toBe('Dora Dozentin')
    expect(nameFromProfile({ name: 42 })).toBe('')
  })

  it('lässt über edu-ID dieselben Adressen zu wie beim Anmeldelink (Entscheidung 6.3)', () => {
    expect(mayRegister('dora.dozentin@unibe.ch', DEFAULT_SETTINGS, false)).toEqual({ allowed: true })
    expect(mayRegister('sina.studentin@students.unibe.ch', DEFAULT_SETTINGS, false)).toMatchObject({ allowed: false, reason: 'domain' })
    expect(mayRegister('paul.privat@example.org', DEFAULT_SETTINGS, false)).toMatchObject({ allowed: false, reason: 'domain' })
  })
})
