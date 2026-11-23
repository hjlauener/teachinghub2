import { randomUUID } from 'node:crypto'

import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AUTH_SCHEMA, AUTH_TABLES } from '@/auth/database'
import { HUB_DDL } from '@/hub/database'
import { likeCount, likeCounts, listBookmarks, listLikes, memberState, removeBookmark, saveBookmark, setLike } from '@/hub/repo'

/**
 * Likes und Bookmarks gegen PostgreSQL (Phase 5). Voraussetzung: `npm run auth:migrate` (legt auth + hub an).
 * Testmitglieder werden am Ende gelöscht; dabei verschwinden ihre Daten per ON DELETE CASCADE.
 */
const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
const member = `${AUTH_SCHEMA}.${AUTH_TABLES.user}`
const ids = [randomUUID(), randomUUID(), randomUUID()]
const doc = { collection: 'methods' as const, id: 900_001 }

async function createMember(id: string) {
  await db.query(`insert into ${member} (id, name, email, "emailVerified") values ($1, '', $2, true)`, [id, `hub-int-${id}@unibe.ch`])
}

describe('Persönliche Daten im Schema hub (Phase 5)', () => {
  beforeAll(async () => {
    for (const statement of HUB_DDL) await db.query(statement) // idempotent
    for (const id of ids) await createMember(id)
  })

  afterAll(async () => {
    await db.query(`delete from ${member} where id = any($1)`, [ids])
    await db.end()
  })

  it('zählt Likes pro Inhalt; doppeltes Liken zählt einmal', async () => {
    await setLike(db, ids[0], doc, true)
    await setLike(db, ids[0], doc, true)
    const result = await setLike(db, ids[1], doc, true)
    expect(result).toEqual({ liked: true, count: 2 })
    expect((await likeCounts(db, 'methods')).get(doc.id)).toBe(2)

    const removed = await setLike(db, ids[1], doc, false)
    expect(removed).toEqual({ liked: false, count: 1 })
    expect((await memberState(db, ids[0], doc)).liked).toBe(true)
    expect((await memberState(db, ids[1], doc)).liked).toBe(false)
    expect(await listLikes(db, ids[0])).toMatchObject([{ collection: 'methods', docId: doc.id }])
  })

  it('merkt Inhalte mit Notiz und aktualisiert die Notiz', async () => {
    await saveBookmark(db, ids[2], doc, '')
    await saveBookmark(db, ids[2], doc, 'Für das Seminar im Frühling')
    const list = await listBookmarks(db, ids[2])
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ collection: 'methods', docId: doc.id, note: 'Für das Seminar im Frühling' })
    expect(await memberState(db, ids[2], doc)).toEqual({ liked: false, bookmarked: true, note: 'Für das Seminar im Frühling' })

    await removeBookmark(db, ids[2], doc)
    expect(await listBookmarks(db, ids[2])).toEqual([])
  })

  it('lehnt zu lange Notizen auch in der Datenbank ab', async () => {
    await expect(saveBookmark(db, ids[2], doc, 'x'.repeat(2001))).rejects.toThrow()
  })

  it('löscht beim Löschen des Kontos alle Likes und Bookmarks', async () => {
    await saveBookmark(db, ids[0], doc, 'weg damit')
    await db.query(`delete from ${member} where id = $1`, [ids[0]])
    expect(await listLikes(db, ids[0])).toEqual([])
    expect(await listBookmarks(db, ids[0])).toEqual([])
    expect(await likeCount(db, doc)).toBe(0)
  })
})
