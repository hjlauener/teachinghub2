import { addItem } from '@/hub/repo-collections'
import { normalizeNote, normalizeText, parseRef, TITLE_MAX } from '@/hub/rules'
import { db, isPublished, json, readBody } from '@/hub/server'

import { loadCollection } from '@/hub/collection-access'

/**
 * Eintrag hinzufügen: POST { ref?: { collection, id }, title?, note? }.
 * Mit Verweis: nur Methoden in „Meine Methoden“ bzw. Tools in „Meine Tools“, und nur Publiziertes.
 * Ohne Verweis (eigener Eintrag): Titel Pflicht.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const loaded = await loadCollection(request, params, 'edit', true)
  if ('error' in loaded) return loaded.error
  const body = await readBody(request)
  const ref = body.ref === undefined || body.ref === null ? null : parseRef(body.ref)
  if (body.ref && !ref) return json({ error: 'invalid' }, 400)
  const title = normalizeText(body.title, TITLE_MAX, { required: !ref })
  const note = normalizeNote(body.note)
  if (title === null || note === null) return json({ error: 'invalid' }, 400)
  if (ref) {
    if (ref.collection !== loaded.collection.kind) return json({ error: 'kind' }, 400)
    if (!(await isPublished(ref))) return json({ error: 'not-found' }, 404)
  }
  const id = await addItem(db(), loaded.collection.id, { ref, title, note })
  return json({ id }, 201)
}
