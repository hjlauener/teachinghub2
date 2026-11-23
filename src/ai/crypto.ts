import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * Verschlüsselung der API-Schlüssel (Entscheidung 8.4): AES-256-GCM, Schlüssel aus `AI_KEY_SECRET`
 * (ausserhalb der Datenbank). Die Mitglieds-ID ist als „associated data“ gebunden: ein kopierter
 * Datensatz lässt sich bei einem anderen Mitglied nicht entschlüsseln.
 *
 * Format `v2:<schlüssel-id>:<iv>:<tag>:<ciphertext>` (Base64). Die Schlüssel-ID erlaubt eine Rotation:
 * neues Geheimnis in `AI_KEY_SECRET`, das alte in `AI_KEY_SECRET_PREVIOUS`, dann `npm run ai:rotate-keys`.
 * Ältere Einträge im Format `v1:<iv>:<tag>:<ciphertext>` werden mit dem aktuellen Schlüssel gelesen.
 */
export type DataKey = { id: string; key: Buffer }
export type Keyring = { current: DataKey; all: DataKey[] }

export function keyFromSecret(secret: string | undefined): DataKey {
  if (!secret || secret.length < 32) throw new Error('AI_KEY_SECRET fehlt oder ist kürzer als 32 Zeichen')
  const key = createHash('sha256').update(secret, 'utf8').digest()
  return { id: createHash('sha256').update(key).digest('hex').slice(0, 8), key }
}

export function keyringFromEnv(env: Record<string, string | undefined> = process.env): Keyring {
  const current = keyFromSecret(env.AI_KEY_SECRET)
  const previous = env.AI_KEY_SECRET_PREVIOUS ? [keyFromSecret(env.AI_KEY_SECRET_PREVIOUS)] : []
  return { current, all: [current, ...previous] }
}

export function encryptApiKey(plain: string, memberId: string, keyring: Keyring): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyring.current.key, iv)
  cipher.setAAD(Buffer.from(memberId, 'utf8'))
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return ['v2', keyring.current.id, iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':')
}

function decryptWith(key: Buffer, iv: string, tag: string, data: string, memberId: string): string {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
  decipher.setAAD(Buffer.from(memberId, 'utf8'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8')
}

export function decryptApiKey(stored: string, memberId: string, keyring: Keyring): string {
  const parts = stored.split(':')
  if (parts[0] === 'v1' && parts.length === 4) return decryptWith(keyring.current.key, parts[1], parts[2], parts[3], memberId)
  if (parts[0] === 'v2' && parts.length === 5) {
    const dataKey = keyring.all.find((k) => k.id === parts[1])
    if (!dataKey) throw new Error('Schlüssel-ID unbekannt (AI_KEY_SECRET_PREVIOUS fehlt?)')
    return decryptWith(dataKey.key, parts[2], parts[3], parts[4], memberId)
  }
  throw new Error('Unbekanntes Schlüsselformat')
}

/** Braucht der Eintrag eine Neuverschlüsselung mit dem aktuellen Schlüssel? */
export const needsRotation = (stored: string, keyring: Keyring): boolean => !stored.startsWith(`v2:${keyring.current.id}:`)
