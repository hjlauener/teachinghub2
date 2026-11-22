import { describe, expect, it } from 'vitest'

import { isActive, mainNavigation } from '@/config/navigation'

describe('Hauptnavigation', () => {
  it('enthält die sechs Menüpunkte in der festgelegten Reihenfolge (7.5)', () => {
    expect(mainNavigation.map((item) => item.key)).toEqual([
      'home',
      'journey',
      'topics',
      'methods',
      'search',
      'about',
    ])
  })

  it('verwendet die Pfade der Altsite (7.2)', () => {
    const hrefs = Object.fromEntries(mainNavigation.map((item) => [item.key, item.href]))
    expect(hrefs.journey).toBe('/journey_der_lehre')
    expect(hrefs.methods).toBe('/methodenkompass')
    expect(hrefs.about).toBe('/ueber_uns')
  })

  it('markiert Unterseiten als aktiv, aber nicht die Startseite', () => {
    expect(isActive('/journey_der_lehre', '/journey_der_lehre/lehre_konzipieren')).toBe(true)
    expect(isActive('/journey_der_lehre', '/journey_der_lehre_x')).toBe(false)
    expect(isActive('/', '/methodenkompass')).toBe(false)
    expect(isActive('/', '/')).toBe(true)
  })
})
