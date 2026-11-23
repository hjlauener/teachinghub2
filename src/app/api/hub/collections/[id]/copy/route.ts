import { copyCollection } from '@/hub/repo-collections'
import { normalizeText, TITLE_MAX } from '@/hub/rules'
import { db, json, readBody } from '@/hub/server'

import { loadCollection } from '@/hub/collection-access'

/** Kopie übernehmen (Entscheidung 8.3): POST { title? } → { id } der eigenen Kopie. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const loaded = await loadCollection(request, params, 'read', true)
  if ('error' in loaded) return loaded.error
  const body = await readBody(request)
  const title = normalizeText(body.title ?? loaded.collection.title, TITLE_MAX, { required: true })
  if (title === null) return json({ error: 'invalid' }, 400)
  const id = await copyCollection(db(), loaded.collection.id, loaded.member.id, title)
  return json({ id }, 201)
}
