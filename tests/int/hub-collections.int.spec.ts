import { randomUUID } from 'node:crypto'

import { Pool } from 'pg'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AUTH_SCHEMA, AUTH_TABLES } from '@/auth/database'
import { HUB_DDL } from '@/hub/database'
import {
  createFeedback,
  createSuggestion,
  deleteMemberData,
  deleteMemberFeedback,
  listMemberFeedback,
  listMemberSuggestions,
  recentFeedbackCount,
} from '@/hub/payload-data'
import {
  addInbox,
  addItem,
  copyCollection,
  createCollection,
  deleteCollection,
  editableCollections,
  getCollection,
  getPreferences,
  listInbox,
  listItems,
  listOwnCollections,
  listSharedCollections,
  listShares,
  recentSharesCount,
  markInboxRead,
  revokeShare,
  savePreferences,
  searchMembers,
  shareCollection,
  unreadInboxCount,
  updateItem,
} from '@/hub/repo-collections'
import { type MemberSearchPatterns, memberSearchPattern } from '@/hub/rules'
import config from '@/payload.config'

/**
 * Sammlungen, Teilen, „Mit mir geteilt“, Einstellungen (SQL) und Feedback/Vorschläge (Payload) – Phase 5, Teil 2.
 * Voraussetzung: `npm run auth:migrate`. Testmitglieder werden am Ende gelöscht (Cascade).
 */
const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
const member = `${AUTH_SCHEMA}.${AUTH_TABLES.user}`
const tag = randomUUID().slice(0, 8)
const [owner, reader, editor] = [randomUUID(), randomUUID(), randomUUID()]
const ids = [owner, reader, editor]
let payload: Payload

async function createMember(id: string, name: string) {
  await db.query(
    `insert into ${member} (id, name, email, "emailVerified") values ($1, $2, $3, true)`,
    [id, name, `${name.toLowerCase()}-${tag}@unibe.ch`],
  )
}

describe('Sammlungen und Teilen im Schema hub (Phase 5, Teil 2)', () => {
  beforeAll(async () => {
    for (const statement of HUB_DDL) await db.query(statement) // idempotent
    await createMember(owner, `Olga${tag}`)
    await createMember(reader, `Rita${tag}`)
    await createMember(editor, `Emil${tag}`)
  })

  afterAll(async () => {
    await db.query(`delete from ${member} where id = any($1)`, [ids])
    await db.end()
  })

  it('legt Sammlungen mit Hub-Verweisen und eigenen Einträgen an', async () => {
    const id = await createCollection(db, owner, {
      kind: 'methods',
      title: 'Seminar Frühling',
      description: '',
    })
    await addItem(db, id, {
      ref: { collection: 'methods', id: 900_101 },
      title: '',
      note: 'mit Zeitlimit',
    })
    const own = await addItem(db, id, {
      ref: null,
      title: 'Kugellager',
      note: 'Variante für 40 Personen',
    })
    await updateItem(db, own, { title: 'Kugellager XL', note: 'Variante für 60 Personen' })
    const items = await listItems(db, id)
    expect(items.map((i) => [i.ref?.docId ?? null, i.title, i.note])).toEqual([
      [900_101, '', 'mit Zeitlimit'],
      [null, 'Kugellager XL', 'Variante für 60 Personen'],
    ])
    expect((await listOwnCollections(db, owner, 'methods'))[0]).toMatchObject({
      title: 'Seminar Frühling',
      itemCount: 2,
      canEdit: true,
    })
    expect(await listOwnCollections(db, owner, 'tools')).toEqual([])
  })

  it('verlangt bei eigenen Einträgen einen Titel und begrenzt Längen in der Datenbank', async () => {
    const id = await createCollection(db, owner, { kind: 'tools', title: 'Tools', description: '' })
    await expect(addItem(db, id, { ref: null, title: '', note: '' })).rejects.toThrow()
    await expect(
      addItem(db, id, { ref: null, title: 'x', note: 'x'.repeat(2001) }),
    ).rejects.toThrow()
    await expect(
      createCollection(db, owner, { kind: 'articles' as never, title: 'x', description: '' }),
    ).rejects.toThrow()
  })

  it('teilt nur lesend oder mit Bearbeitungsrecht, widerrufbar (Entscheidung 8.3)', async () => {
    const id = await createCollection(db, owner, {
      kind: 'methods',
      title: 'Geteilt',
      description: 'für das Team',
    })
    expect(await getCollection(db, id, reader)).toBeNull()

    expect(await shareCollection(db, id, reader, false)).toBe(true)
    expect(await shareCollection(db, id, editor, true)).toBe(true)
    expect(await shareCollection(db, id, editor, true)).toBe(false) // schon geteilt
    await addInbox(db, {
      recipientId: reader,
      senderId: owner,
      collectionId: id,
      message: 'Schau mal',
    })

    expect((await getCollection(db, id, reader))?.access).toEqual({
      read: true,
      edit: false,
      manage: false,
    })
    expect((await getCollection(db, id, editor))?.access).toEqual({
      read: true,
      edit: true,
      manage: false,
    })
    expect((await listSharedCollections(db, reader)).map((c) => c.id)).toContain(id)
    expect((await editableCollections(db, reader, 'methods')).map((c) => c.id)).not.toContain(id)
    expect((await editableCollections(db, editor, 'methods')).map((c) => c.id)).toContain(id)
    expect((await listShares(db, id)).map((s) => [s.id, s.canEdit])).toEqual([
      [reader, false],
      [editor, true],
    ])

    const inbox = await listInbox(db, reader)
    expect(inbox[0]).toMatchObject({
      collectionId: id,
      message: 'Schau mal',
      readAt: null,
      senderName: `Olga${tag}`,
    })
    expect(await unreadInboxCount(db, reader)).toBe(1)
    await markInboxRead(db, inbox[0].id, owner) // fremde Person: wirkungslos
    expect(await unreadInboxCount(db, reader)).toBe(1)
    await markInboxRead(db, inbox[0].id, reader)
    expect(await unreadInboxCount(db, reader)).toBe(0)

    await revokeShare(db, id, reader)
    expect(await getCollection(db, id, reader)).toBeNull()
    expect(await listInbox(db, reader)).toEqual([])
  })

  it('übernimmt eine Kopie mit allen Einträgen, ohne Vorschlagsbezug', async () => {
    const id = await createCollection(db, owner, {
      kind: 'tools',
      title: 'Original',
      description: 'Beschreibung',
    })
    const item = await addItem(db, id, { ref: null, title: 'Eigenes Tool', note: 'Notiz' })
    await db.query(`update hub.collection_items set suggestion_id = 42 where id = $1`, [item])
    await shareCollection(db, id, reader, false)
    const copy = await copyCollection(db, id, reader, 'Meine Kopie')
    const found = await getCollection(db, copy, reader)
    expect(found?.access.manage).toBe(true)
    expect(found?.collection).toMatchObject({
      title: 'Meine Kopie',
      description: 'Beschreibung',
      kind: 'tools',
    })
    expect((await listItems(db, copy)).map((i) => [i.title, i.note, i.suggestionId])).toEqual([
      ['Eigenes Tool', 'Notiz', null],
    ])
  })

  it('zählt geteilte Einträge der letzten Stunde (Rate-Limit)', async () => {
    const before = await recentSharesCount(db, editor)
    await addInbox(db, { recipientId: reader, senderId: editor, ref: { collection: 'tools', id: 7 }, message: '' })
    expect(await recentSharesCount(db, editor)).toBe(before + 1)
  })

  it('löscht nur eigene Sammlungen', async () => {
    const id = await createCollection(db, owner, { kind: 'methods', title: 'Weg', description: '' })
    expect(await deleteCollection(db, id, reader)).toBe(false)
    expect(await deleteCollection(db, id, owner)).toBe(true)
    expect(await getCollection(db, id, owner)).toBeNull()
  })

  it('sucht Mitglieder nach Name oder E-Mail, ohne sich selbst, höchstens 8', async () => {
    const pattern = memberSearchPattern(tag) as MemberSearchPatterns
    const found = await searchMembers(db, pattern, owner)
    expect(found.map((m) => m.id).sort()).toEqual([reader, editor].sort())
    expect(await searchMembers(db, memberSearchPattern('%%%') as MemberSearchPatterns, owner)).toEqual([])
    // E-Mail nur ab Anfang: die Domain allein findet niemanden, der Anfang der Adresse schon
    const byDomain = await searchMembers(db, memberSearchPattern(`-${tag}@unibe.ch`) as MemberSearchPatterns, owner)
    expect(byDomain).toEqual([])
    const byPrefix = await searchMembers(db, memberSearchPattern(`rita${tag.toLowerCase()}-`) as MemberSearchPatterns, owner)
    expect(byPrefix.map((m) => m.id)).toEqual([reader])
  })

  it('speichert Benachrichtigungen (Standard: an)', async () => {
    expect(await getPreferences(db, reader)).toEqual({ notifyShares: true, locale: 'de' })
    await savePreferences(db, reader, { notifyShares: false })
    await savePreferences(db, reader, { locale: 'fr' })
    expect(await getPreferences(db, reader)).toEqual({ notifyShares: false, locale: 'fr' })
  })

  it('löscht beim Löschen des Kontos Sammlungen, Freigaben und Inbox (Cascade)', async () => {
    const temp = randomUUID()
    await createMember(temp, `Tina${tag}`)
    const id = await createCollection(db, temp, {
      kind: 'methods',
      title: 'Temporär',
      description: '',
    })
    await shareCollection(db, id, reader, false)
    await addInbox(db, {
      recipientId: reader,
      senderId: temp,
      ref: { collection: 'methods', id: 1 },
      message: '',
    })
    await db.query(`delete from ${member} where id = $1`, [temp])
    expect(await getCollection(db, id, reader)).toBeNull()
    // Hinweis bleibt, Absender:in wird anonym
    expect((await listInbox(db, reader)).find((e) => e.ref?.docId === 1)?.senderName).toBeNull()
  })
})

describe('Feedback und Vorschläge (Payload, Entscheidungen 8.2a, 2.3)', () => {
  const person = { id: `fb-${tag}`, email: `fb-${tag}@unibe.ch`, name: 'Feedback Test' }
  const png = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626001000000050001a5f645400000000049454e44ae426082',
    'hex',
  )

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    await payload.delete({
      collection: 'suggestions',
      where: { title: { like: tag } },
      overrideAccess: true,
    })
    await payload?.destroy()
  })

  it('legt Feedback mit Bild an, zeigt es nur der Person und löscht es samt Bild', async () => {
    const id = await createFeedback(payload, person, {
      kind: 'fehler',
      place: 'Testseite › Ablauf',
      pageUrl: '/de/test',
      message: 'Tippfehler',
      locale: 'de',
      image: { data: png, type: 'image/png' },
    })
    const list = await listMemberFeedback(payload, person.id)
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ id, kind: 'fehler', state: 'neu', hasImage: true, reply: null })
    expect(await recentFeedbackCount(payload, person.id)).toBe(1)
    expect(await listMemberFeedback(payload, 'jemand-anderes')).toEqual([])
    expect(await deleteMemberFeedback(payload, 'jemand-anderes', id)).toBe(false)

    const imageCount = (
      await payload.count({
        collection: 'feedback-images',
        where: { memberId: { equals: person.id } },
        overrideAccess: true,
      })
    ).totalDocs
    expect(imageCount).toBe(1)
    expect(await deleteMemberFeedback(payload, person.id, id)).toBe(true)
    expect(await listMemberFeedback(payload, person.id)).toEqual([])
    expect(
      (
        await payload.count({
          collection: 'feedback-images',
          where: { memberId: { equals: person.id } },
          overrideAccess: true,
        })
      ).totalDocs,
    ).toBe(0)
  })

  it('verweigert Mitgliedern und Gästen das direkte Lesen der Inbox (nur Redaktion)', async () => {
    await expect(payload.find({ collection: 'feedback', overrideAccess: false })).rejects.toThrow()
    await expect(
      payload.find({ collection: 'suggestions', overrideAccess: false }),
    ).rejects.toThrow()
    await expect(
      payload.find({ collection: 'feedback-images', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('löscht beim Löschen des Kontos Feedback und anonymisiert Vorschläge', async () => {
    await createFeedback(payload, person, {
      kind: 'idee',
      place: 'Start',
      pageUrl: '',
      message: 'Idee',
      locale: 'en',
      image: null,
    })
    const suggestionId = await createSuggestion(payload, person, {
      kind: 'methods',
      title: `Kugellager ${tag}`,
      text: 'Variante',
      basedOn: null,
      locale: 'de',
    })
    expect((await listMemberSuggestions(payload, person.id)).map((s) => [s.id, s.state])).toEqual([
      [suggestionId, 'neu'],
    ])

    await deleteMemberData(payload, person.id)
    expect(await listMemberFeedback(payload, person.id)).toEqual([])
    expect(await listMemberSuggestions(payload, person.id)).toEqual([])
    const kept = await payload.findByID({
      collection: 'suggestions',
      id: suggestionId,
      overrideAccess: true,
    })
    expect(kept).toMatchObject({ title: `Kugellager ${tag}`, memberEmail: null, memberId: null })
  })
})
