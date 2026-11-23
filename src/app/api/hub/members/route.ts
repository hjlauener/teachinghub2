import { searchMembers } from '@/hub/repo-collections'
import { memberSearchPattern } from '@/hub/rules'
import { db, json, requireMember } from '@/hub/server'

/** Mitglieder zum Teilen suchen: GET ?q=… (ab 3 Zeichen, höchstens 8 Treffer, ohne sich selbst). */
export async function GET(request: Request) {
  const checked = await requireMember(request, { write: false })
  if ('error' in checked) return checked.error
  const pattern = memberSearchPattern(new URL(request.url).searchParams.get('q'))
  if (!pattern) return json({ members: [] })
  return json({ members: await searchMembers(db(), pattern, checked.member.id) })
}
