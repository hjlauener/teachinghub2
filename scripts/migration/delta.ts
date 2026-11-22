/**
 * Delta-Abgleich mit der Altsite: `docker compose exec app npm run legacy:delta`
 * (mit `LEGACY_NO_CRAWL=1` nur gegen die vorhandenen Rohdaten). Ergebnis: Einträge in der Migrations-Inbox.
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { runDelta } from '../../src/migration/delta'

const payload = await getPayload({ config })
const report = await runDelta(payload, { crawl: process.env.LEGACY_NO_CRAWL !== '1' })
for (const e of report.errors.slice(0, 20)) payload.logger.warn(`Fehler ${e.path}: ${e.error}`)
process.exit(report.errors.length > 0 ? 1 : 0)
