import { promises as fs } from 'fs'
import path from 'path'
import type { Payload } from 'payload'

import { slugify } from '@/lib/validation'

import {
  type DraftLink,
  parseCrossReferences,
  parseOverview,
  parseTopicDraft,
  parseTopicStructure,
  subtopicPath,
  topicPath,
} from './parse'

/**
 * Import des Landingpage-Konzepts (Phase 3b): Kernthemen, Unterthemen, Matrix-Seiten, Methoden-Bezug,
 * Entwürfe „KI in Lehre und Studium“ und „Digitale und hybride Lehre“. Idempotent (Schlüssel: Pfad).
 * Themen mit vollständigem Entwurf und ≥ 5 Journey-Seiten werden live, alle anderen „folgt“.
 */
export type TopicsReport = { topics: number; live: number; subtopics: number; warnings: string[] }

type Ref = { relationTo: 'articles' | 'tools' | 'pages' | 'methods'; value: number }

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

const paragraph = (text: string) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      },
    ],
  },
})

const DRAFTS: Record<string, string> = {
  'KI in Lehre und Studium': 'Landingpages/A – Kernthemen/KI_in_Lehre_und_Studium.html',
  'Digitale und hybride Lehre': 'Landingpages/A – Kernthemen/Digitale_und_hybride_Lehre.html',
}

export async function importTopics(payload: Payload, conceptDir: string, log: (msg: string) => void = () => undefined): Promise<TopicsReport> {
  const report: TopicsReport = { topics: 0, live: 0, subtopics: 0, warnings: [] }
  const read = (name: string) => fs.readFile(path.join(conceptDir, name), 'utf-8')
  const markdown = await read('Themenstruktur_gesamt.md')
  const structure = parseTopicStructure(markdown)
  const crossRefs = parseCrossReferences(markdown)
  const overview = parseOverview(await read('Landingpages/Startseite_Landingpages.html'))

  // Nachschlagetabellen
  const find = async <T>(collection: 'articles' | 'tools' | 'pages' | 'methods' | 'taxonomies') =>
    (await payload.find({ collection, limit: 0, pagination: false, depth: 0, locale: 'de', overrideAccess: true })).docs as unknown as T[]
  const byPath = new Map<string, Ref>()
  for (const collection of ['articles', 'tools', 'pages', 'methods'] as const) {
    for (const doc of await find<{ id: number; path: string }>(collection)) byPath.set(doc.path, { relationTo: collection, value: doc.id })
  }
  const methods = new Map((await find<{ id: number; title: string }>('methods')).map((m) => [norm(m.title), m.id]))
  const taxonomies = await find<{ id: number; type: string; name: string }>('taxonomies')
  const rubricByName = new Map(taxonomies.filter((t) => t.type === 'rubrik').map((t) => [norm(t.name), t.id]))
  rubricByName.set(norm('Lehrimpulse'), rubricByName.get(norm('Lehr|Impulse @ UniBE')) as number)
  const labelByName = new Map(taxonomies.filter((t) => t.type === 'linkLabel').map((t) => [norm(t.name), t.id]))

  const rubricFor = (name: string) => rubricByName.get(norm(name.replace(/\(.*\)/, '').replace('Lehr|Impulse', 'Lehrimpulse')))
  async function labelId(name: string | null): Promise<number | null> {
    if (!name) return null
    const rubric = rubricFor(name)
    if (rubric) return rubric
    const key = norm(name)
    if (!labelByName.has(key)) {
      const created = await payload.create({ collection: 'taxonomies', data: { type: 'linkLabel', name, slug: slugify(name) }, locale: 'de', overrideAccess: true })
      labelByName.set(key, created.id)
    }
    return labelByName.get(key) ?? null
  }
  async function annotated(links: DraftLink[]) {
    const out = []
    for (const link of links) {
      const target = link.href.startsWith('/') ? byPath.get(link.href) : undefined
      out.push({
        label: await labelId(link.label),
        title: link.title,
        sentence: link.sentence,
        linkType: target ? 'internal' : 'external',
        internal: target ?? null,
        url: target ? null : link.href.startsWith('/') ? `https://teachinghub.unibe.ch${link.href}/index_ger.html` : link.href,
      })
    }
    return out
  }
  async function upsert(collection: 'topics' | 'subtopics', p: string, data: Record<string, unknown>) {
    const existing = await payload.find({ collection, where: { path: { equals: p } }, limit: 1, depth: 0, overrideAccess: true })
    const options = { collection, data: data as never, locale: 'de' as const, depth: 0, overrideAccess: true }
    return existing.docs[0] ? payload.update({ ...options, id: existing.docs[0].id }) : payload.create(options)
  }

  // Kernthemen
  const topicIds = new Map<string, number>()
  for (const topic of structure) {
    const p = topicPath(topic.title)
    const matrix = overview.matrixPaths.get(topic.title) ?? []
    const journeyPages = [...new Set(matrix.flat())]
      .map((mp) => byPath.get(mp))
      .filter((r): r is Ref => Boolean(r) && (r!.relationTo === 'articles' || r!.relationTo === 'tools'))
    const draftFile = DRAFTS[topic.title]
    const draft = draftFile ? parseTopicDraft(await read(draftFile)) : null
    const live = Boolean(draft) && journeyPages.length >= 5
    if (draft && !live) report.warnings.push(`${topic.title}: Entwurf vorhanden, aber nur ${journeyPages.length} Journey-Seiten → „folgt“`)
    const summary =
      overview.descriptions.get(topic.title) ?? `${topic.subtopics.map((s) => s.title).join(', ')}.`

    const data: Record<string, unknown> = {
      title: topic.title,
      summary,
      category: topic.category,
      order: topic.number,
      pageStatus: live ? 'live' : 'planned',
      journeyPhases: topic.journey.map(rubricFor).filter(Boolean),
      journeyPages,
      path: p,
      _status: 'published',
    }
    if (draft && live) {
      Object.assign(data, {
        intro: paragraph(draft.intro),
        currentNotice: draft.currentNotice,
        keyPoints: draft.keyPoints.map((text) => ({ text })),
        relatedLinks: await annotated(draft.relatedLinks),
        tools: draft.tools.map((t) => {
          const tool = t.href ? byPath.get(t.href) : undefined
          return { name: t.name, tool: tool?.relationTo === 'tools' ? tool.value : null, purpose: t.purpose, audience: t.audience }
        }),
        toolsNote: draft.toolsNote,
        toolsAsOf: draft.toolsAsOf,
        journeyLinks: await annotated(draft.journeyLinks),
        practice: draft.practice.slice(0, 3),
        offerLinks: await annotated(draft.offerLinks),
        externalLinks: await annotated(draft.externalLinks),
      })
    }
    try {
      // Erst ohne Live-Status speichern (Unterthemen fehlen noch), danach live schalten
      const saved = await upsert('topics', p, { ...data, pageStatus: 'planned' })
      topicIds.set(topic.title, saved.id)
      report.topics++
      if (live) report.live++
    } catch (error) {
      report.warnings.push(`${topic.title}: ${errorText(error)}`)
    }
  }
  log(`${report.topics} Kernthemen`)

  // Unterthemen
  const subtopicIds = new Map<string, number>()
  for (const topic of structure) {
    const topicId = topicIds.get(topic.title)
    if (!topicId) continue
    for (const [index, sub] of topic.subtopics.entries()) {
      const methodRefs = sub.methods
        .map((name) => {
          const id = methods.get(norm(name))
          if (!id) report.warnings.push(`Methode „${name}“ (${sub.title}) nicht im Methodenkompass`)
          return id ? { method: id, purposeHere: null } : null
        })
        .filter(Boolean)
      try {
        const saved = await upsert('subtopics', subtopicPath(topic.title, sub.title), {
          title: sub.title,
          summary: sub.summary,
          topic: topicId,
          methods: methodRefs,
          pageStatus: 'planned',
          order: index + 1,
          path: subtopicPath(topic.title, sub.title),
          _status: 'published',
        })
        subtopicIds.set(norm(sub.title), saved.id)
        report.subtopics++
      } catch (error) {
        report.warnings.push(`${sub.title}: ${errorText(error)}`)
      }
    }
  }
  log(`${report.subtopics} Unterthemen`)

  // Querverweise und Live-Schaltung
  for (const [title, refs] of crossRefs) {
    const id = subtopicIds.get(norm(title))
    const seeAlso = refs.map((r) => subtopicIds.get(norm(r))).filter((x): x is number => Boolean(x))
    if (id && seeAlso.length) await payload.update({ collection: 'subtopics', id, data: { seeAlso }, overrideAccess: true })
  }
  for (const topic of structure) {
    const id = topicIds.get(topic.title)
    const draftFile = DRAFTS[topic.title]
    if (!id || !draftFile) continue
    const draft = parseTopicDraft(await read(draftFile))
    const seeAlso = draft.seeAlso.map((t) => topicIds.get(t)).filter((x): x is number => Boolean(x))
    const isLive = (overview.matrixPaths.get(topic.title) ?? []).flat().filter((mp) => byPath.has(mp)).length >= 5
    try {
      await payload.update({ collection: 'topics', id, data: { seeAlso, ...(isLive ? { pageStatus: 'live' } : {}) } as never, locale: 'de', overrideAccess: true })
    } catch (error) {
      report.live--
      report.warnings.push(`${topic.title} live schalten: ${errorText(error)}`)
    }
  }
  return report
}

function errorText(error: unknown): string {
  const data = (error as { data?: { errors?: { path?: string; message?: string }[] } })?.data
  if (data?.errors?.length) return data.errors.map((e) => `${e.path}: ${e.message}`).join('; ')
  return error instanceof Error ? error.message : String(error)
}
