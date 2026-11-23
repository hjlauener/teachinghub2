/**
 * Tabellen der Mitgliederkonten anlegen/aktualisieren (Schema `auth`): `npm run auth:migrate`
 * Idempotent; läuft lokal, in der CI und vor dem Start der Demo-Instanz.
 */
import { getMigrations } from 'better-auth/db/migration'
import { Client } from 'pg'

import { AUTH_SCHEMA } from '../../src/auth/database'

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await client.query(`create schema if not exists ${AUTH_SCHEMA}`)
await client.end()

const { authOptions } = await import('../../src/auth/options')
const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(authOptions)
console.log(`Auth-Migration: ${toBeCreated.length} Tabellen neu, ${toBeAdded.length} Tabellen ergänzt.`)
await runMigrations()
console.log('Auth-Tabellen bereit.')
process.exit(0)
