import {
  createCollection,
  editableCollections,
  listOwnCollections,
  listSharedCollections,
} from '@/hub/repo-collections'
import { isCollectionKind, normalizeText, TITLE_MAX } from '@/hub/rules'
import { db, json, readBody, requireMember } from '@/hub/server'

/** Sammlungen: GET ?kind=methods|tools[&editable=1] → eigene (+ geteilte) Sammlungen. */
export async function GET(request: Request) {
  const checked = await requireMember(request, { write: false })
  if ('error' in checked) return checked.error
  const params = new URL(request.url).searchParams
  const kind = params.get('kind')
  if (kind !== null && !isCollectionKind(kind)) return json({ error: 'invalid' }, 400)
  const id = checked.member.id
  if (params.get('editable') === '1') {
    if (!kind) return json({ error: 'invalid' }, 400)
    return json({ collections: await editableCollections(db(), id, kind) })
  }
  const [own, shared] = await Promise.all([
    listOwnCollections(db(), id, kind ?? undefined),
    listSharedCollections(db(), id, kind ?? undefined),
  ])
  return json({ own, shared })
}

/** Neue Sammlung: POST { kind, title, description? } */
export async function POST(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const body = await readBody(request)
  const title = normalizeText(body.title, TITLE_MAX, { required: true })
  const description = normalizeText(body.description, 2000, { multiline: true })
  if (!isCollectionKind(body.kind) || title === null || description === null)
    return json({ error: 'invalid' }, 400)
  const id = await createCollection(db(), checked.member.id, {
    kind: body.kind,
    title,
    description,
  })
  return json({ id }, 201)
}
