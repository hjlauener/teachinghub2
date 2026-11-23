import type { Queryable } from '../hub/database'
import { HUB_SCHEMA } from '../hub/database'

import type { Provider, SearchMode } from './rules'

/** Datenzugriff für Schlüssel, Verlauf und Suchmodus der Mitglieder (Schema hub, Cascade beim Konto-Löschen). */
const keys = `${HUB_SCHEMA}.ai_keys`
const questions = `${HUB_SCHEMA}.ai_questions`
const preferences = `${HUB_SCHEMA}.preferences`
const inbox = `${HUB_SCHEMA}.inbox`

export type StoredKey = { provider: Provider; model: string; baseUrl: string | null; keyEncrypted: string; keyHint: string; updatedAt: Date }
/** Was der Browser über den Schlüssel erfährt: nie den Schlüssel selbst. */
export type KeyInfo = Omit<StoredKey, 'keyEncrypted'>

export async function getKey(db: Queryable, memberId: string): Promise<StoredKey | null> {
  const { rows } = await db.query<{ provider: Provider; model: string; base_url: string | null; key_encrypted: string; key_hint: string; updated_at: Date }>(
    `select provider, model, base_url, key_encrypted, key_hint, updated_at from ${keys} where member_id = $1`,
    [memberId],
  )
  const r = rows[0]
  return r ? { provider: r.provider, model: r.model, baseUrl: r.base_url, keyEncrypted: r.key_encrypted, keyHint: r.key_hint, updatedAt: r.updated_at } : null
}

export const keyInfo = (key: StoredKey | null): KeyInfo | null => (key ? { provider: key.provider, model: key.model, baseUrl: key.baseUrl, keyHint: key.keyHint, updatedAt: key.updatedAt } : null)

export async function saveKey(db: Queryable, memberId: string, input: Omit<StoredKey, 'updatedAt'>): Promise<void> {
  await db.query(
    `insert into ${keys} (member_id, provider, model, base_url, key_encrypted, key_hint) values ($1, $2, $3, $4, $5, $6)
     on conflict (member_id) do update set provider = excluded.provider, model = excluded.model, base_url = excluded.base_url,
       key_encrypted = excluded.key_encrypted, key_hint = excluded.key_hint, updated_at = now()`,
    [memberId, input.provider, input.model, input.baseUrl, input.keyEncrypted, input.keyHint],
  )
}

/** Nur Modell wechseln, Schlüssel behalten. */
export async function updateKeyModel(db: Queryable, memberId: string, model: string): Promise<boolean> {
  const result = await db.query(`update ${keys} set model = $2, updated_at = now() where member_id = $1`, [memberId, model])
  return (result.rowCount ?? 0) > 0
}

export async function deleteKey(db: Queryable, memberId: string): Promise<void> {
  await db.query(`delete from ${keys} where member_id = $1`, [memberId])
}

export type QuestionSource = { n: number; collection: string; docId: number; title: string; path: string | null; anchor: string | null; label: string | null }
export type Outcome = 'answered' | 'no_source' | 'error'
export type QuestionRow = {
  id: string
  memberId: string
  question: string
  answer: string
  outcome: Outcome
  sources: QuestionSource[]
  locale: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  createdAt: Date
}

type RawQuestion = {
  id: string
  member_id: string
  question: string
  answer: string
  outcome: Outcome
  sources: QuestionSource[]
  locale: string
  provider: string
  model: string
  input_tokens: number
  output_tokens: number
  created_at: Date
}
const toQuestion = (r: RawQuestion): QuestionRow => ({
  id: r.id,
  memberId: r.member_id,
  question: r.question,
  answer: r.answer,
  outcome: r.outcome,
  sources: r.sources,
  locale: r.locale,
  provider: r.provider,
  model: r.model,
  inputTokens: r.input_tokens,
  outputTokens: r.output_tokens,
  createdAt: r.created_at,
})

export async function saveQuestion(db: Queryable, memberId: string, input: Omit<QuestionRow, 'id' | 'memberId' | 'createdAt'>): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `insert into ${questions} (member_id, question, answer, outcome, sources, locale, provider, model, input_tokens, output_tokens)
     values ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10) returning id`,
    [memberId, input.question, input.answer.slice(0, 20000), input.outcome, JSON.stringify(input.sources), input.locale, input.provider, input.model, input.inputTokens, input.outputTokens],
  )
  return rows[0].id
}

export async function listQuestions(db: Queryable, memberId: string, limit = 200): Promise<QuestionRow[]> {
  const { rows } = await db.query<RawQuestion>(`select * from ${questions} where member_id = $1 order by created_at desc limit $2`, [memberId, limit])
  return rows.map(toQuestion)
}

/** Frage lesen: eigene oder mit mir geteilte (Inbox). */
export async function getQuestionFor(db: Queryable, id: string, memberId: string): Promise<{ question: QuestionRow; own: boolean } | null> {
  const { rows } = await db.query<RawQuestion & { shared: boolean }>(
    `select q.*, exists (select 1 from ${inbox} i where i.shared_question_id = q.id and i.recipient_id = $2) as shared
     from ${questions} q where q.id = $1`,
    [id, memberId],
  )
  const r = rows[0]
  if (!r) return null
  const own = r.member_id === memberId
  return own || r.shared ? { question: toQuestion(r), own } : null
}

export async function deleteQuestion(db: Queryable, id: string, memberId: string): Promise<boolean> {
  const result = await db.query(`delete from ${questions} where id = $1 and member_id = $2`, [id, memberId])
  return (result.rowCount ?? 0) > 0
}

export async function deleteAllQuestions(db: Queryable, memberId: string): Promise<number> {
  const result = await db.query(`delete from ${questions} where member_id = $1`, [memberId])
  return result.rowCount ?? 0
}

/** Fragen der letzten Stunde (Missbrauchsschutz für die Server-Last; die Kosten trägt der eigene Schlüssel). */
export async function recentQuestionCount(db: Queryable, memberId: string): Promise<number> {
  const { rows } = await db.query<{ n: string }>(`select count(*) as n from ${questions} where member_id = $1 and created_at > now() - interval '1 hour'`, [memberId])
  return Number(rows[0]?.n ?? 0)
}

export async function addQuestionShare(db: Queryable, input: { recipientId: string; senderId: string; questionId: string; message: string }): Promise<void> {
  await db.query(`insert into ${inbox} (recipient_id, sender_id, shared_question_id, message) values ($1, $2, $3, $4)`, [input.recipientId, input.senderId, input.questionId, input.message])
}

export async function getSearchMode(db: Queryable, memberId: string): Promise<SearchMode> {
  const { rows } = await db.query<{ search_mode: SearchMode }>(`select search_mode from ${preferences} where member_id = $1`, [memberId])
  return rows[0]?.search_mode ?? 'suchen'
}

export async function saveSearchMode(db: Queryable, memberId: string, mode: SearchMode): Promise<void> {
  await db.query(
    `insert into ${preferences} (member_id, search_mode) values ($1, $2)
     on conflict (member_id) do update set search_mode = excluded.search_mode, updated_at = now()`,
    [memberId, mode],
  )
}
