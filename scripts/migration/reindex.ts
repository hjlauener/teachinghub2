/**
 * Suchtext (searchText) aller Inhalte neu aufbauen: `npm run search:reindex`
 * Speichert jedes Dokument in DE einmal neu, damit der beforeChange-Hook den Text erzeugt.
 * EN/FR fallen bis zur Übersetzung auf den DE-Suchtext zurück (Payload-Fallback); bewusst kein Speichern
 * in EN/FR, damit keine Fallback-Werte als „übersetzt“ gespeichert werden.
 */
import { getPayload } from 'payload'

import config from '@payload-config'

const payload = await getPayload({ config })
let count = 0
for (const collection of ['articles', 'methods', 'tools', 'news'] as const) {
  const { docs } = await payload.find({ collection, limit: 0, pagination: false, depth: 0, overrideAccess: true })
  for (const { id } of docs) {
    await payload.update({ collection, id, data: {}, locale: 'de', depth: 0, overrideAccess: true })
    count++
  }
}
payload.logger.info(`Suchtext für ${count} Dokumente neu aufgebaut.`)
process.exit(0)
