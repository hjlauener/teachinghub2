import { setLike } from '@/hub/repo'
import { parseRef, publicLikeCount } from '@/hub/rules'
import { currentMember, db, isPublished, json, sameOrigin } from '@/hub/server'

/** Like setzen/entfernen: POST { collection, id, liked } → { liked, count } (count erst ab 3, Entscheidung 8.1). */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'origin' }, 403)
  const member = await currentMember(request.headers)
  if (!member) return json({ error: 'unauthenticated' }, 401)
  const body = (await request.json().catch(() => null)) as { liked?: unknown } | null
  const ref = parseRef(body)
  if (!ref || typeof body?.liked !== 'boolean') return json({ error: 'invalid' }, 400)
  if (body.liked && !(await isPublished(ref))) return json({ error: 'not-found' }, 404)
  const result = await setLike(db(), member.id, ref, body.liked)
  return json({ liked: result.liked, count: publicLikeCount(result.count) })
}
