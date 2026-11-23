import { describe, expect, it } from 'vitest'

import { magicLinkEmail } from '@/auth/email'
import { DEFAULT_SETTINGS, emailDomain, mayRegister } from '@/auth/rules'

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
