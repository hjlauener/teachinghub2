import { addQuestionShare, getQuestionFor } from '@/ai/repo'
import { notifyShare } from '@/hub/notify'
import { findMember, recentSharesCount } from '@/hub/repo-collections'
import { isUuid, MESSAGE_MAX, normalizeText, SHARES_PER_HOUR } from '@/hub/rules'
import { db, json, readBody, requireMember } from '@/hub/server'

/** Antwort mit Mitgliedern teilen (Entscheidung 8.7): POST { id, memberIds, message? } – nur eigene Fragen. */
export async function POST(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const { member } = checked
  const body = await readBody(request)
  const message = normalizeText(body.message, MESSAGE_MAX, { multiline: true })
  const ids = Array.isArray(body.memberIds) ? [...new Set(body.memberIds.filter((v): v is string => typeof v === 'string'))] : []
  if (!isUuid(body.id) || message === null || !ids.length || ids.length > 20) return json({ error: 'invalid' }, 400)
  const found = await getQuestionFor(db(), body.id, member.id)
  if (!found?.own || found.question.outcome !== 'answered') return json({ error: 'not-found' }, 404)
  if ((await recentSharesCount(db(), member.id)) >= SHARES_PER_HOUR) return json({ error: 'rate-limit' }, 429)
  let sent = 0
  for (const id of ids) {
    if (id === member.id) continue
    const recipient = await findMember(db(), id)
    if (!recipient) continue
    await addQuestionShare(db(), { recipientId: recipient.id, senderId: member.id, questionId: found.question.id, message })
    await notifyShare(member, recipient, { title: found.question.question.slice(0, 120), message })
    sent++
  }
  return sent ? json({ sent }) : json({ error: 'not-found' }, 404)
}
