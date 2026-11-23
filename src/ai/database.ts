import { EMBEDDING_DIMENSIONS } from './embed'

/**
 * KI-Index im eigenen Schema `ai` (Entscheidungen 8.6, 8.9): ein Eintrag pro Abschnitt und Sprache,
 * Vektor aus dem lokalen Embedding-Modell. Nur öffentliche Inhalte – keine Personendaten.
 * Idempotente DDL; läuft mit `npm run auth:migrate`. Braucht die PostgreSQL-Erweiterung pgvector.
 */
export const AI_SCHEMA = 'ai'

export const AI_DDL: string[] = [
  `create extension if not exists vector`,
  `create schema if not exists ${AI_SCHEMA}`,
  `create table if not exists ${AI_SCHEMA}.chunks (
    id bigserial primary key,
    collection text not null,
    doc_id integer not null,
    locale text not null check (locale in ('de', 'en', 'fr')),
    part integer not null,
    title text not null,
    path text,
    anchor text,
    label text,
    text text not null,
    content_hash text not null,
    embedder text not null,
    embedding vector(${EMBEDDING_DIMENSIONS}) not null,
    updated_at timestamptz not null default now(),
    unique (collection, doc_id, locale, part)
  )`,
  `create index if not exists chunks_doc_idx on ${AI_SCHEMA}.chunks (collection, doc_id)`,
  `create index if not exists chunks_embedding_idx on ${AI_SCHEMA}.chunks using hnsw (embedding vector_cosine_ops)`,
]
