import 'server-only'

import config from '@payload-config'
import { getPayload, type Payload, type Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'
import type { Article, Method, News, Page, Subtopic, Taxonomy, Tool, Topic } from '@/payload-types'

/**
 * Lesezugriff der Website auf das CMS. Öffentlich: nur Publiziertes (Access-Regeln greifen, kein Benutzer).
 * Fehlende Übersetzungen fallen auf DE zurück (Payload-Lokalisierung, Entscheidung 4.2/4.3).
 */
export const getPayloadClient = cache((): Promise<Payload> => getPayload({ config }))

export type ContentDoc =
  | { collection: 'pages'; doc: Page }
  | { collection: 'articles'; doc: Article }
  | { collection: 'methods'; doc: Method }
  | { collection: 'tools'; doc: Tool }
  | { collection: 'news'; doc: News }
  | { collection: 'topics'; doc: Topic }
  | { collection: 'subtopics'; doc: Subtopic }

const PATH_COLLECTIONS = ['pages', 'articles', 'methods', 'tools', 'news', 'topics', 'subtopics'] as const

/** Dokument zu einem Pfad (ohne Sprachpräfix) in allen Inhalts-Collections suchen. */
export const findByPath = cache(async (path: string, locale: Locale): Promise<ContentDoc | null> => {
  const payload = await getPayloadClient()
  for (const collection of PATH_COLLECTIONS) {
    const { docs } = await payload.find({
      collection,
      where: { path: { equals: path } },
      locale,
      fallbackLocale: 'de',
      depth: 2,
      limit: 1,
      overrideAccess: false,
    })
    if (docs[0]) return { collection, doc: docs[0] } as ContentDoc
  }
  return null
})

/** Ist das Dokument in der Sprache wirklich übersetzt (nicht nur DE-Fallback)? */
export const isTranslated = cache(async (collection: ContentDoc['collection'], id: number, locale: Locale): Promise<boolean> => {
  if (locale === 'de') return true
  const payload = await getPayloadClient()
  const doc = (await payload.findByID({
    collection,
    id,
    locale,
    fallbackLocale: false,
    depth: 0,
    overrideAccess: false,
    select: { title: true },
  })) as { title?: string | null }
  return Boolean(doc.title)
})

/** Titel eines Pfads (für Breadcrumbs). */
export const titleForPath = cache(async (path: string, locale: Locale): Promise<string | null> => {
  const found = await findByPath(path, locale)
  return found ? found.doc.title : null
})

export const listTaxonomies = cache(async (type: Taxonomy['type'], locale: Locale): Promise<Taxonomy[]> => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'taxonomies',
    where: { type: { equals: type } },
    sort: 'order',
    locale,
    fallbackLocale: 'de',
    limit: 0,
    pagination: false,
    depth: 0,
  })
  return docs
})

export async function findMany<T extends 'articles' | 'methods' | 'tools' | 'news' | 'topics' | 'subtopics'>(
  collection: T,
  locale: Locale,
  options: { where?: Where; sort?: string; limit?: number; depth?: number } = {},
) {
  const payload = await getPayloadClient()
  return payload.find({
    collection,
    locale,
    fallbackLocale: 'de',
    where: options.where,
    sort: options.sort,
    limit: options.limit ?? 0,
    pagination: false,
    depth: options.depth ?? 0,
    overrideAccess: false,
  })
}

/** ID aus einer Relation (Zahl oder bereits geladenes Objekt). */
export function relId(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: number }).id
  return null
}

/** Geladene Relationen eines hasMany-Feldes als Objekte. */
export function populated<T extends { id: number }>(values: (number | T)[] | null | undefined): T[] {
  return (values ?? []).filter((v): v is T => typeof v === 'object' && v !== null)
}
