/**
 * Startdaten einspielen: `docker compose exec app npm run seed`
 * (führt `payload run src/seed/run.ts` aus).
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { seed } from './seed'

const payload = await getPayload({ config })
const { created, updated } = await seed(payload)
payload.logger.info(`Seed fertig: ${created} Schlagwörter neu, ${updated} aktualisiert, Navigation gesetzt.`)
process.exit(0)
