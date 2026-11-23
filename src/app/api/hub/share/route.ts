import { notifyShare } from '@/hub/notify'
import { addInbox, findMember, recentSharesCount } from '@/hub/repo-collections'
import { MESSAGE_MAX, normalizeText, SHARES_PER_HOUR, parseRef } from '@/hub/rules'
import { db, json, readBody, requireMember, resolveDocs } from '@/hub/server'

/**
 * Inhalt an Kolleg:innen senden (Entscheidung 8.3): POST { collection, id, memberIds: string[], message? }.
 * Nur registrierte Mitglieder; Eintrag in „Mit mir geteilt“ und Mail, sofern nicht abgeschaltet.
 */
export async function POST(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const body = await readBody(request)
  const ref = parseRef(body)
  const message = normalizeText(body.message, MESSAGE_MAX, { multiline: true })
  const ids = Array.isArray(body.memberIds)
    ? [...new Set(body.memberIds.filter((v): v is string => typeof v === 'string'))]
    : []
  if (!ref || message === null || ids.length === 0 || ids.length > 20)
    return json({ error: 'invalid' }, 400)
  const doc = (await resolveDocs([{ collection: ref.collection, docId: ref.id }], 'de')).get(
    `${ref.collection}:${ref.id}`,
  )
  if (!doc) return json({ error: 'not-found' }, 404)

  if ((await recentSharesCount(db(), checked.member.id)) >= SHARES_PER_HOUR)
    return json({ error: 'rate-limit' }, 429)
  let sent = 0
  for (const id of ids) {
    if (id === checked.member.id) continue
    const recipient = await findMember(db(), id)
    if (!recipient) continue
    await addInbox(db(), { recipientId: recipient.id, senderId: checked.member.id, ref, message })
    await notifyShare(checked.member, recipient, { title: doc.title, message })
    sent++
  }
  return sent ? json({ sent }) : json({ error: 'not-found' }, 404)
}
