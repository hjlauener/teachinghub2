import { loadCollection } from '@/hub/collection-access'
import { notifyShare } from '@/hub/notify'
import {
  addInbox,
  findMember,
  recentSharesCount,
  leaveCollection,
  listShares,
  revokeShare,
  shareCollection,
} from '@/hub/repo-collections'
import { MESSAGE_MAX, normalizeText, SHARES_PER_HOUR } from '@/hub/rules'
import { db, json, readBody } from '@/hub/server'

type Context = { params: Promise<{ id: string }> }

/** Mit wem ist die Sammlung geteilt? (nur Besitzer:in) */
export async function GET(request: Request, { params }: Context) {
  const loaded = await loadCollection(request, params, 'manage', false)
  if ('error' in loaded) return loaded.error
  return json({ shares: await listShares(db(), loaded.collection.id) })
}

/** Teilen mit einem Mitglied: POST { memberId, canEdit?, message? } – nur Mitglieder, keine geheimen Links (8.3). */
export async function POST(request: Request, { params }: Context) {
  const loaded = await loadCollection(request, params, 'manage', true)
  if ('error' in loaded) return loaded.error
  const body = await readBody(request)
  const message = normalizeText(body.message, MESSAGE_MAX, { multiline: true })
  if (typeof body.memberId !== 'string' || message === null) return json({ error: 'invalid' }, 400)
  if (body.memberId === loaded.member.id) return json({ error: 'self' }, 400)
  if ((await recentSharesCount(db(), loaded.member.id)) >= SHARES_PER_HOUR)
    return json({ error: 'rate-limit' }, 429)
  const recipient = await findMember(db(), body.memberId)
  if (!recipient) return json({ error: 'not-found' }, 404)
  const isNew = await shareCollection(
    db(),
    loaded.collection.id,
    recipient.id,
    body.canEdit === true,
  )
  if (isNew) {
    await addInbox(db(), {
      recipientId: recipient.id,
      senderId: loaded.member.id,
      collectionId: loaded.collection.id,
      message,
    })
    await notifyShare(loaded.member, recipient, { title: loaded.collection.title, message })
  }
  return json({ shared: true, isNew })
}

/**
 * Teilen widerrufen: DELETE { memberId } (Besitzer:in) – oder ohne memberId: geteilte Sammlung selbst verlassen.
 */
export async function DELETE(request: Request, { params }: Context) {
  const loaded = await loadCollection(request, params, 'read', true)
  if ('error' in loaded) return loaded.error
  const body = await readBody(request)
  if (body.memberId === undefined) {
    if (loaded.access.manage) return json({ error: 'invalid' }, 400)
    await leaveCollection(db(), loaded.collection.id, loaded.member.id)
    return json({ left: true })
  }
  if (!loaded.access.manage) return json({ error: 'forbidden' }, 403)
  if (typeof body.memberId !== 'string') return json({ error: 'invalid' }, 400)
  await revokeShare(db(), loaded.collection.id, body.memberId)
  return json({ revoked: true })
}
