import { getItem, removeItem, updateItem } from '@/hub/repo-collections'
import { isUuid, normalizeNote, normalizeText, TITLE_MAX } from '@/hub/rules'
import { db, json, readBody } from '@/hub/server'

import { loadCollection } from '@/hub/collection-access'

type Context = { params: Promise<{ id: string; itemId: string }> }

async function loadItem(request: Request, context: Context) {
  const loaded = await loadCollection(request, context.params, 'edit', true)
  if ('error' in loaded) return loaded
  const { itemId } = await context.params
  const item = isUuid(itemId) ? await getItem(db(), itemId) : null
  if (!item || item.collectionId !== loaded.collection.id)
    return { error: json({ error: 'not-found' }, 404) }
  return { ...loaded, item }
}

/** Eintrag ändern: PATCH { title?, note } */
export async function PATCH(request: Request, context: Context) {
  const loaded = await loadItem(request, context)
  if ('error' in loaded) return loaded.error
  const body = await readBody(request)
  const title = normalizeText(body.title ?? loaded.item.title, TITLE_MAX, {
    required: !loaded.item.ref,
  })
  const note = normalizeNote(body.note)
  if (title === null || note === null) return json({ error: 'invalid' }, 400)
  await updateItem(db(), loaded.item.id, { title, note })
  return json({ saved: true, title, note })
}

export async function DELETE(request: Request, context: Context) {
  const loaded = await loadItem(request, context)
  if ('error' in loaded) return loaded.error
  await removeItem(db(), loaded.item.id)
  return json({ deleted: true })
}
