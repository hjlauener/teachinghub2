import { Pool } from 'pg'

/**
 * Tabellen der Mitgliederkonten im eigenen Schema `auth`: Payload verwaltet `public` und würde fremde
 * Tabellen dort im Dev-Modus (Schema-Push) zum Löschen vorschlagen.
 */
export const AUTH_SCHEMA = 'auth'

export const AUTH_TABLES = {
  user: 'member',
  session: 'member_session',
  account: 'member_account',
  verification: 'member_verification',
  passkey: 'member_passkey',
} as const

let pool: Pool | null = null

export function authDatabase(): Pool {
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    options: `-c search_path=${AUTH_SCHEMA}`,
    max: 5,
  })
  return pool
}
