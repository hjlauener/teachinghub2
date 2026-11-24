/**
 * SWITCH edu-ID (Entscheidungen 6.2, 6.3). Reine Funktionen, getestet.
 * Für die Zulassung gilt dieselbe Regel wie beim Anmeldelink: nur Adressen der zugelassenen Domain
 * (Standard @unibe.ch, ohne Subdomains – also nicht @students.unibe.ch). Die Zugehörigkeit der edu-ID
 * wird nicht ausgewertet.
 */

/** Anzeigename aus dem Profil (name, sonst Vor- und Nachname). */
export function nameFromProfile(profile: Record<string, unknown>): string {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  return str(profile.name) || [str(profile.given_name), str(profile.family_name)].filter(Boolean).join(' ')
}
