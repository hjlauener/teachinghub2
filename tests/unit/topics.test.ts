// @vitest-environment node
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

import { parseCrossReferences, parseOverview, parseTopicDraft, parseTopicStructure, topicPath } from '@/topics/parse'

const concept = (name: string) => readFileSync(path.resolve(__dirname, '../../docs/konzept-landingpages', name), 'utf-8')

describe('Themenstruktur (Konzept)', () => {
  const topics = parseTopicStructure(concept('Themenstruktur_gesamt.md'))

  it('liest 14 Kernthemen (8 A, 4 B, 2 C) mit 59 Unterthemen', () => {
    expect(topics).toHaveLength(14)
    expect(topics.filter((t) => t.category === 'A')).toHaveLength(8)
    expect(topics.filter((t) => t.category === 'B')).toHaveLength(4)
    expect(topics.filter((t) => t.category === 'C')).toHaveLength(2)
    expect(topics.flatMap((t) => t.subtopics)).toHaveLength(59)
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
