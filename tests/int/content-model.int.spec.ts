import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Taxonomy, User } from '@/payload-types'
import { seed } from '@/seed/seed'

/**
 * Abnahme Phase 1: Redaktion legt Artikel, Methode und Kernthema an; Rollen und Sprachrechte greifen.
 * Läuft gegen die Datenbank aus DATABASE_URL und räumt eigene Testdaten wieder auf.
 */
let payload: Payload
const run = Math.random().toString(36).slice(2, 8)
const users: Record<'editor' | 'translator', User> = {} as never
const created: { collection: 'articles' | 'methods' | 'topics' | 'users'; id: number }[] = []
let rubric: Taxonomy
let theme: Taxonomy
const methodTerms: Record<string, Taxonomy> = {}

const lexical = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      },
    ],
  },
})

async function term(type: string, slug: string) {
  const { docs } = await payload.find({
    collection: 'taxonomies',
    where: { and: [{ type: { equals: type } }, { slug: { equals: slug } }] },
    limit: 1,
    overrideAccess: true,
  })
  return docs[0]
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  await seed(payload)

  // Auf leerer DB wird das erste Konto automatisch Admin (Users-Hook) – deshalb zuerst ein Admin
  const admins = await payload.count({ collection: 'users', where: { roles: { contains: 'admin' } }, overrideAccess: true })
  if (admins.totalDocs === 0) {
    const admin = await payload.create({
      collection: 'users',
      data: { email: `admin-${run}@test.local`, password: `test-${run}-Passwort!`, roles: ['admin'], name: 'admin' },
      overrideAccess: true,
    })
    created.push({ collection: 'users', id: admin.id })
  }

  for (const [key, role] of [
    ['editor', 'redaktion'],
    ['translator', 'uebersetzer'],
  ] as const) {
    const user = await payload.create({
      collection: 'users',
      data: { email: `${key}-${run}@test.local`, password: `test-${run}-Passwort!`, roles: [role], name: key },
      overrideAccess: true,
    })
    users[key] = user
    created.push({ collection: 'users', id: user.id })
  }

  rubric = await term('rubrik', 'lehre_konzipieren')
  theme = await term('thema', 'didaktische_grundlagen')
  for (const [type, slug] of [
    ['zweck', 'verarbeiten'],
    ['modalitaet', 'schriftlich'],
    ['sozialform', 'gruppe'],
    ['aufwand', 'niedrig'],
  ]) {
    methodTerms[type] = await term(type, slug)
  }
})

afterAll(async () => {
  for (const { collection, id } of created.reverse()) {
    await payload.delete({ collection, id, overrideAccess: true }).catch(() => undefined)
  }
  await payload?.destroy()
})

describe('Taxonomien', () => {
  it('Seed hat Themen ihrer Rubrik zugeordnet', () => {
    expect(rubric.name).toBe('Lehre konzipieren')
    const parent = typeof theme.parent === 'object' ? theme.parent?.id : theme.parent
    expect(parent).toBe(rubric.id)
  })

  it('Rubriken haben Übersetzungen', async () => {
    const fr = await payload.findByID({ collection: 'taxonomies', id: rubric.id, locale: 'fr', overrideAccess: true })
    expect(fr.name).toBe("Concevoir l'enseignement")
  })

  it('verhindert doppelte Slugs pro Typ', async () => {
    await expect(
      payload.create({ collection: 'taxonomies', data: { type: 'rubrik', slug: 'tools', name: 'Doppelt' }, overrideAccess: true }),
    ).rejects.toThrow()
  })
})

describe('Redaktion legt Inhalte an (Abnahme Phase 1)', () => {
  let articleId: number

  it('Artikel als Entwurf mit Rubrik und Thema', async () => {
    const article = await payload.create({
      collection: 'articles',
      data: {
        title: `Testartikel ${run}`,
        lead: 'Kompetenzen formulieren, Lernen fokussieren',
        path: `/journey_der_lehre/test_${run}`,
        rubrics: [rubric.id],
        themes: [theme.id],
        whatIsBehind: lexical('Learning Outcomes beschreiben, was Lernende können sollen.'),
        insights: [{ title: 'Einblick 1', content: lexical('Ein Praxisbeispiel.') }],
      },
      draft: true,
      user: users.editor,
      overrideAccess: false,
    })
    articleId = article.id
    created.push({ collection: 'articles', id: article.id })
    expect(article._status).toBe('draft')
  })

  it('Entwürfe sind öffentlich unsichtbar, nach Publikation sichtbar', async () => {
    const before = await payload.find({ collection: 'articles', where: { id: { equals: articleId } }, overrideAccess: false })
    expect(before.totalDocs).toBe(0)

    await payload.update({ collection: 'articles', id: articleId, data: { _status: 'published' }, user: users.editor, overrideAccess: false })

    const after = await payload.find({ collection: 'articles', where: { id: { equals: articleId } }, overrideAccess: false })
    expect(after.totalDocs).toBe(1)
  })

  it('lehnt ungültige Pfade ab', async () => {
    await expect(
      payload.create({
        collection: 'articles',
        data: { title: 'Falscher Pfad', kind: 'article', path: '/journey_der_lehre/index_ger.html' },
        user: users.editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('Methode mit den vier Methodenkompass-Kategorien', async () => {
    const method = await payload.create({
      collection: 'methods',
      data: {
        title: `Testmethode ${run}`,
        path: `/methodenkompass/test_${run}`,
        purposes: [methodTerms.zweck.id],
        modalities: [methodTerms.modalitaet.id],
        socialForms: [methodTerms.sozialform.id],
        effort: methodTerms.aufwand.id,
        _status: 'published',
      },
      user: users.editor,
      overrideAccess: false,
    })
    created.push({ collection: 'methods', id: method.id })
    expect(method._status).toBe('published')
  })

  it('Kernthema: Entwurf ohne Pflichtkapitel möglich, Publizieren nur vollständig', async () => {
    const topic = await payload.create({
      collection: 'topics',
      data: { title: `Testthema ${run}`, summary: 'Ein Satz.', path: `/themen/test_${run}`, category: 'A' },
      draft: true,
      user: users.editor,
      overrideAccess: false,
    })
    created.push({ collection: 'topics', id: topic.id })
    expect(topic._status).toBe('draft')

    // Zu wenige Kernaussagen (min. 3) und keine kommentierten Links → Publizieren scheitert
    await expect(
      payload.update({
        collection: 'topics',
        id: topic.id,
        data: { _status: 'published', intro: lexical('Einstieg.'), keyPoints: [{ text: 'Nur eine Aussage' }] },
        user: users.editor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('Kommentierter Link mit zwei Sätzen wird abgelehnt', async () => {
    const attempt = payload.create({
      collection: 'topics',
      data: {
        title: `Linktest ${run}`,
        summary: 'Ein Satz.',
        category: 'A',
        intro: lexical('Einstieg.'),
        path: `/themen/linktest_${run}`,
        relatedLinks: [{ title: 'Leitlinien', sentence: 'Erster Satz. Zweiter Satz.', linkType: 'external', url: 'https://www.unibe.ch/' }],
      },
      user: users.editor,
      overrideAccess: false,
    })
    const error = await attempt.then(
      () => null,
      (err: unknown) => err as { data?: { errors?: { message: string; path: string }[] } },
    )
    expect(error).not.toBeNull()
    expect(error?.data?.errors?.some((e) => e.message.includes('genau einen Satz'))).toBe(true)
  })
})

describe('Übersetzer:in (Entscheidung 4.3)', () => {
  let articleId: number

  beforeAll(async () => {
    const article = await payload.create({
      collection: 'articles',
      data: { title: `Übersetzungstest ${run}`, kind: 'article', path: `/journey_der_lehre/uebersetzung_${run}`, _status: 'published' },
      user: users.editor,
      overrideAccess: false,
    })
    articleId = article.id
    created.push({ collection: 'articles', id: article.id })
  })

  it('darf nichts anlegen', async () => {
    await expect(
      payload.create({
        collection: 'articles',
        data: { title: 'Nicht erlaubt', kind: 'article', path: `/journey_der_lehre/verboten_${run}` },
        user: users.translator,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('darf EN und FR bearbeiten', async () => {
    const en = await payload.update({
      collection: 'articles',
      id: articleId,
      locale: 'en',
      data: { title: `Translation test ${run}` },
      user: users.translator,
      overrideAccess: false,
    })
    expect(en.title).toBe(`Translation test ${run}`)

    const de = await payload.findByID({ collection: 'articles', id: articleId, locale: 'de', overrideAccess: true })
    expect(de.title).toBe(`Übersetzungstest ${run}`)
  })

  it('darf die Quellsprache DE nicht bearbeiten', async () => {
    await expect(
      payload.update({
        collection: 'articles',
        id: articleId,
        locale: 'de',
        data: { title: 'Überschrieben' },
        user: users.translator,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('fehlende Übersetzung fällt auf DE zurück', async () => {
    const fr = await payload.findByID({ collection: 'articles', id: articleId, locale: 'fr', overrideAccess: true })
    expect(fr.title).toBe(`Übersetzungstest ${run}`)
  })
})

describe('Rollenvergabe', () => {
  it('Testkonten haben die vorgesehenen Rollen', () => {
    expect(users.editor.roles).toEqual(['redaktion'])
    expect(users.translator.roles).toEqual(['uebersetzer'])
  })

  it('Redaktion kann sich keine Admin-Rolle geben', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: users.editor.id,
      data: { roles: ['admin'] },
      user: users.editor,
      overrideAccess: false,
    })
    expect(updated.roles).toEqual(['redaktion'])
  })
})
