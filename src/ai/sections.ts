import { valueToText } from '../migration/text'

/**
 * Zerlegung der Inhalte in Abschnitte für den KI-Index (Entscheidung 8.9). Reine Funktionen.
 * Jeder Abschnitt kennt den Anker der Website (`ContentSection id`), damit Quellenlinks direkt
 * auf den Abschnitt zeigen. Felder ohne eigenen Abschnitt (Lead, Einleitung) haben keinen Anker.
 */
export const AI_COLLECTIONS = ['articles', 'methods', 'tools', 'news', 'pages', 'topics', 'subtopics'] as const
export type AiCollection = (typeof AI_COLLECTIONS)[number]

/** Feld → Anker und Schlüssel der Überschrift (Namespace.key in messages/*.json). */
type FieldSection = { field: string; anchor: string | null; label: string | null }

const ARTICLE: FieldSection[] = [
  { field: 'lead', anchor: null, label: null },
  { field: 'whatIsBehind', anchor: 'was-steckt-dahinter', label: 'Content.whatIsBehind' },
  { field: 'insights', anchor: 'einblicke', label: 'Content.insights' },
  { field: 'gettingStarted', anchor: 'stolperfrei-durchstarten', label: 'Content.gettingStarted' },
  { field: 'resources', anchor: 'ressourcen', label: 'Content.resources' },
]

export const SECTION_MAP: Record<AiCollection, FieldSection[]> = {
  articles: ARTICLE,
  methods: ARTICLE,
  tools: [...ARTICLE, { field: 'faq', anchor: 'faq', label: 'Content.faq' }],
  news: [
    { field: 'lead', anchor: null, label: null },
    { field: 'body', anchor: null, label: null },
  ],
  pages: [
    { field: 'intro', anchor: null, label: null },
    { field: 'layout', anchor: null, label: null },
  ],
  topics: [
    { field: 'intro', anchor: null, label: null },
    { field: 'currentNotice', anchor: null, label: null },
    { field: 'keyPoints', anchor: 'auf-einen-blick', label: 'Topics.glance' },
    { field: 'relatedLinks', anchor: 'passend-zum-thema', label: 'Topics.related' },
    { field: 'toolsNote', anchor: 'tools', label: 'Topics.tools' },
    { field: 'journeyLinks', anchor: 'entlang-der-journey', label: 'Topics.journey' },
    { field: 'practice', anchor: 'aus-der-praxis', label: 'Topics.practice' },
    { field: 'offerLinks', anchor: 'angebote', label: 'Topics.offers' },
    { field: 'externalLinks', anchor: 'andere-hochschulen', label: 'Topics.external' },
  ],
  subtopics: [
    { field: 'intro', anchor: null, label: null },
    { field: 'summary', anchor: null, label: null },
    { field: 'whatIsIt', anchor: null, label: null },
  ],
}

/** Höchstlänge eines Abschnitts im Index (Zeichen); längere werden an Absätzen geteilt. */
export const CHUNK_MAX = 1500

export type Chunk = { anchor: string | null; label: string | null; part: number; text: string }

/** Text an Absätzen in Stücke ≤ max teilen; einzelne überlange Absätze hart schneiden. */
export function splitText(text: string, max = CHUNK_MAX): string[] {
  const paragraphs = text
    .split(/\n{2,}|\n(?=## )/)
    .map((p) => p.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
  const parts: string[] = []
  let current = ''
  for (const paragraph of paragraphs) {
    const pieces = paragraph.length > max ? (paragraph.match(new RegExp(`[\\s\\S]{1,${max}}`, 'g')) ?? []) : [paragraph]
    for (const piece of pieces) {
      if (current && current.length + piece.length + 2 > max) {
        parts.push(current)
        current = ''
      }
      current = current ? `${current}\n\n${piece}` : piece
    }
  }
  if (current) parts.push(current)
  return parts
}

/** Abschnitte eines Dokuments (eine Sprache) mit Text; leere Felder fallen weg. */
export function buildChunks(collection: AiCollection, doc: Record<string, unknown>): Chunk[] {
  const chunks: Chunk[] = []
  for (const section of SECTION_MAP[collection]) {
    const text = valueToText(doc[section.field]).trim()
    if (!text) continue
    splitText(text).forEach((part, i) => chunks.push({ anchor: section.anchor, label: section.label, part: i, text: part }))
  }
  return chunks
}

/**
 * Gehört ein Dokument in den Index? (Entscheidung 8.9) Nur Publiziertes; Kernthemen/Unterthemen nur „live“;
 * News höchstens 2 Jahre alt. Die Sprachprüfung (menschliche Übersetzung) macht der Indexer.
 */
export const NEWS_MAX_AGE_DAYS = 730
export function isIndexable(collection: AiCollection, doc: Record<string, unknown>, now = new Date()): boolean {
  if (doc._status !== undefined && doc._status !== 'published') return false
  if ((collection === 'topics' || collection === 'subtopics') && doc.pageStatus !== 'live') return false
  if (collection === 'news') {
    const date = typeof doc.date === 'string' ? new Date(doc.date) : null
    if (!date || Number.isNaN(date.getTime())) return false
    if (now.getTime() - date.getTime() > NEWS_MAX_AGE_DAYS * 24 * 60 * 60 * 1000) return false
  }
  return true
}
