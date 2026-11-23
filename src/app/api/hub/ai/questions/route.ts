import { deleteAllQuestions, deleteQuestion, listQuestions } from '@/ai/repo'
import { isUuid } from '@/hub/rules'
import { db, json, requireMember } from '@/hub/server'

/** Verlauf (Entscheidung 8.12): GET → eigene Fragen und Antworten, neueste zuerst. */
export async function GET(request: Request) {
  const checked = await requireMember(request, { write: false })
  if ('error' in checked) return checked.error
  return json({ questions: await listQuestions(db(), checked.member.id) })
}

/** Löschen: DELETE ?id=… (eine Frage) oder ?alle=1 (ganzer Verlauf). */
export async function DELETE(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const params = new URL(request.url).searchParams
  if (params.get('alle') === '1') return json({ deleted: await deleteAllQuestions(db(), checked.member.id) })
  const id = params.get('id')
  if (!isUuid(id)) return json({ error: 'invalid' }, 400)
  return (await deleteQuestion(db(), id, checked.member.id)) ? json({ deleted: 1 }) : json({ error: 'not-found' }, 404)
}
