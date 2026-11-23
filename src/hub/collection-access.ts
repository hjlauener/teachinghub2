import 'server-only'

import { getCollection } from '@/hub/repo-collections'
import { isUuid } from '@/hub/rules'
import { db, json, requireMember } from '@/hub/server'

type Need = 'read' | 'edit' | 'manage'

/** Mitglied + Sammlung mit dem nötigen Recht laden; ohne Zugriff 404 (verrät nicht, dass es sie gibt). */
export async function loadCollection(
  request: Request,
  params: Promise<{ id: string }>,
  need: Need,
  write: boolean,
) {
  const checked = await requireMember(request, { write })
  if ('error' in checked) return checked
  const { id } = await params
  if (!isUuid(id)) return { error: json({ error: 'not-found' }, 404) }
  const found = await getCollection(db(), id, checked.member.id)
  if (!found) return { error: json({ error: 'not-found' }, 404) }
  if (!found.access[need]) return { error: json({ error: 'forbidden' }, 403) }
  return { member: checked.member, ...found }
}
