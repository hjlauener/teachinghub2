import type { Queryable } from './database'
import { HUB_SCHEMA } from './database'
import type { ContentRef, HubCollection } from './rules'

/** Datenzugriff für Likes und Bookmarks (SQL, ohne Payload). Alle Abfragen sind parametrisiert. */

const likes = `${HUB_SCHEMA}.likes`
const bookmarks = `${HUB_SCHEMA}.bookmarks`

export type LikeRow = { collection: HubCollection; docId: number; createdAt: Date }
export type BookmarkRow = { collection: HubCollection; docId: number; note: string; createdAt: Date; updatedAt: Date }

/** Like setzen oder entfernen; liefert den neuen Zustand und die Gesamtzahl. */
export async function setLike(db: Queryable, memberId: string, ref: ContentRef, liked: boolean): Promise<{ liked: boolean; count: number }> {
  if (liked) {
    await db.query(`insert into ${likes} (member_id, collection, doc_id) values ($1, $2, $3) on conflict do nothing`, [memberId, ref.collection, ref.id])
  } else {
    await db.query(`delete from ${likes} where member_id = $1 and collection = $2 and doc_id = $3`, [memberId, ref.collection, ref.id])
  }
  return { liked, count: await likeCount(db, ref) }
}

export async function likeCount(db: Queryable, ref: ContentRef): Promise<number> {
  const { rows } = await db.query<{ n: string }>(`select count(*) as n from ${likes} where collection = $1 and doc_id = $2`, [ref.collection, ref.id])
  return Number(rows[0]?.n ?? 0)
}

/** Zähler pro Dokument einer Collection (für „Beliebt“ und die Redaktions-Statistik). */
export async function likeCounts(db: Queryable, collection: HubCollection): Promise<Map<number, number>> {
  const { rows } = await db.query<{ doc_id: number; n: string }>(`select doc_id, count(*) as n from ${likes} where collection = $1 group by doc_id`, [collection])
  return new Map(rows.map((r) => [r.doc_id, Number(r.n)]))
}

/** Zähler über alle Collections (Redaktions-Statistik). */
export async function allLikeCounts(db: Queryable): Promise<{ collection: HubCollection; docId: number; count: number }[]> {
  const { rows } = await db.query<{ collection: HubCollection; doc_id: number; n: string }>(
    `select collection, doc_id, count(*) as n from ${likes} group by collection, doc_id order by count(*) desc, collection, doc_id`,
  )
  return rows.map((r) => ({ collection: r.collection, docId: r.doc_id, count: Number(r.n) }))
}

/** Eigener Zustand zu einem Inhalt. */
export async function memberState(db: Queryable, memberId: string, ref: ContentRef): Promise<{ liked: boolean; bookmarked: boolean; note: string }> {
  const [like, bookmark] = await Promise.all([
    db.query(`select 1 from ${likes} where member_id = $1 and collection = $2 and doc_id = $3`, [memberId, ref.collection, ref.id]),
    db.query<{ note: string }>(`select note from ${bookmarks} where member_id = $1 and collection = $2 and doc_id = $3`, [memberId, ref.collection, ref.id]),
  ])
  return { liked: (like.rowCount ?? 0) > 0, bookmarked: bookmark.rows.length > 0, note: bookmark.rows[0]?.note ?? '' }
}

export async function listLikes(db: Queryable, memberId: string): Promise<LikeRow[]> {
  const { rows } = await db.query<{ collection: HubCollection; doc_id: number; created_at: Date }>(
    `select collection, doc_id, created_at from ${likes} where member_id = $1 order by created_at desc`,
    [memberId],
  )
  return rows.map((r) => ({ collection: r.collection, docId: r.doc_id, createdAt: r.created_at }))
}

/** Bookmark anlegen oder Notiz aktualisieren. */
export async function saveBookmark(db: Queryable, memberId: string, ref: ContentRef, note: string): Promise<void> {
  await db.query(
    `insert into ${bookmarks} (member_id, collection, doc_id, note) values ($1, $2, $3, $4)
     on conflict (member_id, collection, doc_id) do update set note = excluded.note, updated_at = now()`,
    [memberId, ref.collection, ref.id, note],
  )
}

export async function removeBookmark(db: Queryable, memberId: string, ref: ContentRef): Promise<void> {
  await db.query(`delete from ${bookmarks} where member_id = $1 and collection = $2 and doc_id = $3`, [memberId, ref.collection, ref.id])
}

export async function listBookmarks(db: Queryable, memberId: string): Promise<BookmarkRow[]> {
  const { rows } = await db.query<{ collection: HubCollection; doc_id: number; note: string; created_at: Date; updated_at: Date }>(
    `select collection, doc_id, note, created_at, updated_at from ${bookmarks} where member_id = $1 order by created_at desc`,
    [memberId],
  )
  return rows.map((r) => ({ collection: r.collection, docId: r.doc_id, note: r.note, createdAt: r.created_at, updatedAt: r.updated_at }))
}
