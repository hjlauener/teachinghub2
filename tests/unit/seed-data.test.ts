import { describe, expect, it } from 'vitest'

import { navigationSeed, taxonomySeed } from '@/seed/data'
import { mainNavigation } from '@/config/navigation'

const count = (type: string) => taxonomySeed.filter((t) => t.type === type).length

describe('Startdaten der Taxonomien (Analyse 5.1/5.2)', () => {
  it('hat 8 Rubriken, 25 Themen und die Methoden-Kategorien', () => {
    expect(count('rubrik')).toBe(8)
    expect(count('thema')).toBe(25)
    expect(count('zweck')).toBe(7)
    expect(count('modalitaet')).toBe(3)
    expect(count('sozialform')).toBe(4)
    expect(count('aufwand')).toBe(5)
  })

  it('Slugs sind pro Typ eindeutig', () => {
    const keys = taxonomySeed.map((t) => `${t.type}:${t.slug}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('jedes Thema verweist auf eine existierende Rubrik', () => {
    const rubrics = new Set(taxonomySeed.filter((t) => t.type === 'rubrik').map((t) => t.slug))
    for (const theme of taxonomySeed.filter((t) => t.type === 'thema')) {
      expect(rubrics.has(theme.parent ?? '')).toBe(true)
    }
  })

  it('Rubriken und Methoden-Kategorien sind dreisprachig', () => {
    for (const term of taxonomySeed.filter((t) => t.type !== 'thema')) {
      expect(term.name.en, term.slug).toBeTruthy()
      expect(term.name.fr, term.slug).toBeTruthy()
    }
  })

  it('Navigation im CMS entspricht der Code-Navigation', () => {
    expect(navigationSeed.map((n) => n.path)).toEqual(mainNavigation.map((n) => n.href))
  })
})
