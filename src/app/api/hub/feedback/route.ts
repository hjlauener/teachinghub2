import {
  createFeedback,
  deleteMemberFeedback,
  listMemberFeedback,
  recentFeedbackCount,
} from '@/hub/payload-data'
import {
  detectImageType,
  FEEDBACK_PER_HOUR,
  safeReturnPath,
  FEEDBACK_MESSAGE_MAX,
  IMAGE_MAX_BYTES,
  isFeedbackKind,
  normalizeText,
  PLACE_MAX,
} from '@/hub/rules'
import { json, requireMember } from '@/hub/server'
import { getPayloadClient } from '@/lib/content'

/**
 * Feedback an die Redaktion (Entscheidungen 8.2, 8.2a): nur angemeldet, multipart/form-data mit
 * kind, place, message, pageUrl, locale und optional image (PNG/JPEG/WebP, höchstens 5 MB).
 */
export async function POST(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > IMAGE_MAX_BYTES + 100_000) return json({ error: 'too-large' }, 413)
  const form = await request.formData().catch(() => null)
  if (!form) return json({ error: 'invalid' }, 400)

  const kind = form.get('kind')
  const place = normalizeText(form.get('place'), PLACE_MAX, { required: true })
  const message = normalizeText(form.get('message'), FEEDBACK_MESSAGE_MAX, {
    required: true,
    multiline: true,
  })
  const rawUrl = normalizeText(form.get('pageUrl'), 500) ?? ''
  // Nur lokale Pfade mit Sprachpräfix (sonst leer) – der Link erscheint in Admin und „Mein Hub“
  const pageUrl = rawUrl && safeReturnPath(rawUrl, 'de') === rawUrl ? rawUrl : ''
  const locale = String(form.get('locale') ?? 'de')
  if (!isFeedbackKind(kind) || !place || !message) return json({ error: 'invalid' }, 400)

  let image: { data: Buffer; type: NonNullable<ReturnType<typeof detectImageType>> } | null = null
  const file = form.get('image')
  if (file instanceof File && file.size > 0) {
    if (file.size > IMAGE_MAX_BYTES) return json({ error: 'too-large' }, 413)
    const data = Buffer.from(await file.arrayBuffer())
    const type = detectImageType(data)
    if (!type) return json({ error: 'image-type' }, 415)
    image = { data, type }
  }

  const payload = await getPayloadClient()
  if ((await recentFeedbackCount(payload, checked.member.id)) >= FEEDBACK_PER_HOUR)
    return json({ error: 'rate-limit' }, 429)
  const id = await createFeedback(payload, checked.member, {
    kind,
    place,
    pageUrl,
    message,
    locale: ['en', 'fr'].includes(locale) ? locale : 'de',
    image,
  })
  return json({ id }, 201)
}

/** Eigenes Feedback mit Status und Antwort der Redaktion. */
export async function GET(request: Request) {
  const checked = await requireMember(request, { write: false })
  if ('error' in checked) return checked.error
  return json({ feedback: await listMemberFeedback(await getPayloadClient(), checked.member.id) })
}

/** Eigenes Feedback (inkl. Bild) löschen: DELETE ?id=… */
export async function DELETE(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!Number.isSafeInteger(id) || id <= 0) return json({ error: 'invalid' }, 400)
  const deleted = await deleteMemberFeedback(await getPayloadClient(), checked.member.id, id)
  return deleted ? json({ deleted: true }) : json({ error: 'not-found' }, 404)
}
