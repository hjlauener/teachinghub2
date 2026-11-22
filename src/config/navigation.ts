/**
 * Hauptnavigation (Entscheidungen 7.1, 7.2, 7.5).
 * Pfade entsprechen den Pfaden der Altsite ohne `index_ger.html`;
 * „Themen“ ist der neue Menüpunkt für die Landingpages.
 */
export type NavKey = 'home' | 'journey' | 'topics' | 'methods' | 'search' | 'about'

export interface NavItem {
  key: NavKey
  href: string
}

export const mainNavigation: NavItem[] = [
  { key: 'home', href: '/' },
  { key: 'journey', href: '/journey_der_lehre' },
  { key: 'topics', href: '/themen' },
  { key: 'methods', href: '/methodenkompass' },
  { key: 'search', href: '/suche' },
  { key: 'about', href: '/ueber_uns' },
]

/** Gibt zurück, ob ein Menüpunkt zum aktuellen Pfad (ohne Sprachpräfix) gehört. */
export function isActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/') return pathname === '/' || pathname === ''
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
}

export const externalLinks = {
  portal: 'https://www.unibe.ch/index_ger.html',
  legal: 'https://www.unibe.ch/rechtliche_hinweise/index_ger.html',
  imprint: 'https://www.unibe.ch/impressum/index_ger.html',
}
