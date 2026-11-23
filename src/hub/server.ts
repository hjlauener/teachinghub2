import 'server-only'

import { headers } from 'next/headers'

import { auth } from '@/auth/server'
import type { Locale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/content'

import { hubDatabase } from './database'
import { allowedOrigins, type ContentRef, type HubCollection, isAllowedOrigin } from './rules'

export type Member = { id: string; email: string; name: string; createdAt: Date }

/** Angemeldetes Mitglied der aktuellen Anfrage oder null. */
export async function currentMember(requestHeaders?: Headers): Promise<Member | null> {
  const session = await auth.api.getSession({ headers: requestHeaders ?? (await headers()) })
  if (!session) return null
  const { id, email, name, createdAt } = session.user
  return { id, email, name: name ?? '', createdAt: new Date(createdAt) }
}

export const db = hubDatabase

/** Schreibende API-Anfrage nur von der eigenen Website (CSRF-Schutz zusätzlich zu SameSite-Cookies). */
export function sameOrigin(request: Request): boolean {
  return isAllowedOrigin(request.headers.get('origin'), request.headers.get('sec-fetch-site'), allowedOrigins())
}

/** Ist der Inhalt öffentlich (publiziert)? Nur solche kann man liken und merken. */
export async function isPublished(ref: ContentRef): Promise<boolean> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: ref.collection,
    where: { id: { equals: ref.id } },
    depth: 0,
    limit: 1,
    overrideAccess: false,
    select: { title: true },
  })
  return docs.length > 0
}

export type ResolvedDoc = { collection: HubCollection; id: number; title: string; path: string | null }

/** Titel und Pfade zu gespeicherten Verweisen (gelöschte/unpublizierte Inhalte fallen weg). */
export async function resolveDocs(refs: { collection: HubCollection; docId: number }[], locale: Locale): Promise<Map<string, ResolvedDoc>> {
  const payload = await getPayloadClient()
  const byCollection = new Map<HubCollection, number[]>()
  for (const ref of refs) byCollection.set(ref.collection, [...(byCollection.get(ref.collection) ?? []), ref.docId])
  const result = new Map<string, ResolvedDoc>()
  await Promise.all(
    [...byCollection].map(async ([collection, ids]) => {
      const { docs } = await payload.find({
        collection,
        where: { id: { in: ids } },
        locale,
        fallbackLocale: 'de',
        depth: 0,
        limit: ids.length,
        pagination: false,
        overrideAccess: false,
        select: { title: true, path: true },
      })
      for (const doc of docs as { id: number; title: string; path?: string | null }[]) {
        result.set(refKey(collection, doc.id), { collection, id: doc.id, title: doc.title, path: doc.path ?? null })
      }
    }),
  )
  return result
}

export const refKey = (collection: string, id: number) => `${collection}:${id}`

/** JSON-Antwort ohne Caching (persönliche Daten). */
export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } })
}
