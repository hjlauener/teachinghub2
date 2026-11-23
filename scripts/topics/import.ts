/**
 * Landingpage-Konzept ins CMS übernehmen: `docker compose exec app npm run topics:import`
 * Quelle: docs/konzept-landingpages/ (im Repository). Idempotent.
 */
import path from 'path'
import { getPayload } from 'payload'

import config from '@payload-config'

import { importTopics } from '../../src/topics/import'

const payload = await getPayload({ config })
const report = await importTopics(payload, path.resolve(process.cwd(), 'docs/konzept-landingpages'), (m) => payload.logger.info(m))
payload.logger.info(`Themen: ${report.topics} Kernthemen (${report.live} live), ${report.subtopics} Unterthemen, ${report.warnings.length} Hinweise`)
for (const w of report.warnings) payload.logger.warn(w)
process.exit(0)
