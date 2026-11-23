import { AUTH_SCHEMA, AUTH_TABLES } from '../auth/database'

import type { Queryable } from './database'
import { HUB_SCHEMA } from './database'
import {
  type CollectionAccess,
  collectionAccess,
  type CollectionKind,
  type ContentRef,
  type HubCollection,
  MEMBER_SEARCH_LIMIT,
} from './rules'

/**
 * Datenzugriff für „Meine Methoden/Tools“, Teilen, „Mit mir geteilt“ und Einstellungen (Phase 5, Teil 2).
 * Rechte werden in den Routen mit `collectionAccess` geprüft; die Abfragen hier sind parametrisiert.
 */
const collections = `${HUB_SCHEMA}.collections`
const items = `${HUB_SCHEMA}.collection_items`
const shares = `${HUB_SCHEMA}.collection_shares`
const inbox = `${HUB_SCHEMA}.inbox`
const preferences = `${HUB_SCHEMA}.preferences`
const members = `${AUTH_SCHEMA}.${AUTH_TABLES.user}`

export type MemberInfo = { id: string; name: string; email: string }

export type CollectionRow = {
  id: string
  ownerId: string
  ownerName: string
  kind: CollectionKind
  title: string
  description: string
  itemCount: number
  canEdit: boolean
  createdAt: Date
  updatedAt: Date
}

export type ItemRow = {
  id: string
  collectionId: string
  ref: { collection: HubCollection; docId: number } | null
  title: string
  note: string
  suggestionId: number | null
  createdAt: Date
}

type RawCollection = {
  id: string
  owner_id: string
  owner_name: string | null
  owner_email: string
  kind: CollectionKind
  title: string
  description: string
  item_count: string
  can_edit: boolean | null
  created_at: Date
  updated_at: Date
}

const toCollection = (r: RawCollection, memberId: string): CollectionRow => ({
  id: r.id,
  ownerId: r.owner_id,
  ownerName: r.owner_name || r.owner_email,
  kind: r.kind,
  title: r.title,
  description: r.description,
  itemCount: Number(r.item_count),
  canEdit: r.owner_id === memberId || Boolean(r.can_edit),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

const SELECT_COLLECTION = `select c.id, c.owner_id, m.name as owner_name, m.email as owner_email, c.kind, c.title, c.description,
  c.created_at, c.updated_at, (select count(*) from ${items} i where i.collection_id = c.id) as item_count`

/* ---------- Sammlungen ---------- */

export async function createCollection(
  db: Queryable,
  ownerId: string,
  input: { kind: CollectionKind; title: string; description: string },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into ${collections} (owner_id, kind, title, description) values ($1, $2, $3, $4) returning id`,
    [ownerId, input.kind, input.title, input.description],
  )
  return rows[0].id
}

/** Eigene Sammlungen (optional einer Art), neueste zuerst. */
export async function listOwnCollections(
  db: Queryable,
  ownerId: string,
  kind?: CollectionKind,
): Promise<CollectionRow[]> {
  const { rows } = await db.query<RawCollection>(
    `${SELECT_COLLECTION}, true as can_edit from ${collections} c join ${members} m on m.id = c.owner_id
     where c.owner_id = $1 and ($2::text is null or c.kind = $2) order by c.updated_at desc`,
    [ownerId, kind ?? null],
  )
  return rows.map((r) => toCollection(r, ownerId))
}

/** Mit mir geteilte Sammlungen. */
export async function listSharedCollections(
  db: Queryable,
  memberId: string,
  kind?: CollectionKind,
): Promise<CollectionRow[]> {
  const { rows } = await db.query<RawCollection>(
    `${SELECT_COLLECTION}, s.can_edit from ${collections} c join ${shares} s on s.collection_id = c.id join ${members} m on m.id = c.owner_id
     where s.member_id = $1 and ($2::text is null or c.kind = $2) order by s.created_at desc`,
    [memberId, kind ?? null],
  )
  return rows.map((r) => toCollection(r, memberId))
}

/** Sammlungen, in die ich etwas hinzufügen darf (eigene + geteilt mit Bearbeitungsrecht). */
export async function editableCollections(
  db: Queryable,
  memberId: string,
  kind: CollectionKind,
): Promise<CollectionRow[]> {
  const [own, shared] = await Promise.all([
    listOwnCollections(db, memberId, kind),
    listSharedCollections(db, memberId, kind),
  ])
  return [...own, ...shared.filter((c) => c.canEdit)]
}

/** Sammlung mit den Rechten der anfragenden Person; null, wenn sie keinen Zugriff hat oder es sie nicht gibt. */
export async function getCollection(
  db: Queryable,
  id: string,
  memberId: string,
): Promise<{ collection: CollectionRow; access: CollectionAccess } | null> {
  const { rows } = await db.query<RawCollection>(
    `${SELECT_COLLECTION}, s.can_edit from ${collections} c join ${members} m on m.id = c.owner_id
     left join ${shares} s on s.collection_id = c.id and s.member_id = $2 where c.id = $1`,
    [id, memberId],
  )
  const row = rows[0]
  if (!row) return null
  const access = collectionAccess(
    row.owner_id,
    memberId,
    row.can_edit === null ? null : { canEdit: row.can_edit },
  )
  if (!access.read) return null
  return { collection: toCollection(row, memberId), access }
}

export async function updateCollection(
  db: Queryable,
  id: string,
  input: { title: string; description: string },
): Promise<void> {
  await db.query(
    `update ${collections} set title = $2, description = $3, updated_at = now() where id = $1`,
    [id, input.title, input.description],
  )
}

export async function deleteCollection(
  db: Queryable,
  id: string,
  ownerId: string,
): Promise<boolean> {
  const result = await db.query(`delete from ${collections} where id = $1 and owner_id = $2`, [
    id,
    ownerId,
  ])
  return (result.rowCount ?? 0) > 0
}

const touch = (db: Queryable, collectionId: string) =>
  db.query(`update ${collections} set updated_at = now() where id = $1`, [collectionId])

/** Kopie übernehmen (Entscheidung 8.3): Titel, Beschreibung und Einträge; Vorschläge bleiben beim Original. */
export async function copyCollection(
  db: Queryable,
  id: string,
  newOwnerId: string,
  title: string,
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into ${collections} (owner_id, kind, title, description) select $2, kind, $3, description from ${collections} where id = $1 returning id`,
    [id, newOwnerId, title],
  )
  const copyId = rows[0].id
  await db.query(
    `insert into ${items} (collection_id, ref_collection, ref_doc_id, title, note, created_at)
     select $2, ref_collection, ref_doc_id, title, note, created_at from ${items} where collection_id = $1`,
    [id, copyId],
  )
  return copyId
}

/* ---------- Einträge ---------- */

type RawItem = {
  id: string
  collection_id: string
  ref_collection: HubCollection | null
  ref_doc_id: number | null
  title: string
  note: string
  suggestion_id: number | null
  created_at: Date
}
const toItem = (r: RawItem): ItemRow => ({
  id: r.id,
  collectionId: r.collection_id,
  ref:
    r.ref_collection && r.ref_doc_id ? { collection: r.ref_collection, docId: r.ref_doc_id } : null,
  title: r.title,
  note: r.note,
  suggestionId: r.suggestion_id,
  createdAt: r.created_at,
})

export async function listItems(db: Queryable, collectionId: string): Promise<ItemRow[]> {
  const { rows } = await db.query<RawItem>(
    `select * from ${items} where collection_id = $1 order by created_at, id`,
    [collectionId],
  )
  return rows.map(toItem)
}

export async function getItem(db: Queryable, itemId: string): Promise<ItemRow | null> {
  const { rows } = await db.query<RawItem>(`select * from ${items} where id = $1`, [itemId])
  return rows[0] ? toItem(rows[0]) : null
}

/** Eintrag hinzufügen: Verweis auf einen Hub-Inhalt und/oder eigener Titel, Notiz/Variante. */
export async function addItem(
  db: Queryable,
  collectionId: string,
  input: { ref: ContentRef | null; title: string; note: string },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into ${items} (collection_id, ref_collection, ref_doc_id, title, note) values ($1, $2, $3, $4, $5) returning id`,
    [collectionId, input.ref?.collection ?? null, input.ref?.id ?? null, input.title, input.note],
  )
  await touch(db, collectionId)
  return rows[0].id
}

export async function updateItem(
  db: Queryable,
  itemId: string,
  input: { title: string; note: string },
): Promise<void> {
  const { rows } = await db.query<{ collection_id: string }>(
    `update ${items} set title = $2, note = $3, updated_at = now() where id = $1 returning collection_id`,
    [itemId, input.title, input.note],
  )
  if (rows[0]) await touch(db, rows[0].collection_id)
}

export async function removeItem(db: Queryable, itemId: string): Promise<void> {
  await db.query(`delete from ${items} where id = $1`, [itemId])
}

export async function setItemSuggestion(
  db: Queryable,
  itemId: string,
  suggestionId: number,
): Promise<void> {
  await db.query(`update ${items} set suggestion_id = $2 where id = $1`, [itemId, suggestionId])
}

/** Alle Einträge einer Person (eigene Sammlungen) – für den Konto-Export. */
export async function listOwnItems(db: Queryable, ownerId: string): Promise<ItemRow[]> {
  const { rows } = await db.query<RawItem>(
    `select i.* from ${items} i join ${collections} c on c.id = i.collection_id where c.owner_id = $1 order by i.created_at`,
    [ownerId],
  )
  return rows.map(toItem)
}

/* ---------- Teilen ---------- */

export async function searchMembers(
  db: Queryable,
  pattern: string,
  excludeId: string,
): Promise<MemberInfo[]> {
  const { rows } = await db.query<MemberInfo>(
    `select id, name, email from ${members} where id <> $2 and (name ilike $1 or email ilike $1) order by name, email limit ${MEMBER_SEARCH_LIMIT}`,
    [pattern, excludeId],
  )
  return rows
}

export async function findMember(db: Queryable, id: string): Promise<MemberInfo | null> {
  const { rows } = await db.query<MemberInfo>(
    `select id, name, email from ${members} where id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function listShares(
  db: Queryable,
  collectionId: string,
): Promise<(MemberInfo & { canEdit: boolean })[]> {
  const { rows } = await db.query<MemberInfo & { can_edit: boolean }>(
    `select m.id, m.name, m.email, s.can_edit from ${shares} s join ${members} m on m.id = s.member_id where s.collection_id = $1 order by s.created_at`,
    [collectionId],
  )
  return rows.map(({ can_edit, ...m }) => ({ ...m, canEdit: can_edit }))
}

/** Sammlung teilen oder Recht ändern; liefert true, wenn die Person sie neu erhält. */
export async function shareCollection(
  db: Queryable,
  collectionId: string,
  memberId: string,
  canEdit: boolean,
): Promise<boolean> {
  const { rows } = await db.query<{ inserted: boolean }>(
    `insert into ${shares} (collection_id, member_id, can_edit) values ($1, $2, $3)
     on conflict (collection_id, member_id) do update set can_edit = excluded.can_edit returning (xmax = 0) as inserted`,
    [collectionId, memberId, canEdit],
  )
  return Boolean(rows[0]?.inserted)
}

/** Teilen widerrufen: Zugriff und Hinweis in „Mit mir geteilt“ verschwinden. */
export async function revokeShare(
  db: Queryable,
  collectionId: string,
  memberId: string,
): Promise<void> {
  await db.query(`delete from ${shares} where collection_id = $1 and member_id = $2`, [
    collectionId,
    memberId,
  ])
  await db.query(`delete from ${inbox} where shared_collection_id = $1 and recipient_id = $2`, [
    collectionId,
    memberId,
  ])
}

/** Geteilte Sammlung selbst verlassen (Empfänger:in). */
export const leaveCollection = (db: Queryable, collectionId: string, memberId: string) =>
  revokeShare(db, collectionId, memberId)

/* ---------- „Mit mir geteilt“ ---------- */

export type InboxRow = {
  id: string
  senderName: string | null
  ref: { collection: HubCollection; docId: number } | null
  collectionId: string | null
  message: string
  readAt: Date | null
  createdAt: Date
}

export async function addInbox(
  db: Queryable,
  input: {
    recipientId: string
    senderId: string
    ref?: ContentRef
    collectionId?: string
    message: string
  },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into ${inbox} (recipient_id, sender_id, ref_collection, ref_doc_id, shared_collection_id, message) values ($1, $2, $3, $4, $5, $6) returning id`,
    [
      input.recipientId,
      input.senderId,
      input.ref?.collection ?? null,
      input.ref?.id ?? null,
      input.collectionId ?? null,
      input.message,
    ],
  )
  return rows[0].id
}

/** Geteilte Einträge einer Person in der letzten Stunde (Rate-Limit). */
export async function recentSharesCount(db: Queryable, senderId: string): Promise<number> {
  const { rows } = await db.query<{ n: string }>(
    `select count(*) as n from ${inbox} where sender_id = $1 and created_at > now() - interval '1 hour'`,
    [senderId],
  )
  return Number(rows[0]?.n ?? 0)
}

export async function listInbox(db: Queryable, memberId: string): Promise<InboxRow[]> {
  const { rows } = await db.query<{
    id: string
    sender_name: string | null
    sender_email: string | null
    ref_collection: HubCollection | null
    ref_doc_id: number | null
    shared_collection_id: string | null
    message: string
    read_at: Date | null
    created_at: Date
  }>(
    `select i.*, m.name as sender_name, m.email as sender_email from ${inbox} i left join ${members} m on m.id = i.sender_id
     where i.recipient_id = $1 order by i.created_at desc limit 200`,
    [memberId],
  )
  return rows.map((r) => ({
    id: r.id,
    senderName: r.sender_name || r.sender_email,
    ref:
      r.ref_collection && r.ref_doc_id
        ? { collection: r.ref_collection, docId: r.ref_doc_id }
        : null,
    collectionId: r.shared_collection_id,
    message: r.message,
    readAt: r.read_at,
    createdAt: r.created_at,
  }))
}

export async function markInboxRead(db: Queryable, id: string, memberId: string): Promise<void> {
  await db.query(
    `update ${inbox} set read_at = coalesce(read_at, now()) where id = $1 and recipient_id = $2`,
    [id, memberId],
  )
}

export async function deleteInbox(db: Queryable, id: string, memberId: string): Promise<void> {
  await db.query(`delete from ${inbox} where id = $1 and recipient_id = $2`, [id, memberId])
}

export async function unreadInboxCount(db: Queryable, memberId: string): Promise<number> {
  const { rows } = await db.query<{ n: string }>(
    `select count(*) as n from ${inbox} where recipient_id = $1 and read_at is null`,
    [memberId],
  )
  return Number(rows[0]?.n ?? 0)
}

/* ---------- Einstellungen ---------- */

export type Preferences = { notifyShares: boolean; locale: 'de' | 'en' | 'fr' }

export async function getPreferences(db: Queryable, memberId: string): Promise<Preferences> {
  const { rows } = await db.query<{ notify_shares: boolean; locale: Preferences['locale'] }>(
    `select notify_shares, locale from ${preferences} where member_id = $1`,
    [memberId],
  )
  return rows[0]
    ? { notifyShares: rows[0].notify_shares, locale: rows[0].locale }
    : { notifyShares: true, locale: 'de' }
}

export async function savePreferences(
  db: Queryable,
  memberId: string,
  input: Partial<Preferences>,
): Promise<Preferences> {
  const current = await getPreferences(db, memberId)
  const next = { ...current, ...input }
  await db.query(
    `insert into ${preferences} (member_id, notify_shares, locale) values ($1, $2, $3)
     on conflict (member_id) do update set notify_shares = excluded.notify_shares, locale = excluded.locale, updated_at = now()`,
    [memberId, next.notifyShares, next.locale],
  )
  return next
}
