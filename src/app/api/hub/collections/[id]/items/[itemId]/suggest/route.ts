import { getItem, setItemSuggestion } from '@/hub/repo-collections'
import { createSuggestion } from '@/hub/payload-data'
import { isUuid } from '@/hub/rules'
import { db, json, readBody, resolveDocs } from '@/hub/server'
import { getPayloadClient } from '@/lib/content'

import { loadCollection } from '@/hub/collection-access'

/**
 * „Der Redaktion vorschlagen“ (Entscheidung 2.3): nur Besitzer:in, einmal pro Eintrag.
 * Der Vorschlag landet in der Vorschlags-Inbox; der Entscheid kommt per Mail und in „Mein Hub“.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const loaded = await loadCollection(request, params, 'manage', true)
  if ('error' in loaded) return loaded.error
  const { itemId } = await params
  const item = isUuid(itemId) ? await getItem(db(), itemId) : null
  if (!item || item.collectionId !== loaded.collection.id) return json({ error: 'not-found' }, 404)
  if (item.suggestionId)
    return json({ error: 'already-suggested', suggestionId: item.suggestionId }, 409)
  const body = await readBody(request)
  const locale = body.locale === 'en' || body.locale === 'fr' ? body.locale : 'de'

  const kind = loaded.collection.kind
  let title = item.title
  if (item.ref && !title)
    title =
      (await resolveDocs([item.ref], 'de')).get(`${item.ref.collection}:${item.ref.docId}`)
        ?.title ?? ''
  if (!title) return json({ error: 'invalid' }, 400)
  const suggestionId = await createSuggestion(await getPayloadClient(), loaded.member, {
    kind,
    title,
    text: item.note,
    basedOn: item.ref ? { relationTo: kind, value: item.ref.docId } : null,
    locale,
  })
  await setItemSuggestion(db(), item.id, suggestionId)
  return json({ suggestionId }, 201)
}
