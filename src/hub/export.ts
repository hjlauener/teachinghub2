import 'server-only'

import { AUTH_SCHEMA, AUTH_TABLES } from '@/auth/database'

import { hubDatabase } from './database'
import { listBookmarks, listLikes } from './repo'
import { type Member, refKey, resolveDocs } from './server'

/**
 * Konto-Export (Schweizer DSG, Auskunftsrecht): alle persönlichen Daten als JSON.
 * Sitzungen und Sicherheitsschlüssel selbst werden nicht ausgegeben, nur ihre Bezeichnungen.
 */
export async function exportMemberData(member: Member) {
  const db = hubDatabase()
  const [likes, bookmarks, passkeys] = await Promise.all([
    listLikes(db, member.id),
    listBookmarks(db, member.id),
    db.query<{ name: string | null; createdAt: Date }>(
      `select name, "createdAt" from ${AUTH_SCHEMA}.${AUTH_TABLES.passkey} where "userId" = $1 order by "createdAt"`,
      [member.id],
    ),
  ])
  const docs = await resolveDocs([...likes, ...bookmarks], 'de')
  const content = (collection: string, docId: number) => {
    const doc = docs.get(refKey(collection, docId))
    return { collection, id: docId, title: doc?.title ?? null, path: doc?.path ?? null }
  }
  return {
    exportedAt: new Date().toISOString(),
    source: 'TeachingHub2 (Prototyp)',
    account: { email: member.email, name: member.name, memberSince: member.createdAt.toISOString() },
    passkeys: passkeys.rows.map((p) => ({ name: p.name, createdAt: new Date(p.createdAt).toISOString() })),
    likes: likes.map((l) => ({ ...content(l.collection, l.docId), likedAt: l.createdAt.toISOString() })),
    bookmarks: bookmarks.map((b) => ({ ...content(b.collection, b.docId), note: b.note, createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() })),
  }
}
