import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

import { isEditor } from '@/access/roles'
import { hubDatabase } from '@/hub/database'
import { allLikeCounts } from '@/hub/repo'
import type { HubCollection } from '@/hub/rules'

const LABELS: Record<HubCollection, string> = {
  articles: 'Artikel',
  methods: 'Methode',
  tools: 'Tool',
  news: 'News',
  pages: 'Seite',
  topics: 'Kernthema',
  subtopics: 'Unterthema',
}

/** Für „nie geliked“ ausgewertete Inhaltstypen. */
const NEVER_LIKED: HubCollection[] = ['articles', 'methods', 'tools']

/**
 * Redaktions-Statistik (Entscheidung 8.1): meist und nie gelikte Inhalte. Zeigt nur Zähler pro Inhalt –
 * wer geliked hat, ist auch für die Redaktion nicht einsehbar.
 */
export async function LikeStats({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  const template = (children: React.ReactNode) => (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>{children}</Gutter>
    </DefaultTemplate>
  )
  if (!req.user) redirect('/admin/login?redirect=%2Fadmin%2Flike-statistik')
  if (!isEditor(req.user)) return template(<p>Diese Auswertung ist der Redaktion vorbehalten.</p>)

  const counts = await allLikeCounts(hubDatabase())
  const top = counts.slice(0, 25)
  const titles = new Map<string, string>()
  const never: { collection: HubCollection; docs: { id: number; title: string }[]; total: number }[] = []

  for (const collection of NEVER_LIKED) {
    const { docs } = await req.payload.find({
      collection,
      where: { _status: { equals: 'published' } },
      locale: 'de',
      depth: 0,
      limit: 0,
      pagination: false,
      select: { title: true },
      sort: 'title',
    })
    const liked = new Set(counts.filter((c) => c.collection === collection).map((c) => c.docId))
    for (const doc of docs) titles.set(`${collection}:${doc.id}`, doc.title)
    const unliked = docs.filter((doc) => !liked.has(doc.id as number)).map((doc) => ({ id: doc.id as number, title: doc.title }))
    never.push({ collection, docs: unliked, total: docs.length })
  }
  // Titel der Top-Inhalte aus anderen Collections nachladen
  for (const row of top) {
    const key = `${row.collection}:${row.docId}`
    if (titles.has(key)) continue
    const doc = await req.payload.findByID({ collection: row.collection, id: row.docId, locale: 'de', depth: 0, disableErrors: true, select: { title: true } })
    titles.set(key, (doc as { title?: string } | null)?.title ?? `(gelöscht, ID ${row.docId})`)
  }
  const total = counts.reduce((sum, row) => sum + row.count, 0)
  const edit = (collection: string, id: number) => `/admin/collections/${collection}/${id}`

  return template(
    <div className="like-stats">
      <h1>Like-Statistik</h1>
      <p>
        {total} Likes auf {counts.length} Inhalten. Angezeigt werden nur Zähler pro Inhalt; wer geliked hat, ist nicht einsehbar.
        Öffentlich sichtbar ist ein Zähler erst ab 3 Likes.
      </p>

      <h2>Meist geliked</h2>
      {top.length === 0 ? (
        <p>Noch keine Likes.</p>
      ) : (
        <table className="like-stats__table">
          <thead>
            <tr>
              <th scope="col">Typ</th>
              <th scope="col">Inhalt</th>
              <th scope="col">Likes</th>
            </tr>
          </thead>
          <tbody>
            {top.map((row) => (
              <tr key={`${row.collection}:${row.docId}`}>
                <td>{LABELS[row.collection]}</td>
                <td>
                  <a href={edit(row.collection, row.docId)}>{titles.get(`${row.collection}:${row.docId}`)}</a>
                </td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Noch nie geliked</h2>
      {never.map(({ collection, docs, total: all }) => (
        <details key={collection}>
          <summary>
            {LABELS[collection]}: {docs.length} von {all} publizierten Inhalten
          </summary>
          <ul>
            {docs.map((doc) => (
              <li key={doc.id}>
                <a href={edit(collection, doc.id)}>{doc.title}</a>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>,
  )
}
