import type { Pool, PoolClient } from 'pg'

import { AI_DDL } from '../ai/database'
import { HUB_DDL, HUB_SCHEMA } from '../hub/database'

/**
 * Versionierte Migrationen der eigenen Schemas `hub` und `ai` (Review Architektur). Jede Migration läuft genau
 * einmal, in einer Transaktion; erledigte stehen in `app.sql_migrations`. Neue Änderungen immer als NEUE Migration
 * anhängen – bestehende nie ändern. Payload (`public`) und Better Auth (`auth`) haben eigene Migrationen.
 * Die ersten beiden sind idempotent, damit bestehende Datenbanken sie gefahrlos nachholen.
 */
export type SqlMigration = { id: string; description: string; statements: string[] }

export const SQL_MIGRATIONS: SqlMigration[] = [
  { id: '2026-11-23-01-hub', description: 'Persönliche Funktionen (Phasen 5 und 6)', statements: HUB_DDL },
  { id: '2026-11-23-02-ai', description: 'KI-Index (pgvector)', statements: AI_DDL },
  {
    id: '2026-11-24-01-rate-events',
    description: 'Ereignisse für Rate-Limits in der Datenbank statt im Speicher',
    statements: [
      `create table ${HUB_SCHEMA}.rate_events (
        member_id text not null references auth.member(id) on delete cascade,
        action text not null,
        created_at timestamptz not null default now()
      )`,
      `create index rate_events_lookup_idx on ${HUB_SCHEMA}.rate_events (member_id, action, created_at)`,
    ],
  },
]

/** Noch offene Migrationen in der Reihenfolge der Liste (rein, getestet). */
export function pendingMigrations(all: SqlMigration[], applied: Iterable<string>): SqlMigration[] {
  const done = new Set(applied)
  const ids = all.map((m) => m.id)
  if (new Set(ids).size !== ids.length) throw new Error('Doppelte Migrations-ID')
  if ([...ids].sort().join() !== ids.join()) throw new Error('Migrationen müssen nach ID sortiert sein')
  return all.filter((m) => !done.has(m.id))
}

/** Offene Migrationen ausführen; parallel startende Instanzen warten per Advisory-Lock aufeinander. */
export async function runSqlMigrations(pool: Pool, log: (msg: string) => void = console.log): Promise<string[]> {
  const client: PoolClient = await pool.connect()
  try {
    await client.query(`select pg_advisory_lock(hashtext('teachinghub2-sql-migrations'))`)
    await client.query(`create schema if not exists app`)
    await client.query(`create table if not exists app.sql_migrations (id text primary key, description text not null, applied_at timestamptz not null default now())`)
    const { rows } = await client.query<{ id: string }>(`select id from app.sql_migrations`)
    const ran: string[] = []
    for (const migration of pendingMigrations(SQL_MIGRATIONS, rows.map((r) => r.id))) {
      await client.query('begin')
      try {
        for (const statement of migration.statements) await client.query(statement)
        await client.query(`insert into app.sql_migrations (id, description) values ($1, $2)`, [migration.id, migration.description])
        await client.query('commit')
      } catch (error) {
        await client.query('rollback')
        throw new Error(`Migration ${migration.id} fehlgeschlagen: ${(error as Error).message}`)
      }
      log(`SQL-Migration ${migration.id}: ${migration.description}`)
      ran.push(migration.id)
    }
    return ran
  } finally {
    await client.query(`select pg_advisory_unlock(hashtext('teachinghub2-sql-migrations'))`).catch(() => null)
    client.release()
  }
}
