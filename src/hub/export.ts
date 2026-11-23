import 'server-only'

import { AUTH_SCHEMA, AUTH_TABLES } from '@/auth/database'

import { hubDatabase } from './database'
import { getKey, keyInfo, listQuestions } from '@/ai/repo'
import { getPayloadClient } from '@/lib/content'

import { listMemberFeedback, listMemberSuggestions } from './payload-data'
import { listBookmarks, listLikes } from './repo'
import {
  getPreferences,
  listInbox,
  listOwnCollections,
  listOwnItems,
  listShares,
  listSharedCollections,
} from './repo-collections'
import { type Member, refKey, resolveDocs } from './server'

/**
 * Konto-Export (Schweizer DSG, Auskunftsrecht): alle persönlichen Daten als JSON.
 * Sitzungen und Sicherheitsschlüssel selbst werden nicht ausgegeben, nur ihre Bezeichnungen.
 */
export async function exportMemberData(member: Member) {
  const db = hubDatabase()
  const payload = await getPayloadClient()
  const [
    likes,
    bookmarks,
    collections,
    items,
    shared,
    inbox,
    preferences,
    feedback,
    suggestions, questions, aiKey,
    passkeys,
  ] = await Promise.all([
    listLikes(db, member.id),
    listBookmarks(db, member.id),
    listOwnCollections(db, member.id),
    listOwnItems(db, member.id),
    listSharedCollections(db, member.id),
    listInbox(db, member.id),
    getPreferences(db, member.id),
    listMemberFeedback(payload, member.id),
    listMemberSuggestions(payload, member.id),
    listQuestions(db, member.id, 10_000),
    getKey(db, member.id),
    db.query<{ name: string | null; createdAt: Date }>(
      `select name, "createdAt" from ${AUTH_SCHEMA}.${AUTH_TABLES.passkey} where "userId" = $1 order by "createdAt"`,
      [member.id],
    ),
  ])
  const shares = new Map(
    await Promise.all(collections.map(async (c) => [c.id, await listShares(db, c.id)] as const)),
  )
  const itemRefs = items.flatMap((i) => (i.ref ? [i.ref] : []))
  const inboxRefs = inbox.flatMap((i) => (i.ref ? [i.ref] : []))
  const docs = await resolveDocs([...likes, ...bookmarks, ...itemRefs, ...inboxRefs], 'de')
  const content = (collection: string, docId: number) => {
    const doc = docs.get(refKey(collection, docId))
    return { collection, id: docId, title: doc?.title ?? null, path: doc?.path ?? null }
  }
  return {
    exportedAt: new Date().toISOString(),
    source: 'TeachingHub2 (Prototyp)',
    account: {
      email: member.email,
      name: member.name,
      memberSince: member.createdAt.toISOString(),
    },
    passkeys: passkeys.rows.map((p) => ({
      name: p.name,
      createdAt: new Date(p.createdAt).toISOString(),
    })),
    likes: likes.map((l) => ({
      ...content(l.collection, l.docId),
      likedAt: l.createdAt.toISOString(),
    })),
    bookmarks: bookmarks.map((b) => ({
      ...content(b.collection, b.docId),
      note: b.note,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
    collections: collections.map((c) => ({
      kind: c.kind,
      title: c.title,
      description: c.description,
      createdAt: c.createdAt.toISOString(),
      sharedWith: (shares.get(c.id) ?? []).map((s) => ({
        name: s.name,
        email: s.email,
        canEdit: s.canEdit,
      })),
      items: items
        .filter((i) => i.collectionId === c.id)
        .map((i) => ({
          content: i.ref ? content(i.ref.collection, i.ref.docId) : null,
          title: i.title,
          note: i.note,
          suggestionId: i.suggestionId,
          createdAt: i.createdAt.toISOString(),
        })),
    })),
    sharedWithMe: {
      collections: shared.map((c) => ({
        kind: c.kind,
        title: c.title,
        owner: c.ownerName,
        canEdit: c.canEdit,
      })),
      inbox: inbox.map((e) => ({
        from: e.senderName,
        content: e.ref ? content(e.ref.collection, e.ref.docId) : null,
        collection: e.collectionId,
        message: e.message,
        readAt: e.readAt?.toISOString() ?? null,
        createdAt: e.createdAt.toISOString(),
      })),
    },
    preferences,
    feedback: feedback.map(({ id: _id, ...f }) => f),
    suggestions: suggestions.map(({ id: _id, ...s }) => s),
    // Ask-a-question (Phase 6): Schlüssel nur als Kennung, nie im Klartext
    aiSettings: keyInfo(aiKey),
    questions: questions.map((q) => ({
      question: q.question,
      answer: q.answer,
      outcome: q.outcome,
      sources: q.sources.map((s) => ({ n: s.n, title: s.title, path: s.path, anchor: s.anchor })),
      model: q.model,
      inputTokens: q.inputTokens,
      outputTokens: q.outputTokens,
      createdAt: q.createdAt.toISOString(),
    })),
  }
}
