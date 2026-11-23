import { encryptApiKey, keyFromSecret } from '@/ai/crypto'
import { ProviderError, verifyKey } from '@/ai/providers'
import { deleteKey, getKey, keyInfo, saveKey, updateKeyModel } from '@/ai/repo'
import { isProvider, keyHint, normalizeApiKey, normalizeBaseUrl, normalizeModel } from '@/ai/rules'
import { testProviderEnabled } from '@/ai/providers'
import { db, json, readBody, requireMember } from '@/hub/server'
import { getPayloadClient } from '@/lib/content'

/** Modellliste des Admins (Entscheidung 8.5). */
async function adminModels() {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'ai-settings', depth: 0 }).catch(() => null)
  return (settings?.models ?? []).map((m) => ({ provider: m.provider, model: m.model, label: m.label }))
}

/** KI-Einstellungen: GET → { key: { provider, model, baseUrl, keyHint } | null, models } – nie der Schlüssel selbst. */
export async function GET(request: Request) {
  const checked = await requireMember(request, { write: false })
  if ('error' in checked) return checked.error
  return json({ key: keyInfo(await getKey(db(), checked.member.id)), models: await adminModels(), testProvider: testProviderEnabled() })
}

/**
 * Schlüssel speichern: PUT { provider, model, baseUrl?, apiKey? }. Ohne apiKey nur Modellwechsel beim gleichen Anbieter.
 * Ein neuer Schlüssel wird vor dem Speichern mit einem kurzen Aufruf beim Anbieter geprüft.
 */
export async function PUT(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  const { member } = checked
  const body = await readBody(request)
  const provider = body.provider
  const model = normalizeModel(body.model)
  if (!isProvider(provider, testProviderEnabled()) || !model) return json({ error: 'invalid' }, 400)
  const models = await adminModels()
  const listed = models.filter((m) => m.provider === provider)
  if (listed.length && !listed.some((m) => m.model === model)) return json({ error: 'model' }, 400)
  const baseUrl = provider === 'compatible' ? normalizeBaseUrl(body.baseUrl) : null
  if (provider === 'compatible' && !baseUrl) return json({ error: 'base-url' }, 400)

  const existing = await getKey(db(), member.id)
  if (body.apiKey === undefined || body.apiKey === '') {
    if (!existing || existing.provider !== provider || (existing.baseUrl ?? null) !== baseUrl) return json({ error: 'key-required' }, 400)
    await updateKeyModel(db(), member.id, model)
    return json({ key: keyInfo(await getKey(db(), member.id)) })
  }
  const apiKey = normalizeApiKey(body.apiKey)
  if (!apiKey) return json({ error: 'key-format' }, 400)
  try {
    await verifyKey({ provider, model, apiKey, baseUrl })
  } catch (error) {
    return json({ error: 'verify', code: error instanceof ProviderError ? error.code : 'other' }, 422)
  }
  let encrypted: string
  try {
    encrypted = encryptApiKey(apiKey, member.id, keyFromSecret(process.env.AI_KEY_SECRET))
  } catch (error) {
    console.error('[KI-Schlüssel]', error)
    return json({ error: 'not-configured' }, 503)
  }
  await saveKey(db(), member.id, { provider, model, baseUrl, keyEncrypted: encrypted, keyHint: keyHint(apiKey) })
  return json({ key: keyInfo(await getKey(db(), member.id)) })
}

/** Schlüssel löschen (jederzeit, Entscheidung 8.4). */
export async function DELETE(request: Request) {
  const checked = await requireMember(request, { write: true })
  if ('error' in checked) return checked.error
  await deleteKey(db(), checked.member.id)
  return json({ key: null })
}
