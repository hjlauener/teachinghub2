import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * Verschlüsselung der API-Schlüssel (Entscheidung 8.4): AES-256-GCM, Schlüssel aus `AI_KEY_SECRET`
 * (ausserhalb der Datenbank). Die Mitglieds-ID ist als „associated data“ gebunden: ein kopierter
 * Datensatz lässt sich bei einem anderen Mitglied nicht entschlüsseln.
 * Format: `v1:<iv>:<tag>:<ciphertext>` (Base64).
 */
const VERSION = 'v1'

export function keyFromSecret(secret: string | undefined): Buffer {
  if (!secret || secret.length < 32) throw new Error('AI_KEY_SECRET fehlt oder ist kürzer als 32 Zeichen')
  return createHash('sha256').update(secret, 'utf8').digest()
}

export function encryptApiKey(plain: string, memberId: string, key: Buffer): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  cipher.setAAD(Buffer.from(memberId, 'utf8'))
  const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  return [VERSION, iv.toString('base64'), cipher.getAuthTag().toString('base64'), data.toString('base64')].join(':')
}

export function decryptApiKey(stored: string, memberId: string, key: Buffer): string {
  const [version, iv, tag, data] = stored.split(':')
  if (version !== VERSION || !iv || !tag || !data) throw new Error('Unbekanntes Schlüsselformat')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'))
  decipher.setAAD(Buffer.from(memberId, 'utf8'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]).toString('utf8')
}
