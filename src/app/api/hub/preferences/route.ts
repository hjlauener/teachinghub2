import { savePreferences } from '@/hub/repo-collections'
import { db, json, readBody, requireMember } from '@/hub/server'

/** Benachrichtigungen: PUT { notifyShares: boolean, locale?: de|en|fr } */
export async function PUT(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const body = await readBody(request)
  if (typeof body.notifyShares !== 'boolean') return json({ error: 'invalid' }, 400)
  const locale =
    body.locale === 'de' || body.locale === 'en' || body.locale === 'fr' ? body.locale : undefined
  return json(
    await savePreferences(db(), checked.member.id, {
      notifyShares: body.notifyShares,
      ...(locale ? { locale } : {}),
    }),
  )
}
