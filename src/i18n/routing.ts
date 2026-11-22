import { defineRouting } from 'next-intl/routing'

/**
 * Sprachen von TeachingHub2 (Entscheidung 4.1): DE ist Quellsprache, EN und FR aktiv.
 * URL-Schema (Entscheidung 7.2): /de/…, /en/…, /fr/… – Präfix immer sichtbar.
 */
export const locales = ['de', 'en', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'de'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // `/` führt immer auf Deutsch (wie die Altsite); keine automatische Wahl nach Browsersprache
  localeDetection: false,
})

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
