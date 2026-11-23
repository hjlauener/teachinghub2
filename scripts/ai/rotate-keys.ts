/**
 * Gespeicherte KI-Schlüssel mit dem aktuellen AI_KEY_SECRET neu verschlüsseln: `npm run ai:rotate-keys`
 * Ablauf einer Rotation: neues Geheimnis in AI_KEY_SECRET, das bisherige in AI_KEY_SECRET_PREVIOUS,
 * App neu starten, dieses Skript ausführen, danach AI_KEY_SECRET_PREVIOUS entfernen.
 */
import { decryptApiKey, encryptApiKey, keyringFromEnv, needsRotation } from '../../src/ai/crypto'
import { listEncryptedKeys, updateEncryptedKey } from '../../src/ai/repo'
import { hubDatabase } from '../../src/hub/database'

const keyring = keyringFromEnv()
const db = hubDatabase()
let rotated = 0
let failed = 0
for (const entry of await listEncryptedKeys(db)) {
  if (!needsRotation(entry.keyEncrypted, keyring)) continue
  try {
    const plain = decryptApiKey(entry.keyEncrypted, entry.memberId, keyring)
    if (await updateEncryptedKey(db, entry.memberId, entry.keyEncrypted, encryptApiKey(plain, entry.memberId, keyring))) rotated++
  } catch {
    failed++
  }
}
console.log(`KI-Schlüssel neu verschlüsselt: ${rotated}; nicht lesbar: ${failed} (diese Mitglieder müssen den Schlüssel neu hinterlegen).`)
await db.end()
process.exit(failed ? 1 : 0)
