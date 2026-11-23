import { Pool } from 'pg'

import { AUTH_SCHEMA, AUTH_TABLES } from '../auth/database'

/**
 * Persönliche Daten der Mitglieder (Likes, Bookmarks, später Sammlungen) im eigenen Schema `hub`:
 * getrennt von Payload (`public`) und Better Auth (`auth`). Löschen des Kontos löscht alles (ON DELETE CASCADE).
 */
export const HUB_SCHEMA = 'hub'

const member = `${AUTH_SCHEMA}.${AUTH_TABLES.user}`

/** Idempotente DDL; läuft mit `npm run auth:migrate` nach den Auth-Tabellen. */
export const HUB_DDL: string[] = [
  `create schema if not exists ${HUB_SCHEMA}`,
  `create table if not exists ${HUB_SCHEMA}.likes (
    member_id text not null references ${member}(id) on delete cascade,
    collection text not null,
    doc_id integer not null,
    created_at timestamptz not null default now(),
    primary key (member_id, collection, doc_id)
  )`,
  `create index if not exists likes_doc_idx on ${HUB_SCHEMA}.likes (collection, doc_id)`,
  `create table if not exists ${HUB_SCHEMA}.bookmarks (
    member_id text not null references ${member}(id) on delete cascade,
    collection text not null,
    doc_id integer not null,
    note text not null default '' check (char_length(note) <= 2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (member_id, collection, doc_id)
  )`,
]

export type Queryable = Pick<Pool, 'query'>

let pool: Pool | null = null

export function hubDatabase(): Pool {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  return pool
}
