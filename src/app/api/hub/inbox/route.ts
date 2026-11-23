import { deleteInbox, markInboxRead } from '@/hub/repo-collections'
import { isUuid } from '@/hub/rules'
import { db, json, readBody, requireMember } from '@/hub/server'

/** „Mit mir geteilt“: PATCH { id } → als gelesen markieren. */
export async function PATCH(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const { id } = await readBody(request)
  if (!isUuid(id)) return json({ error: 'invalid' }, 400)
  await markInboxRead(db(), id, checked.member.id)
  return json({ read: true })
}

/** Eintrag entfernen: DELETE { id } */
export async function DELETE(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const { id } = await readBody(request)
  if (!isUuid(id)) return json({ error: 'invalid' }, 400)
  await deleteInbox(db(), id, checked.member.id)
  return json({ deleted: true })
}
