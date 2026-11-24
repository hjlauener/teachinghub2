/**
 * Offene Änderungen der Altsite auflisten: `docker compose exec app npm run legacy:changes`
 * Zeigt, was der letzte Abgleich (`npm run legacy:delta`) gefunden hat und noch nicht erledigt ist,
 * und speichert die Liste zusätzlich in data/legacy/aenderungen-<datum>.md.
 */
import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'

import { getPayload } from 'payload'

import config from '@payload-config'

import { type ChangeEntry, formatChanges } from '../../src/migration/changes'
import { DATA_DIR } from '../../src/migration/config'

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'migration-inbox',
  where: { status: { in: ['open', 'later'] } },
  limit: 0,
  pagination: false,
  depth: 0,
  overrideAccess: true,
})
const text = formatChanges(docs as unknown as ChangeEntry[])
mkdirSync(DATA_DIR, { recursive: true })
const file = path.join(DATA_DIR, `aenderungen-${new Date().toISOString().slice(0, 10)}.md`)
writeFileSync(file, text)
console.log(text)
console.log(`Gespeichert: ${path.relative(process.cwd(), file)}`)
process.exit(0)
