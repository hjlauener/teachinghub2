import { removeBookmark, saveBookmark } from '@/hub/repo'
import { normalizeNote, parseRef } from '@/hub/rules'
import { currentMember, db, isPublished, json, sameOrigin } from '@/hub/server'

async function guard(request: Request) {
  if (!sameOrigin(request)) return { error: json({ error: 'origin' }, 403) }
  const member = await currentMember(request.headers)
  if (!member) return { error: json({ error: 'unauthenticated' }, 401) }
  const body = (await request.json().catch(() => null)) as { note?: unknown } | null
  const ref = parseRef(body)
  if (!ref) return { error: json({ error: 'invalid' }, 400) }
  return { member, ref, body }
}

/** Merken bzw. Notiz speichern: PUT { collection, id, note? }. */
export async function PUT(request: Request) {
  const checked = await guard(request)
  if ('error' in checked) return checked.error
  const note = normalizeNote(checked.body?.note)
  if (note === null) return json({ error: 'note' }, 400)
  if (!(await isPublished(checked.ref))) return json({ error: 'not-found' }, 404)
  await saveBookmark(db(), checked.member.id, checked.ref, note)
  return json({ bookmarked: true, note })
}

/** Nicht mehr merken: DELETE { collection, id }. */
export async function DELETE(request: Request) {
  const checked = await guard(request)
  if ('error' in checked) return checked.error
  await removeBookmark(db(), checked.member.id, checked.ref)
  return json({ bookmarked: false })
}
