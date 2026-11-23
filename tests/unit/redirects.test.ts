import { describe, expect, it } from 'vitest'

import { localizeHref } from '@/components/content/RichText'
import { legacyRedirect } from '@/lib/redirects'

describe('Weiterleitung alter URLs (Entscheidung 7.2)', () => {
  it.each([
    ['/index_ger.html', '/de'],
    ['/journey_der_lehre/tools/zoom/index_ger.html', '/de/journey_der_lehre/tools/zoom'],
    ['/methodenkompass/quiz/index_eng.html', '/en/methodenkompass/quiz'],
    ['/ueber_uns/index_fra.html', '/fr/ueber_uns'],
    ['/unibe/portal/microsites/micro_teachinghub/content/methodenkompass/quiz/index_ger.html', '/de/methodenkompass/quiz'],
  ])('%s → %s', (from, to) => expect(legacyRedirect(from)).toBe(to))

  it('lässt neue Pfade und Dateien in Ruhe', () => {
    expect(legacyRedirect('/de/methodenkompass')).toBeNull()
    expect(legacyRedirect('/api/media/file/bild.png')).toBeNull()
    expect(legacyRedirect('/x/index_print_ger.html')).toBeNull()
  })
})

describe('Interne Links im Rich Text', () => {
  it('ergänzt das Sprachpräfix nur bei internen Pfaden', () => {
    expect(localizeHref('/journey_der_lehre/tools/zoom', 'fr')).toBe('/fr/journey_der_lehre/tools/zoom')
    expect(localizeHref('/', 'en')).toBe('/en')
    expect(localizeHref('/de/suche', 'fr')).toBe('/de/suche')
    expect(localizeHref('/api/media/file/a.pdf', 'en')).toBe('/api/media/file/a.pdf')
    expect(localizeHref('https://www.unibe.ch/', 'de')).toBe('https://www.unibe.ch/')
    expect(localizeHref('mailto:a@b.ch', 'de')).toBe('mailto:a@b.ch')
  })
})
