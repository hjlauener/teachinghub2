import { deleteCollection, listItems, updateCollection } from '@/hub/repo-collections'
import { normalizeText, TITLE_MAX } from '@/hub/rules'
import { db, json, readBody } from '@/hub/server'

import { loadCollection } from '@/hub/collection-access'

type Context = { params: Promise<{ id: string }> }

/** Sammlung mit Einträgen (Besitzer:in und Geteilte). */
export async function GET(request: Request, { params }: Context) {
  const loaded = await loadCollection(request, params, 'read', false)
  if ('error' in loaded) return loaded.error
  return json({
    collection: loaded.collection,
    access: loaded.access,
    items: await listItems(db(), loaded.collection.id),
  })
}

/** Titel/Beschreibung ändern: PATCH { title, description } (Besitzer:in oder „darf bearbeiten“). */
export async function PATCH(request: Request, { params }: Context) {
  const loaded = await loadCollection(request, params, 'edit', true)
  if ('error' in loaded) return loaded.error
  const body = await readBody(request)
  const title = normalizeText(body.title, TITLE_MAX, { required: true })
  const description = normalizeText(body.description, 2000, { multiline: true })
  if (title === null || description === null) return json({ error: 'invalid' }, 400)
  await updateCollection(db(), loaded.collection.id, { title, description })
  return json({ saved: true })
}

/** Sammlung löschen (nur Besitzer:in). */
export async function DELETE(request: Request, { params }: Context) {
  const loaded = await loadCollection(request, params, 'manage', true)
  if ('error' in loaded) return loaded.error
  await deleteCollection(db(), loaded.collection.id, loaded.member.id)
  return json({ deleted: true })
}
