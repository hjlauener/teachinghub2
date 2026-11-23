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
  // Phase 6: Ask-a-question (Entscheidungen 8.4, 8.8, 8.12)
  `alter table ${HUB_SCHEMA}.preferences add column if not exists search_mode text not null default 'suchen' check (search_mode in ('suchen', 'fragen'))`,
  // Eigener API-Schlüssel (BYOK), verschlüsselt (AES-GCM, Schlüssel ausserhalb der DB); nie im Klartext
  `create table if not exists ${HUB_SCHEMA}.ai_keys (
    member_id text primary key references ${member}(id) on delete cascade,
    provider text not null check (provider in ('anthropic', 'openai', 'compatible', 'test')),
    model text not null,
    base_url text,
    key_encrypted text not null,
    key_hint text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`,
  // Verlauf: bleibt, bis das Mitglied ihn löscht (8.12)
  `create table if not exists ${HUB_SCHEMA}.ai_questions (
    id uuid primary key default gen_random_uuid(),
    member_id text not null references ${member}(id) on delete cascade,
    question text not null check (char_length(question) <= 1000),
    answer text not null default '' check (char_length(answer) <= 20000),
    outcome text not null check (outcome in ('answered', 'no_source', 'error')),
    sources jsonb not null default '[]',
    locale text not null default 'de',
    provider text not null,
    model text not null,
    input_tokens integer not null default 0,
    output_tokens integer not null default 0,
    created_at timestamptz not null default now()
  )`,
  `create index if not exists ai_questions_member_idx on ${HUB_SCHEMA}.ai_questions (member_id, created_at desc)`,
  // Antworten mit Mitgliedern teilen (8.7): Ziel der Inbox ist Inhalt, Sammlung oder Frage
  `alter table ${HUB_SCHEMA}.inbox add column if not exists shared_question_id uuid references ${HUB_SCHEMA}.ai_questions(id) on delete cascade`,
  `alter table ${HUB_SCHEMA}.inbox drop constraint if exists inbox_check`,
  `alter table ${HUB_SCHEMA}.inbox drop constraint if exists inbox_target_check`,
  `alter table ${HUB_SCHEMA}.inbox add constraint inbox_target_check check (
    num_nonnulls(ref_doc_id, shared_collection_id, shared_question_id) = 1 and (ref_collection is null) = (ref_doc_id is null)
  )`,
]

export type Queryable = Pick<Pool, 'query'>

/**
 * Mehrere Schreibvorgänge atomar ausführen (Review Architektur). Mit einem Pool: eigene Verbindung mit
 * BEGIN/COMMIT, bei Fehler ROLLBACK. Mit einer bereits geliehenen Verbindung (z. B. in Tests oder verschachtelt)
 * läuft die Funktion direkt darauf.
 */
export async function inTransaction<T>(db: Queryable, fn: (tx: Queryable) => Promise<T>): Promise<T> {
  if (!(db instanceof Pool)) return fn(db)
  const client = await db.connect()
  try {
    await client.query('begin')
    const result = await fn(client)
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback').catch(() => null)
    throw error
  } finally {
    client.release()
  }
}

let pool: Pool | null = null

export function hubDatabase(): Pool {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  return pool
}
