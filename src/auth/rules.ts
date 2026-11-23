/**
 * Wer darf ein Mitgliederkonto anlegen? (Entscheidungen 2.1, 2.2)
 * Modus per Einstellung umschaltbar: nur mit Einladung · Domain-Liste (Standard: unibe.ch) · offen.
 * Bestehende Mitglieder dürfen sich immer anmelden.
 */
export type RegistrationMode = 'invite' | 'domains' | 'open'

export type RegistrationSettings = { mode: RegistrationMode; domains: string[] }

export const DEFAULT_SETTINGS: RegistrationSettings = { mode: 'domains', domains: ['unibe.ch'] }

export type Decision = { allowed: true } | { allowed: false; reason: 'invalid' | 'domain' | 'invite' }

const EMAIL = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Genau die Domain, keine Subdomains: `students.unibe.ch` ist nicht `unibe.ch` (Entscheidung 2.2). */
export function emailDomain(email: string): string | null {
  return normalizeEmail(email).match(EMAIL)?.[1] ?? null
}

export function mayRegister(email: string, settings: RegistrationSettings, invited: boolean): Decision {
  const domain = emailDomain(email)
  if (!domain) return { allowed: false, reason: 'invalid' }
  switch (settings.mode) {
    case 'open':
      return { allowed: true }
    case 'invite':
      return invited ? { allowed: true } : { allowed: false, reason: 'invite' }
    case 'domains': {
      const allowed = settings.domains.map((d) => d.trim().toLowerCase().replace(/^@/, '')).filter(Boolean)
      return invited || allowed.includes(domain) ? { allowed: true } : { allowed: false, reason: 'domain' }
    }
  }
}

export const REASON_MESSAGES: Record<'invalid' | 'domain' | 'invite', { de: string; en: string; fr: string }> = {
  invalid: { de: 'Bitte eine gültige E-Mail-Adresse eingeben.', en: 'Please enter a valid email address.', fr: 'Veuillez saisir une adresse e-mail valide.' },
  domain: {
    de: 'Ein Konto ist im Prototyp nur mit einer Adresse der Universität Bern (@unibe.ch) möglich.',
    en: 'In this prototype, accounts are only available with a University of Bern address (@unibe.ch).',
    fr: 'Dans ce prototype, un compte n’est possible qu’avec une adresse de l’Université de Berne (@unibe.ch).',
  },
  invite: { de: 'Ein Konto ist derzeit nur mit Einladung möglich.', en: 'Accounts are currently by invitation only.', fr: 'Un compte n’est actuellement possible que sur invitation.' },
}
