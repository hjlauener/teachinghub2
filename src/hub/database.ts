import { Pool } from 'pg'

import { AUTH_SCHEMA, AUTH_TABLES } from '../auth/database'

/**
 * Persönliche Daten der Mitglieder (Likes, Bookmarks, Sammlungen, Teilen) im eigenen Schema `hub`:
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
  // Phase 5, Teil 2: „Meine Methoden“ / „Meine Tools“ (Entscheidung 2.3) – private Sammlungen
  `create table if not exists ${HUB_SCHEMA}.collections (
    id uuid primary key default gen_random_uuid(),
    owner_id text not null references ${member}(id) on delete cascade,
    kind text not null check (kind in ('methods', 'tools')),
    title text not null check (char_length(title) between 1 and 200),
    description text not null default '' check (char_length(description) <= 2000),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  `create index if not exists collections_owner_idx on ${HUB_SCHEMA}.collections (owner_id, kind)`,
  // Einträge: Verweis auf eine Methode/ein Tool des Hubs (optional) oder eigener Eintrag; Notiz/Variante
  `create table if not exists ${HUB_SCHEMA}.collection_items (
    id uuid primary key default gen_random_uuid(),
    collection_id uuid not null references ${HUB_SCHEMA}.collections(id) on delete cascade,
    ref_collection text,
    ref_doc_id integer,
    title text not null default '' check (char_length(title) <= 200),
    note text not null default '' check (char_length(note) <= 2000),
    suggestion_id integer,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check ((ref_collection is null) = (ref_doc_id is null)),
    check (ref_collection is not null or char_length(title) > 0)
  )`,
  `create index if not exists collection_items_collection_idx on ${HUB_SCHEMA}.collection_items (collection_id, created_at)`,
  // Teilen einer Sammlung mit Mitgliedern (Entscheidung 8.3): standardmässig nur lesen, widerrufbar
  `create table if not exists ${HUB_SCHEMA}.collection_shares (
    collection_id uuid not null references ${HUB_SCHEMA}.collections(id) on delete cascade,
    member_id text not null references ${member}(id) on delete cascade,
    can_edit boolean not null default false,
    created_at timestamptz not null default now(),
    primary key (collection_id, member_id)
  )`,
  // „Mit mir geteilt“: geteilte Inhalte oder Sammlungen mit optionaler Nachricht
  `create table if not exists ${HUB_SCHEMA}.inbox (
    id uuid primary key default gen_random_uuid(),
    recipient_id text not null references ${member}(id) on delete cascade,
    sender_id text references ${member}(id) on delete set null,
    ref_collection text,
    ref_doc_id integer,
    shared_collection_id uuid references ${HUB_SCHEMA}.collections(id) on delete cascade,
    message text not null default '' check (char_length(message) <= 1000),
    read_at timestamptz,
    created_at timestamptz not null default now(),
    check ((ref_collection is not null and ref_doc_id is not null) <> (shared_collection_id is not null))
  )`,
  `create index if not exists inbox_recipient_idx on ${HUB_SCHEMA}.inbox (recipient_id, created_at desc)`,
  `create table if not exists ${HUB_SCHEMA}.preferences (
    member_id text primary key references ${member}(id) on delete cascade,
    notify_shares boolean not null default true,
    locale text not null default 'de' check (locale in ('de', 'en', 'fr')),
    updated_at timestamptz not null default now()
  )`,
]

export type Queryable = Pick<Pool, 'query'>

let pool: Pool | null = null

export function hubDatabase(): Pool {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  return pool
}
