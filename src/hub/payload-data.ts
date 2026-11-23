import type { Payload } from 'payload'

import { type CollectionKind, type FeedbackKind, imageExtension, type ImageType } from './rules'

/**
 * Feedback und Vorschläge liegen als Payload-Collections bei der Redaktion (Inbox im Admin).
 * Mitglieder erreichen sie nur über diese Helfer, immer gefiltert auf die eigene memberId.
 * Ohne `server-only`, weil auch Better Auth (Konto löschen) und CLI-Skripte sie laden.
 */
type MemberRef = { id: string; email: string; name: string }

export type MemberFeedback = {
  id: number
  kind: FeedbackKind
  place: string
  pageUrl: string | null
  message: string
  state: 'neu' | 'in_arbeit' | 'erledigt'
  reply: string | null
  repliedAt: string | null
  hasImage: boolean
  createdAt: string
}

export type MemberSuggestion = {
  id: number
  kind: CollectionKind
  title: string
  state: 'neu' | 'in_pruefung' | 'angenommen' | 'abgelehnt'
  editorNote: string | null
  createdAt: string
}

export async function createFeedback(
  payload: Payload,
  member: MemberRef,
  input: {
    kind: FeedbackKind
    place: string
    pageUrl: string
    message: string
    locale: string
    image: { data: Buffer; type: ImageType } | null
  },
): Promise<number> {
  let imageId: number | undefined
  if (input.image) {
    const ext = imageExtension(input.image.type)
    const image = await payload.create({
      collection: 'feedback-images',
      data: { memberId: member.id },
      file: {
        data: input.image.data,
        mimetype: input.image.type,
        name: `feedback-${Date.now()}.${ext}`,
        size: input.image.data.length,
      },
      overrideAccess: true,
    })
    imageId = image.id
  }
  const doc = await payload.create({
    collection: 'feedback',
    data: {
      feedbackStatus: 'neu',
      kind: input.kind,
      place: input.place,
      pageUrl: input.pageUrl,
      message: input.message,
      image: imageId,
      memberId: member.id,
      memberEmail: member.email,
      memberName: member.name,
      mailLocale: input.locale,
    },
    overrideAccess: true,
  })
  return doc.id
}

export async function listMemberFeedback(
  payload: Payload,
  memberId: string,
): Promise<MemberFeedback[]> {
  const { docs } = await payload.find({
    collection: 'feedback',
    where: { memberId: { equals: memberId } },
    sort: '-createdAt',
    depth: 0,
    limit: 200,
    pagination: false,
    overrideAccess: true,
  })
  return docs.map((d) => ({
    id: d.id,
    kind: d.kind,
    place: d.place,
    pageUrl: d.pageUrl ?? null,
    message: d.message,
    state: d.feedbackStatus,
    reply: d.reply?.trim() ? d.reply : null,
    repliedAt: d.repliedAt ?? null,
    hasImage: Boolean(d.image),
    createdAt: d.createdAt,
  }))
}

/** Eigenes Feedback samt Bild löschen (Entscheidung 8.2a). */
export async function deleteMemberFeedback(
  payload: Payload,
  memberId: string,
  id: number,
): Promise<boolean> {
  const { docs } = await payload.find({
    collection: 'feedback',
    where: { and: [{ id: { equals: id } }, { memberId: { equals: memberId } }] },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) return false
  await payload.delete({ collection: 'feedback', id: doc.id, overrideAccess: true })
  const imageId = typeof doc.image === 'object' && doc.image ? doc.image.id : doc.image
  if (imageId)
    await payload
      .delete({ collection: 'feedback-images', id: imageId, overrideAccess: true })
      .catch(() => null)
  return true
}

export async function createSuggestion(
  payload: Payload,
  member: MemberRef,
  input: {
    kind: CollectionKind
    title: string
    text: string
    basedOn: { relationTo: CollectionKind; value: number } | null
    locale: string
  },
): Promise<number> {
  const doc = await payload.create({
    collection: 'suggestions',
    data: {
      suggestionStatus: 'neu',
      kind: input.kind,
      title: input.title,
      text: input.text,
      basedOn: input.basedOn ?? undefined,
      memberId: member.id,
      memberEmail: member.email,
      memberName: member.name,
      mailLocale: input.locale,
    },
    overrideAccess: true,
  })
  return doc.id
}

export async function listMemberSuggestions(
  payload: Payload,
  memberId: string,
): Promise<MemberSuggestion[]> {
  const { docs } = await payload.find({
    collection: 'suggestions',
    where: { memberId: { equals: memberId } },
    sort: '-createdAt',
    depth: 0,
    limit: 200,
    pagination: false,
    overrideAccess: true,
  })
  return docs.map((d) => ({
    id: d.id,
    kind: d.kind,
    title: d.title,
    state: d.suggestionStatus,
    editorNote: d.editorNote?.trim() ? d.editorNote : null,
    createdAt: d.createdAt,
  }))
}

/**
 * Konto gelöscht: Feedback und Bilder löschen, Vorschläge anonymisieren (sie können bereits
 * redaktionelle Inhalte geworden sein). Hub-Tabellen löschen sich per ON DELETE CASCADE selbst.
 */
export async function deleteMemberData(payload: Payload, memberId: string): Promise<void> {
  const { docs } = await payload.find({
    collection: 'feedback',
    where: { memberId: { equals: memberId } },
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
  })
  for (const doc of docs) await deleteMemberFeedback(payload, memberId, doc.id)
  // Bilder ohne Feedback (z. B. abgebrochenes Speichern)
  await payload.delete({
    collection: 'feedback-images',
    where: { memberId: { equals: memberId } },
    overrideAccess: true,
  })
  await payload.update({
    collection: 'suggestions',
    where: { memberId: { equals: memberId } },
    data: { memberId: null, memberEmail: null, memberName: null },
    overrideAccess: true,
    context: { anonymize: true },
  })
}

/** Feedbacks der letzten Stunde (Rate-Limit). */
export async function recentFeedbackCount(payload: Payload, memberId: string): Promise<number> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { totalDocs } = await payload.count({
    collection: 'feedback',
    where: { and: [{ memberId: { equals: memberId } }, { createdAt: { greater_than: since } }] },
    overrideAccess: true,
  })
  return totalDocs
}
