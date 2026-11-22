// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { wordDiff } from '@/components/admin/wordDiff'
import { classify, extractPage, parseMethodsCsv, sectionForHeading } from '@/migration/extract'
import { hashValue, locallyModified } from '@/migration/fields'
import { valueToText } from '@/migration/text'
import { isCrawlablePage, legacyUrlToPath, normalizeLegacyUrl } from '@/migration/urls'

const fixture = (name: string) => readFileSync(path.resolve(__dirname, '../fixtures/legacy', name), 'utf-8')
const BASE = 'https://teachinghub.unibe.ch'

describe('URLs der Altsite (Entscheidung 7.2)', () => {
  it('normalisiert Host, interne ZMS-Pfade und Fragmente', () => {
    expect(normalizeLegacyUrl('https://www.teachinghub.unibe.ch/x/index_ger.html#a')).toBe(`${BASE}/x/index_ger.html`)
    expect(normalizeLegacyUrl('/unibe/portal/microsites/micro_teachinghub/content/methodenkompass/quiz/index_ger.html')).toBe(
      `${BASE}/methodenkompass/quiz/index_ger.html`,
    )
    expect(normalizeLegacyUrl('https://www.unibe.ch/index_ger.html')).toBeNull()
    expect(normalizeLegacyUrl('mailto:a@b.ch')).toBeNull()
  })

  it('wandelt Altsite-URLs in neue Pfade', () => {
    expect(legacyUrlToPath(`${BASE}/index_ger.html`)).toBe('/')
    expect(legacyUrlToPath(`${BASE}/journey_der_lehre/tools/zoom/index_ger.html`)).toBe('/journey_der_lehre/tools/zoom')
  })

  it('respektiert robots.txt', () => {
    expect(isCrawlablePage(`${BASE}/journey_der_lehre/index_ger.html`)).toBe(true)
    expect(isCrawlablePage(`${BASE}/journey_der_lehre/index_print_ger.html`)).toBe(false)
    expect(isCrawlablePage(`${BASE}/suche/search_ger.html`)).toBe(false)
    expect(isCrawlablePage(`${BASE}/x/index_ger.html?preview=preview`)).toBe(false)
  })
})

describe('Seitentypen aus dem Pfad', () => {
  it.each([
    ['/', 'pages', 'home'],
    ['/journey_der_lehre/lehre_konzipieren', 'pages', 'rubric'],
    ['/journey_der_lehre/lehre_konzipieren/lehrformate/vorlesung', 'articles', undefined],
    ['/journey_der_lehre/tools/zoom/zoom_faq', 'tools', undefined],
    ['/methodenkompass/quiz', 'methods', undefined],
    ['/ablage/news/sub_motion', 'news', undefined],
  ])('%s → %s', (p, collection, pageKind) => {
    const result = classify(p)
    expect(result.collection).toBe(collection)
    expect(result.pageKind).toBe(pageKind)
  })

  it('Angebote unter Lehr|Impulse, Eltern für Unterseiten', () => {
    expect(classify('/journey_der_lehre/lehrimpulse__unibe/kurse/ilias_schulungen').kind).toBe('offer')
    expect(classify('/journey_der_lehre/tools/zoom/zoom_faq').parentPath).toBe('/journey_der_lehre/tools/zoom')
    expect(classify('/journey_der_lehre/a/b/c/d').parentPath).toBe('/journey_der_lehre/a/b/c')
  })

  it('erkennt die Abschnittsüberschriften der Vorlage', () => {
    expect(sectionForHeading('Was steckt dahinter – und wofür ist es gut?')).toBe('whatIsBehind')
    expect(sectionForHeading('Stolperfrei durchstarten')).toBe('gettingStarted')
    expect(sectionForHeading('Das Format')).toBeNull()
  })
})

describe('Extraktion eines Artikels', () => {
  const doc = extractPage(fixture('article.html'), `${BASE}/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/testartikel/index_ger.html`)

  it('liest Titel, Lead, Datum und Pfad', () => {
    expect(doc.title).toBe('Testartikel')
    expect(doc.lead).toBe('Ein künstlicher Artikel für Tests')
    expect(doc.legacyDate).toBe('2026-03-15')
    expect(doc.path).toBe('/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/testartikel')
    expect(doc.collection).toBe('articles')
  })

  it('verteilt die Inhalte auf die festen Abschnitte', () => {
    expect(doc.sections.whatIsBehind).toContain('Erster Absatz')
    expect(doc.sections.whatIsBehind).not.toContain('Wegweiser')
    expect(doc.sections.insights).toEqual([{ title: 'Praxis an der Fakultät', html: expect.stringContaining('ersten Einblicks') }])
    expect(doc.sections.gettingStarted).toContain('Tipp eins')
    expect(doc.sections.gettingStarted).toContain('<table>')
    expect(doc.sections.literature).toContain('Ein Buch')
    expect(doc.sections.support).toContain('Beratung beim Team')
  })

  it('schreibt interne Links auf neue Pfade um und markiert Videos', () => {
    expect(doc.sections.whatIsBehind).toContain('href="/journey_der_lehre/tools/zoom"')
    expect(doc.sections.gettingStarted).toContain('§§VIDEO§§https://tube.switch.ch/embed/abc§§Lehrvideo§§')
  })

  it('Hash ist stabil und reagiert auf Inhaltsänderungen', () => {
    const again = extractPage(fixture('article.html'), doc.legacyUrl)
    expect(again.hash).toBe(doc.hash)
    const changed = extractPage(fixture('article.html').replace('Tipp eins', 'Tipp EINS'), doc.legacyUrl)
    expect(changed.hash).not.toBe(doc.hash)
  })
})

describe('Methoden', () => {
  it('übernimmt alternative Methoden mit Vergleichstext', () => {
    const doc = extractPage(fixture('method.html'), `${BASE}/methodenkompass/testmethode/index_ger.html`)
    expect(doc.sections.alternatives).toEqual([{ path: '/methodenkompass/andere_methode', note: 'Vergleich in einem Satz.' }])
  })

  it('liest die Methodenkompass-CSV mit mehrzeiligen Werten', () => {
    const rows = parseMethodsCsv(fixture('methods.csv'))
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      name: 'Testmethode',
      path: '/methodenkompass/testmethode',
      purposes: ['Verarbeiten', 'Formatives Prüfen'],
      modalities: ['Schriftlich'],
      socialForms: ['Einzeln', 'Gruppe'],
      effort: 'Niedrig bis mittel',
    })
  })
})

describe('Änderungserkennung (Entscheidung 3.2)', () => {
  it('ignoriert IDs, Schlüsselreihenfolge und null vs. fehlend', () => {
    expect(hashValue({ a: 1, b: null, list: [{ id: 'x', t: 'Text' }] })).toBe(hashValue({ list: [{ t: 'Text', id: 'y' }], a: 1 }))
    expect(hashValue({ a: 1 })).not.toBe(hashValue({ a: 2 }))
  })

  it('erkennt lokal geänderte Felder', () => {
    const imported = { title: 'Alt', lead: 'Lead' }
    const hashes = { title: hashValue(imported.title), lead: hashValue(imported.lead) }
    expect(locallyModified('pages', { title: 'Neu', intro: null }, { ...hashes, intro: hashValue(null) })).toEqual(['title'])
  })

  it('macht Lexical-Inhalte lesbar', () => {
    const lexical = { root: { type: 'root', children: [{ type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Titel' }] }, { type: 'paragraph', children: [{ type: 'text', text: 'Absatz' }] }] } }
    expect(valueToText(lexical)).toBe('## Titel\nAbsatz')
  })

  it('Wort-Diff markiert Einfügungen und Löschungen', () => {
    expect(wordDiff('a b c', 'a x c')).toEqual([
      { type: 'same', text: 'a ' },
      { type: 'removed', text: 'b' },
      { type: 'added', text: 'x' },
      { type: 'same', text: ' c' },
    ])
  })
})
