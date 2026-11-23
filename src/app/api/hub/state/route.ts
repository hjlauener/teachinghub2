import { memberState } from '@/hub/repo'
import { parseRef } from '@/hub/rules'
import { currentMember, db, json } from '@/hub/server'

/** Eigener Zustand zu einem Inhalt: GET ?collection=…&id=… → { member, liked, bookmarked, note }. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const ref = parseRef({ collection: params.get('collection'), id: params.get('id') })
  if (!ref) return json({ error: 'invalid' }, 400)
  const member = await currentMember(request.headers)
  if (!member) return json({ member: false, liked: false, bookmarked: false, note: '' })
  return json({ member: true, ...(await memberState(db(), member.id, ref)) })
}
