import { searchMembers } from '@/hub/repo-collections'
import {
  createRateLimiter,
  MEMBER_SEARCH_WINDOW_MS,
  MEMBER_SEARCHES_PER_WINDOW,
  memberSearchPattern,
} from '@/hub/rules'
import { db, json, requireMember } from '@/hub/server'

/** Schutz gegen das Abgreifen aller Adressen: höchstens 30 Suchen pro 10 Minuten und Mitglied. */
const limiter = createRateLimiter(MEMBER_SEARCHES_PER_WINDOW, MEMBER_SEARCH_WINDOW_MS)

/** Mitglieder zum Teilen suchen: GET ?q=… (ab 3 Zeichen, höchstens 8 Treffer, ohne sich selbst). */
export async function GET(request: Request) {
  const checked = await requireMember(request, { write: false })
  if ('error' in checked) return checked.error
  const pattern = memberSearchPattern(new URL(request.url).searchParams.get('q'))
  if (!pattern) return json({ members: [] })
  if (!limiter.hit(checked.member.id)) return json({ error: 'rate-limit' }, 429)
  return json({ members: await searchMembers(db(), pattern, checked.member.id) })
}
