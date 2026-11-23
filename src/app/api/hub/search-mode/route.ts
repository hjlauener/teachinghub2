import { getSearchMode, saveSearchMode } from '@/ai/repo'
import { isSearchMode } from '@/ai/rules'
import { currentMember, db, json, readBody, requireMember } from '@/hub/server'

/** Suchen oder Fragen (Entscheidung 8.8): GET → { member, mode }; Gäste immer „suchen“. */
export async function GET(request: Request) {
  const member = await currentMember(request.headers)
  if (!member) return json({ member: false, mode: 'suchen' })
  return json({ member: true, mode: await getSearchMode(db(), member.id) })
}

/** Zuletzt gewählten Modus merken: PUT { mode } */
export async function PUT(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const { mode } = await readBody(request)
  if (!isSearchMode(mode)) return json({ error: 'invalid' }, 400)
  await saveSearchMode(db(), checked.member.id, mode)
  return json({ mode })
}
