/**
 * Feld-Hashes aller Import-Stände aus den gespeicherten Import-Daten neu berechnen
 * (nach Änderungen an der Hash-Normalisierung): `npm run legacy:rehash`
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { fieldHashes, type ImportCollection } from '../../src/migration/fields'

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'legacy-snapshots', limit: 0, pagination: false, depth: 0, overrideAccess: true })
for (const snapshot of docs) {
  await payload.update({
    collection: 'legacy-snapshots',
    id: snapshot.id,
    data: { fieldHashes: fieldHashes(snapshot.targetCollection as ImportCollection, (snapshot.data ?? {}) as Record<string, unknown>) },
    overrideAccess: true,
  })
}
payload.logger.info(`${docs.length} Import-Stände neu gehasht.`)
process.exit(0)
