import { randomUUID } from 'node:crypto'

import { Pool } from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AUTH_SCHEMA, AUTH_TABLES } from '@/auth/database'
import { pendingMigrations, runSqlMigrations, SQL_MIGRATIONS } from '@/db/sql-migrations'
import { inTransaction } from '@/hub/database'
import { hitRateLimit } from '@/hub/rate'

/** Review Architektur: versionierte Migrationen, Rate-Limits in der DB, Transaktionen. */
const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 })
const member = randomUUID()

beforeAll(async () => {
  await runSqlMigrations(db, () => undefined)
  await db.query(`insert into ${AUTH_SCHEMA}.${AUTH_TABLES.user} (id, name, email, "emailVerified") values ($1, '', $2, true)`, [member, `arch-${member}@unibe.ch`])
})

afterAll(async () => {
  await db.query(`delete from ${AUTH_SCHEMA}.${AUTH_TABLES.user} where id = $1`, [member])
  await db.end()
})

describe('Versionierte SQL-Migrationen', () => {
  it('führt jede Migration genau einmal aus', async () => {
    expect(await runSqlMigrations(db, () => undefined)).toEqual([])
    const { rows } = await db.query<{ id: string }>(`select id from app.sql_migrations order by id`)
    expect(rows.map((r) => r.id)).toEqual(SQL_MIGRATIONS.map((m) => m.id))
  })

  it('verlangt eindeutige, sortierte IDs', () => {
    const a = { id: '1', description: '', statements: [] }
    const b = { id: '2', description: '', statements: [] }
    expect(pendingMigrations([a, b], ['1']).map((m) => m.id)).toEqual(['2'])
    expect(() => pendingMigrations([b, a], [])).toThrow(/sortiert/)
    expect(() => pendingMigrations([a, a], [])).toThrow(/Doppelte/)
  })
})

describe('Rate-Limit in der Datenbank', () => {
  it('zählt pro Mitglied und Aktion und sperrt über dem Limit', async () => {
    expect(await hitRateLimit(db, member, 'test', 2, 60)).toBe(true)
    expect(await hitRateLimit(db, member, 'test', 2, 60)).toBe(true)
    expect(await hitRateLimit(db, member, 'test', 2, 60)).toBe(false)
    expect(await hitRateLimit(db, member, 'andere-aktion', 2, 60)).toBe(true)
  })
})

describe('Transaktionen', () => {
  it('rollt bei einem Fehler alle Schritte zurück', async () => {
    await expect(
      inTransaction(db, async (tx) => {
        await tx.query(`insert into hub.rate_events (member_id, action) values ($1, 'tx-test')`, [member])
        throw new Error('Abbruch')
      }),
    ).rejects.toThrow('Abbruch')
    const { rows } = await db.query(`select 1 from hub.rate_events where member_id = $1 and action = 'tx-test'`, [member])
    expect(rows).toHaveLength(0)
  })
})
