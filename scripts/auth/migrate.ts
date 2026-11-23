/**
 * Tabellen der Mitgliederkonten (Schema `auth`) und ihrer persönlichen Daten (Schema `hub`)
 * anlegen/aktualisieren: `npm run auth:migrate`
 * Better Auth gleicht sein Schema selbst ab; hub/ai über versionierte SQL-Migrationen (src/db/sql-migrations.ts).
 * Läuft lokal, in der CI und vor dem Start der Demo-Instanz.
 */
import { getMigrations } from 'better-auth/db/migration'
import { Client, Pool } from 'pg'

import { AUTH_SCHEMA } from '../../src/auth/database'
import { runSqlMigrations } from '../../src/db/sql-migrations'

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await client.query(`create schema if not exists ${AUTH_SCHEMA}`)
await client.end()

const { authOptions } = await import('../../src/auth/options')
const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(authOptions)
console.log(`Auth-Migration: ${toBeCreated.length} Tabellen neu, ${toBeAdded.length} Tabellen ergänzt.`)
await runMigrations()
console.log('Auth-Tabellen bereit.')

// Persönliche Daten (Schema hub) und KI-Index (Schema ai): versionierte Migrationen, verweisen auf auth.member
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const ran = await runSqlMigrations(pool)
await pool.end()
console.log(ran.length ? `SQL-Migrationen ausgeführt: ${ran.length}` : 'Hub- und KI-Tabellen aktuell.')
process.exit(0)
