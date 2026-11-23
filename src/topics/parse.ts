import { JSDOM } from 'jsdom'

import { normalizeLegacyUrl, legacyUrlToPath } from '@/migration/urls'
import { slugify } from '@/lib/validation'

/**
 * Parser für das Landingpage-Konzept (docs/konzept-landingpages/, Entscheidungen 7.4–7.6).
 * Liefert reine Daten; das Anlegen im CMS übernimmt `src/topics/import.ts`.
 */

export type SubtopicSeed = { title: string; summary: string; methods: string[] }
export type TopicSeed = {
  number: number
  title: string
  category: 'A' | 'B' | 'C'
  journey: string[]
  subtopics: SubtopicSeed[]
}

const clean = (s: string) => s.replace(/\*\*/g, '').replace(/\\\|/g, '|').trim()

/** Themenstruktur_gesamt.md: Kernthemen (### N. Titel), Kategorie aus „## Priorität X“, Unterthemen-Tabelle. */
export function parseTopicStructure(markdown: string): TopicSeed[] {
  const topics: TopicSeed[] = []
  let category: TopicSeed['category'] | null = null
  let current: TopicSeed | null = null
  for (const line of markdown.split(/\r?\n/)) {
    const priority = line.match(/^## Priorität ([ABC])/)
    if (priority) {
      category = priority[1] as TopicSeed['category']
      current = null
      continue
    }
    if (/^## /.test(line)) {
      category = null
      current = null
      continue
    }
    const heading = line.match(/^### (\d+)\. (.+)$/)
    if (heading && category) {
      current = { number: Number(heading[1]), title: heading[2].trim(), category, journey: [], subtopics: [] }
      topics.push(current)
      continue
    }
    if (!current) continue
    const journey = line.match(/^Bezug zur Journey: (.+)$/)
    if (journey) {
      current.journey = journey[1].split('·').map((s) => s.trim())
      continue
    }
    const row = line.match(/^\| \*\*(.+?)\*\* \| (.*?) \| (.*?) \|$/)
    if (row) {
      const methods = row[3].startsWith('–') ? [] : row[3].split(',').map(clean).filter(Boolean)
      current.subtopics.push({ title: clean(row[1]), summary: clean(row[2]), methods })
    }
  }
  return topics
}

/** „Wichtige Querverweise“: Unterthema → verwandte Unterthemen. */
export function parseCrossReferences(markdown: string): Map<string, string[]> {
  const result = new Map<string, string[]>()
  const start = markdown.indexOf('## Wichtige Querverweise')
  if (start < 0) return result
  for (const line of markdown.slice(start).split(/\r?\n/)) {
    const row = line.match(/^\| (?!Unterthema|---)(.+?) \| (.+?) \|$/)
    if (!row) continue
    result.set(clean(row[1]), clean(row[2]).split('·').map((s) => s.replace(/\(.*?\)/g, '').trim()).filter(Boolean))
  }
  return result
}

export type OverviewSeed = { descriptions: Map<string, string>; matrixPaths: Map<string, string[][]> }

/** Startseite_Landingpages.html: Beschreibungen (A + B) und Matrix-Zuordnung Kernthema × Journey-Phase (Pfade). */
export function parseOverview(html: string): OverviewSeed {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''
  const pages = new Map<string, string>()
  for (const m of script.matchAll(/(\w+): \['[^']*', '([^']+)'\]/g)) pages.set(m[1], `/journey_der_lehre/${m[2]}`)
  const descriptions = new Map<string, string>()
  for (const m of script.matchAll(/name: '([^']+)',[^}]*?desc: '([^']+)'/g)) descriptions.set(m[1], m[2])
  const matrixPaths = new Map<string, string[][]>()
  for (const m of script.matchAll(/name: '([^']+)',[\s\S]*?m: (\[\[[\s\S]*?\]\])\s*\}/g)) {
    const phases = JSON.parse(m[2].replace(/'/g, '"')) as string[][]
    matrixPaths.set(
      m[1],
      phases.map((keys) => keys.map((k) => pages.get(k)).filter((p): p is string => Boolean(p))),
    )
  }
  return { descriptions, matrixPaths }
}

export type DraftLink = { label: string | null; title: string; sentence: string; href: string }
export type DraftTopic = {
  title: string
  intro: string
  currentNotice: string | null
  keyPoints: string[]
  relatedLinks: DraftLink[]
  tools: { name: string; href: string | null; purpose: string; audience: string }[]
  toolsNote: string | null
  toolsAsOf: string | null
  journeyLinks: DraftLink[]
  practice: { title: string; context: string; text: string; url: string | null }[]
  offerLinks: DraftLink[]
  externalLinks: DraftLink[]
  seeAlso: string[]
}

const text = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim()

/** Interne Altsite-Links → neuer Pfad, externe bleiben. */
export function normalizeHref(href: string): string {
  const legacy = normalizeLegacyUrl(href)
  return legacy && /\/index_ger\.html$/.test(new URL(legacy).pathname) ? legacyUrlToPath(legacy) : href
}

/** Kernthema-Entwurf (A – Kernthemen/*.html) mit den 9 Kapiteln der Vorlage. */
export function parseTopicDraft(html: string): DraftTopic {
  const doc = new JSDOM(html).window.document
  const chapter = (n: number) => doc.querySelector(`#c${n}`)?.closest('section') ?? null
  const links = (n: number): DraftLink[] =>
    [...(chapter(n)?.querySelectorAll('ul.links > li') ?? [])].map((li) => {
      const a = li.querySelector('.t a')
      const spans = [...li.children].filter((c) => c.tagName === 'SPAN')
      return {
        label: text(li.querySelector('.lbl')) || null,
        title: text(a),
        sentence: text(spans[spans.length - 1]),
        href: normalizeHref(a?.getAttribute('href') ?? ''),
      }
    })
  const c1 = chapter(1)
  const callout = c1?.querySelector('.callout')
  const c4 = chapter(4)
  return {
    title: text(doc.querySelector('#c1')),
    intro: text(c1?.querySelector('.lead')),
    currentNotice: callout ? text([...callout.children].find((c) => !c.classList.contains('lbl'))) : null,
    keyPoints: [...(chapter(2)?.querySelectorAll('ul.glance > li') ?? [])].map(text),
    relatedLinks: links(3),
    tools: [...(c4?.querySelectorAll('table tbody tr') ?? [])].map((tr) => {
      const cells = [...tr.querySelectorAll('td')]
      const a = cells[0]?.querySelector('a')
      return { name: text(cells[0]), href: a ? normalizeHref(a.getAttribute('href') ?? '') : null, purpose: text(cells[1]), audience: text(cells[2]) }
    }),
    toolsNote: text([...(c4?.querySelectorAll('p') ?? [])].find((p) => !p.classList.contains('more'))) || null,
    toolsAsOf: (() => {
      const m = text(c4?.querySelector('p.more')).match(/(\d{2})\.(\d{2})\.(\d{4})/)
      return m ? `${m[3]}-${m[2]}-${m[1]}` : null
    })(),
    journeyLinks: links(5),
    practice: [...(chapter(6)?.querySelectorAll('.case') ?? [])].map((c) => ({
      title: text(c.querySelector('h3')),
      context: text(c.querySelector('.meta')),
      text: text(c.querySelector('p')),
      url: c.querySelector('a') ? normalizeHref(c.querySelector('a')!.getAttribute('href') ?? '') : null,
    })),
    offerLinks: links(7),
    externalLinks: links(8),
    seeAlso: [...(chapter(9)?.querySelectorAll('.chips a') ?? [])].map(text),
  }
}

export const topicPath = (title: string) => `/themen/${slugify(title)}`
export const subtopicPath = (topicTitle: string, title: string) => `${topicPath(topicTitle)}/${slugify(title)}`
