import type { Payload } from 'payload'

import type { ExtractedDoc, HomeTeaser, MethodCsvRow, SearchTag } from './extract'
import type { ImportCollection } from './fields'
import type { LexicalState, MediaRef } from './lexical'

/**
 * Baut aus einer extrahierten Seite die Felddaten für Payload (Sprache DE).
 * Relationen auf andere Importe (Eltern, Alternativen) setzt der zweite Durchgang.
 */
export type Lookups = {
  rubricByKey: Map<string, number>
  rubricBySlug: Map<string, number>
  themeByName: Map<string, number>
  themeBySlug: Map<string, number>
  term: (type: 'zweck' | 'modalitaet' | 'sozialform' | 'aufwand', name: string) => number | undefined
  search: Map<string, SearchTag[]>
  methodsCsv: Map<string, MethodCsvRow>
  teasersByPath: Map<string, HomeTeaser>
}

type HtmlToLexical = (html: string, media: Map<string, MediaRef>) => LexicalState | null

const normSlug = (s: string) => s.replace(/_+/g, '_')

export async function loadLookups(
  payload: Payload,
  search: Map<string, SearchTag[]>,
  csv: MethodCsvRow[],
  teasers: HomeTeaser[],
): Promise<Lookups> {
  const { docs } = await payload.find({ collection: 'taxonomies', limit: 0, pagination: false, depth: 0, locale: 'de', overrideAccess: true })
  const of = (type: string) => docs.filter((d) => d.type === type)
  const termMaps = new Map<string, Map<string, number>>()
  for (const type of ['zweck', 'modalitaet', 'sozialform', 'aufwand']) {
    termMaps.set(type, new Map(of(type).map((d) => [d.name.toLowerCase(), d.id])))
  }
  return {
    rubricByKey: new Map(of('rubrik').filter((d) => d.legacyKey).map((d) => [d.legacyKey as string, d.id])),
    rubricBySlug: new Map(of('rubrik').map((d) => [normSlug(d.slug), d.id])),
    themeByName: new Map(of('thema').map((d) => [d.name.toLowerCase(), d.id])),
    themeBySlug: new Map(of('thema').map((d) => [normSlug(d.slug), d.id])),
    term: (type, name) => termMaps.get(type)?.get(name.toLowerCase()),
    search,
    methodsCsv: new Map(csv.map((row) => [row.path, row])),
    teasersByPath: new Map(teasers.filter((t) => t.href.startsWith('/')).map((t) => [t.href, t])),
  }
}

/** Rubriken und Themen: zuerst aus dem Such-Index, sonst aus dem Pfad. */
export function classification(doc: ExtractedDoc, lookups: Lookups): { rubrics: number[]; themes: number[] } {
  const rubrics = new Set<number>()
  const themes = new Set<number>()
  for (const tag of lookups.search.get(doc.path) ?? []) {
    const rubric = lookups.rubricByKey.get(tag.key)
    if (rubric) rubrics.add(rubric)
    else {
      const theme = lookups.themeByName.get(tag.name.toLowerCase())
      if (theme) themes.add(theme)
    }
  }
  if (rubrics.size === 0 || themes.size === 0) {
    const parts = doc.path.split('/').filter(Boolean)
    if (parts[0] === 'journey_der_lehre') {
      const rubric = lookups.rubricBySlug.get(normSlug(parts[1] ?? ''))
      if (rubric && rubrics.size === 0) rubrics.add(rubric)
      const theme = lookups.themeBySlug.get(normSlug(parts[2] ?? ''))
      if (theme && themes.size === 0) themes.add(theme)
    }
  }
  return { rubrics: [...rubrics], themes: [...themes] }
}

export function buildData(
  doc: ExtractedDoc,
  lookups: Lookups,
  toLexical: HtmlToLexical,
  media: Map<string, MediaRef>,
): { collection: ImportCollection; data: Record<string, unknown>; warnings: string[] } {
  const warnings: string[] = []
  const lx = (html: string) => toLexical(html, media)
  const legacy = { url: doc.legacyUrl, date: doc.legacyDate, hash: doc.hash }
  const s = doc.sections
  const content = {
    title: doc.title,
    lead: doc.lead || null,
    whatIsBehind: lx(s.whatIsBehind),
    insights: s.insights
      .map((insight) => ({ title: insight.title || 'Einblick', content: lx(insight.html) }))
      .filter((insight) => insight.content),
    gettingStarted: lx(s.gettingStarted),
    resources: { literature: lx(s.literature), guides: lx(s.guides), support: lx(s.support) },
  }

  switch (doc.collection) {
    case 'articles': {
      const { rubrics, themes } = classification(doc, lookups)
      if (rubrics.length === 0) warnings.push('keine Rubrik gefunden')
      return {
        collection: 'articles',
        warnings,
        data: { ...content, kind: doc.kind ?? 'article', rubrics, themes, path: doc.path, legacy, _status: 'published' },
      }
    }
    case 'tools': {
      const { rubrics, themes } = classification(doc, lookups)
      return { collection: 'tools', warnings, data: { ...content, rubrics, themes, path: doc.path, legacy, _status: 'published' } }
    }
    case 'methods': {
      const row = lookups.methodsCsv.get(doc.path)
      const ids = (type: 'zweck' | 'modalitaet' | 'sozialform', names: string[]) =>
        names.map((n) => {
          const id = lookups.term(type, n)
          if (!id) warnings.push(`${type} „${n}“ unbekannt`)
          return id
        }).filter((id): id is number => Boolean(id))
      if (!row) warnings.push('nicht in der Methodenkompass-CSV')
      const effort = row ? lookups.term('aufwand', row.effort) : undefined
      const complete = Boolean(row && effort)
      return {
        collection: 'methods',
        warnings,
        data: {
          ...content,
          purposes: row ? ids('zweck', row.purposes) : [],
          modalities: row ? ids('modalitaet', row.modalities) : [],
          socialForms: row ? ids('sozialform', row.socialForms) : [],
          effort: effort ?? null,
          path: doc.path,
          legacy,
          // Ohne vollständige Kategorien nur als Entwurf (Pflichtfelder beim Publizieren)
          _status: complete ? 'published' : 'draft',
        },
      }
    }
    case 'news': {
      const teaser = lookups.teasersByPath.get(doc.path)
      return {
        collection: 'news',
        warnings,
        data: {
          title: doc.title,
          lead: teaser?.lead || doc.lead || null,
          body: lx(doc.sections.whatIsBehind),
          placement: teaser?.placement ?? 'news',
          date: doc.legacyDate ?? new Date().toISOString(),
          path: doc.path,
          legacy,
          _status: 'published',
        },
      }
    }
    case 'pages': {
      const layout: Record<string, unknown>[] = []
      if (doc.pageKind === 'journey') layout.push({ blockType: 'journeyMenu', showThemes: true })
      if (doc.pageKind === 'home') layout.push({ blockType: 'teaserList', source: 'news' })
      if (doc.pageKind === 'rubric') {
        const rubric = lookups.rubricBySlug.get(normSlug(doc.path.split('/')[2] ?? ''))
        if (rubric) layout.push({ blockType: 'rubricTabs', rubric, heading: 'Etappen' })
        else warnings.push('Rubrik der Rubrikseite unbekannt')
      }
      return {
        collection: 'pages',
        warnings,
        data: { title: doc.title, intro: lx(doc.intro), layout, path: doc.path, legacy, _status: 'published' },
      }
    }
  }
}

/** Startseiten-Teaser ohne eigene Detailseite → News mit Link. */
export function teaserNewsData(teaser: HomeTeaser, media: Map<string, MediaRef>): Record<string, unknown> {
  const internal = teaser.href.startsWith('/')
  return {
    title: teaser.title,
    lead: teaser.lead || null,
    placement: teaser.placement,
    date: new Date().toISOString(),
    image: teaser.image ? (media.get(teaser.image)?.id ?? null) : null,
    link: {
      label: teaser.topic || null,
      linkType: internal ? 'internal' : 'external',
      url: internal ? null : teaser.href,
    },
    _status: 'published',
  }
}
