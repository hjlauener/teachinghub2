// @vitest-environment node
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { pickRandom } from '@/components/topics/pick'
import { countSentences } from '@/lib/validation'
import { parseCrossReferences, parseOverview, parseTopicDraft, parseTopicStructure, topicPath } from '@/topics/parse'

const concept = (name: string) => readFileSync(path.resolve(__dirname, '../../docs/konzept-landingpages', name), 'utf-8')

describe('Themenstruktur (Konzept)', () => {
  const topics = parseTopicStructure(concept('Themenstruktur_gesamt.md'))

  it('liest 20 Kernthemen (8 A, 10 B, 2 C) mit 76 Unterthemen (Entscheidung 7.9)', () => {
    expect(topics).toHaveLength(20)
    expect(topics.filter((t) => t.category === 'A')).toHaveLength(8)
    expect(topics.filter((t) => t.category === 'B')).toHaveLength(10)
    expect(topics.filter((t) => t.category === 'C')).toHaveLength(2)
    expect(topics.flatMap((t) => t.subtopics)).toHaveLength(76)
    // jedes Kernthema hat 3–8 Unterthemen, jedes Unterthema genau ein Zuhause
    expect(topics.every((t) => t.subtopics.length >= 3 && t.subtopics.length <= 8)).toBe(true)
    const titles = topics.flatMap((t) => t.subtopics.map((s) => s.title))
    expect(new Set(titles).size).toBe(titles.length)
    expect(topics.find((t) => t.title === 'Digitales Prüfen')?.subtopics.map((s) => s.title)).toContain('E-Prüfungen')
  })

  it('übernimmt Journey-Bezug und Methoden', () => {
    const ki = topics[0]
    expect(ki.title).toBe('KI in Lehre und Studium')
    expect(ki.journey).toEqual(['Lehre administrieren', 'Prüfungen gestalten'])
    const exam = ki.subtopics.find((s) => s.title === 'Prüfen im KI-Zeitalter')
    expect(exam?.methods).toContain('168-Stunden-Prüfung')
    expect(ki.subtopics.find((s) => s.title === 'KI-Regeln für die Lehrveranstaltung')?.methods).toEqual([])
  })

  it('liest die Querverweise', () => {
    const refs = parseCrossReferences(concept('Themenstruktur_gesamt.md'))
    expect(refs.get('Flipped Classroom')).toEqual(['Aktivierung in Grossveranstaltungen', 'Blended Learning'])
  })

  it('erzeugt Pfade wie die Altsite', () => {
    expect(topicPath('KI in Lehre und Studium')).toBe('/themen/ki_in_lehre_und_studium')
  })
})

describe('Übersicht und Entwürfe', () => {
  it('liest Beschreibungen und Matrix-Seiten', () => {
    const overview = parseOverview(concept('Landingpages/Startseite_Landingpages.html'))
    expect(overview.descriptions.get('Internationale Lehre')).toMatch(/englischer Sprache/)
    const matrix = overview.matrixPaths.get('KI in Lehre und Studium')
    expect(matrix).toHaveLength(6)
    expect(matrix?.[0]).toContain('/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/learning_outcomes')
  })

  it('liest den Entwurf „KI in Lehre und Studium“ mit allen Kapiteln', () => {
    const draft = parseTopicDraft(concept('Landingpages/A – Kernthemen/KI_in_Lehre_und_Studium.html'))
    expect(draft.title).toBe('KI in Lehre und Studium')
    expect(draft.keyPoints).toHaveLength(5)
    expect(draft.relatedLinks.length).toBeGreaterThanOrEqual(5)
    expect(draft.relatedLinks[0]).toMatchObject({ title: 'Leitlinien KI', href: '/journey_der_lehre/lehre_administrieren/pruefungsadministration/plagiat_und_plagiatspruefung/leitlinien_ki' })
    expect(draft.journeyLinks[0].label).toBe('Lehre konzipieren')
    expect(draft.tools.find((t) => t.name === 'Turnitin')?.href).toBe('/journey_der_lehre/tools/turnitin')
    expect(draft.toolsAsOf).toBe('2026-11-19')
    expect(draft.practice.length).toBeGreaterThan(0)
    expect(draft.offerLinks[0].label).toBe('Veranstaltung')
    expect(draft.externalLinks[0].label).toBe('Universität Zürich')
    expect(draft.seeAlso).toContain('Digitale und hybride Lehre')
  })
})

describe('Entwürfe aller Kernthemen (Entscheidung 7.8)', () => {
  const structure = parseTopicStructure(concept('Themenstruktur_gesamt.md'))
  const dir = path.resolve(__dirname, '../../docs/konzept-landingpages/Landingpages')
  const drafts = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) => readdirSync(path.join(dir, d.name)).filter((f) => f.endsWith('.html')).map((f) => parseTopicDraft(concept(`Landingpages/${d.name}/${f}`))))
  const phases = ['Lehre konzipieren', 'Lehre administrieren', 'Lehre durchführen', 'Prüfungen gestalten', 'Lehre evaluieren', 'Curriculum entwickeln']

  it('hat für jedes Kernthema genau einen Entwurf', () => {
    expect(drafts.map((d) => d.title).sort()).toEqual(structure.map((t) => t.title).sort())
  })

  it.each(structure.map((t) => t.title))('„%s“ hält die Kapitelregeln der Vorlage ein', (title) => {
    const draft = drafts.find((d) => d.title === title)!
    expect(draft.intro.length).toBeGreaterThan(100)
    expect(draft.keyPoints.length).toBeGreaterThanOrEqual(3)
    expect(draft.keyPoints.length).toBeLessThanOrEqual(5)
    expect(draft.relatedLinks.length).toBeGreaterThanOrEqual(5)
    expect(draft.relatedLinks.length).toBeLessThanOrEqual(10)
    expect(draft.tools.length).toBeGreaterThan(0)
    expect(draft.tools.every((t) => t.name && t.purpose)).toBe(true)
    expect(draft.journeyLinks.length).toBeGreaterThanOrEqual(5)
    expect(draft.journeyLinks.length).toBeLessThanOrEqual(10)
    // Journey-Links zeigen auf Hub-Seiten und tragen die Phase als Label (zählen für „live“)
    expect(draft.journeyLinks.every((l) => l.href.startsWith('/journey_der_lehre/') && phases.includes(l.label ?? ''))).toBe(true)
    expect(draft.offerLinks.length).toBeGreaterThanOrEqual(3)
    expect(draft.offerLinks.length).toBeLessThanOrEqual(6)
    expect(draft.externalLinks.length).toBeGreaterThanOrEqual(4)
    expect(draft.externalLinks.length).toBeLessThanOrEqual(8)
    expect(draft.externalLinks.every((l) => l.href.startsWith('https://') && l.label)).toBe(true)
    for (const link of [...draft.relatedLinks, ...draft.journeyLinks, ...draft.offerLinks, ...draft.externalLinks]) {
      expect(link.title, title).not.toBe('')
      expect(link.sentence, `${title}: ${link.title}`).toMatch(/\.$/)
      // gleiche Regel wie im CMS (validateOneSentence), sonst scheitert das Live-Schalten
      expect(countSentences(link.sentence), `${title}: ${link.title}`).toBe(1)
    }
  })
})

describe('Zufällige Auswahl der Hinweise anderer Hochschulen', () => {
  it('zeigt höchstens 4, jeden höchstens einmal, und mischt', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const picked = pickRandom(items, 4)
    expect(picked).toHaveLength(4)
    expect(new Set(picked).size).toBe(4)
    expect(picked.every((i) => items.includes(i))).toBe(true)
    expect(pickRandom([1, 2], 4)).toHaveLength(2)
    // deterministischer Zufall: random() = 0 vertauscht jeweils mit dem ersten Element
    expect(pickRandom([1, 2, 3], 3, () => 0)).toEqual([2, 3, 1])
    expect(items).toEqual([1, 2, 3, 4, 5, 6])
  })
})

describe('Matrix Themen × Journey', () => {
  it('ordnet Seiten über den Pfad einer Phase zu', async () => {
    const { phaseOf, buildMatrix } = await import('@/topics/matrix')
    expect(phaseOf('/journey_der_lehre/pruefungen_gestalten/x/y')).toBe(3)
    expect(phaseOf('/journey_der_lehre/tools/zoom')).toBe(-1)
    const matrix = buildMatrix([
      {
        id: 1,
        title: 'T',
        path: '/themen/t',
        category: 'A',
        pageStatus: 'planned',
        journeyPages: [
          { relationTo: 'articles', value: { id: 9, title: 'A', path: '/journey_der_lehre/lehre_konzipieren/a/b' } },
          { relationTo: 'articles', value: { id: 8, title: 'B', path: '/journey_der_lehre/curriculum_entwickeln/c' } },
        ],
      } as never,
    ])
    expect(matrix[0].cells.map((c) => c.length)).toEqual([1, 0, 0, 0, 0, 1])
  })
})
