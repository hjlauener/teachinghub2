import { randomUUID } from 'node:crypto'

import { Pool } from 'pg'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { AI_DDL } from '@/ai/database'
import { fakeEmbedder } from '@/ai/embed'
import { indexDocument } from '@/ai/indexer'
import { deleteDocument, nearestChunks } from '@/ai/index-repo'
import {
  addQuestionShare,
  deleteAllQuestions,
  deleteQuestion,
  getKey,
  getQuestionFor,
  getSearchMode,
  keyInfo,
  listQuestions,
  recentQuestionCount,
  saveKey,
  saveQuestion,
  saveSearchMode,
} from '@/ai/repo'
import { AUTH_SCHEMA, AUTH_TABLES } from '@/auth/database'
import { HUB_DDL } from '@/hub/database'
import config from '@/payload.config'

/**
 * Ask-a-question (Phase 6) gegen PostgreSQL mit pgvector: Index aus Payload-Inhalten (Ersatz-Embeddings),
 * Suche, Schlüssel, Verlauf, Teilen und Löschen. Voraussetzung: `npm run auth:migrate`.
 */
const db = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 })
const member = `${AUTH_SCHEMA}.${AUTH_TABLES.user}`
const run = randomUUID().slice(0, 8)
const [asker, colleague, stranger] = [randomUUID(), randomUUID(), randomUUID()]
const embedder = fakeEmbedder()
let payload: Payload
let articleId: number

const lexical = (text: string) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: [
      {
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      },
    ],
  },
})

beforeAll(async () => {
  for (const statement of [...HUB_DDL, ...AI_DDL]) await db.query(statement)
  for (const id of [asker, colleague, stranger]) await db.query(`insert into ${member} (id, name, email, "emailVerified") values ($1, '', $2, true)`, [id, `ai-${id}@unibe.ch`])
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  if (articleId) {
    await payload.delete({ collection: 'articles', id: articleId, overrideAccess: true }).catch(() => null)
    await deleteDocument(db, 'articles', articleId)
  }
  await db.query(`delete from ${member} where id = any($1)`, [[asker, colleague, stranger]])
  await payload?.destroy()
  await db.end()
})

describe('KI-Index aus Payload-Inhalten (Entscheidungen 8.6, 8.9)', () => {
  it('indexiert publizierte Artikel abschnittsweise und findet sie per Ähnlichkeit', async () => {
    const article = await payload.create({
      collection: 'articles',
      data: {
        title: `Kugellager ${run}`,
        lead: 'Eine Methode für Gespräche in zwei Kreisen.',
        path: `/test/kugellager_${run}`,
        whatIsBehind: lexical(`Beim Kugellager ${run} sitzen sich Studierende in einem Innenkreis und einem Aussenkreis gegenüber und tauschen sich aus.`),
        _status: 'published',
      } as never, // Pflichtfelder der Rubriken sind für den Index unerheblich
      overrideAccess: true,
    })
    articleId = article.id
    // Speichern reiht einen Index-Auftrag in die Payload-Warteschlange ein (überlebt Neustarts; Review Architektur)
    const jobs = await payload.find({ collection: 'payload-jobs', where: { and: [{ taskSlug: { equals: 'aiIndex' } }, { 'input.id': { equals: articleId } }] }, overrideAccess: true })
    expect(jobs.totalDocs).toBeGreaterThan(0)
    expect(await indexDocument(payload, 'articles', articleId, { db, embedder })).toBe(2)
    // unverändert: nichts neu einbetten
    expect(await indexDocument(payload, 'articles', articleId, { db, embedder })).toBe(0)

    const [vector] = await embedder.embed([`Wie funktioniert das Kugellager ${run} mit Innenkreis und Aussenkreis?`])
    const hits = await nearestChunks(db, vector, embedder.name, 5)
    expect(hits[0]).toMatchObject({ collection: 'articles', docId: articleId, locale: 'de', anchor: 'was-steckt-dahinter', label: 'Was steckt dahinter – und wofür ist es gut?' })
    expect(hits[0].score).toBeGreaterThan(embedder.minScore)
  })

  it('nimmt EN erst mit menschlicher Übersetzung auf', async () => {
    const { rows: before } = await db.query(`select distinct locale from ai.chunks where collection = 'articles' and doc_id = $1`, [articleId])
    expect(before.map((r) => r.locale)).toEqual(['de'])
    await payload.update({
      collection: 'articles',
      id: articleId,
      locale: 'en',
      data: { title: `Ball bearing ${run}`, lead: 'A method for conversations in two circles.', _status: 'published' },
      overrideAccess: true,
    })
    await indexDocument(payload, 'articles', articleId, { db, embedder })
    const { rows } = await db.query<{ locale: string; title: string }>(`select distinct locale, title from ai.chunks where collection = 'articles' and doc_id = $1 order by locale`, [articleId])
    expect(rows).toEqual([
      { locale: 'de', title: `Kugellager ${run}` },
      { locale: 'en', title: `Ball bearing ${run}` },
    ])
  })

  it('entfernt Entwürfe und gelöschte Inhalte aus dem Index', async () => {
    // Zurück auf Entwurf (unpubliziert): verschwindet aus dem Index
    await payload.update({ collection: 'articles', id: articleId, data: { _status: 'draft' }, overrideAccess: true })
    await indexDocument(payload, 'articles', articleId, { db, embedder })
    const { rows } = await db.query(`select 1 from ai.chunks where collection = 'articles' and doc_id = $1`, [articleId])
    expect(rows).toHaveLength(0)
  })
})

describe('Schlüssel, Verlauf und Teilen (Entscheidungen 8.4, 8.7, 8.12)', () => {
  it('speichert den Schlüssel nur verschlüsselt und gibt nach aussen nur die Kennung', async () => {
    await saveKey(db, asker, { provider: 'anthropic', model: 'claude-opus-5-5', baseUrl: null, keyEncrypted: 'v1:a:b:c', keyHint: '…abcd' })
    const key = await getKey(db, asker)
    expect(key?.keyEncrypted).toBe('v1:a:b:c')
    expect(keyInfo(key)).not.toHaveProperty('keyEncrypted')
    expect(keyInfo(key)).toMatchObject({ provider: 'anthropic', model: 'claude-opus-5-5', keyHint: '…abcd' })
    await expect(saveKey(db, asker, { provider: 'evil' as never, model: 'x', baseUrl: null, keyEncrypted: 'x', keyHint: 'x' })).rejects.toThrow()
  })

  it('hält den Verlauf, teilt Antworten nur mit Empfänger:innen und löscht auf Wunsch', async () => {
    const id = await saveQuestion(db, asker, {
      question: 'Wie funktioniert das Kugellager?',
      answer: 'Zwei Kreise [1].',
      outcome: 'answered',
      sources: [{ n: 1, collection: 'articles', docId: 1, title: 'Kugellager', path: '/k', anchor: null, label: null }],
      locale: 'de',
      provider: 'test',
      model: 'test',
      inputTokens: 100,
      outputTokens: 10,
    })
    expect((await listQuestions(db, asker)).map((q) => q.id)).toEqual([id])
    expect(await recentQuestionCount(db, asker)).toBe(1)
    expect(await getQuestionFor(db, id, colleague)).toBeNull()

    await addQuestionShare(db, { recipientId: colleague, senderId: asker, questionId: id, message: 'Schau mal' })
    expect((await getQuestionFor(db, id, colleague))?.own).toBe(false)
    expect(await getQuestionFor(db, id, stranger)).toBeNull()
    expect(await deleteQuestion(db, id, colleague)).toBe(false)

    expect(await deleteQuestion(db, id, asker)).toBe(true)
    // geteilter Hinweis verschwindet mit (Cascade)
    const { rows } = await db.query(`select 1 from hub.inbox where shared_question_id = $1`, [id])
    expect(rows).toHaveLength(0)

    await saveQuestion(db, asker, { question: 'Zweite Frage?', answer: '', outcome: 'no_source', sources: [], locale: 'de', provider: 'test', model: 'test', inputTokens: 0, outputTokens: 0 })
    expect(await deleteAllQuestions(db, asker)).toBe(1)
  })

  it('merkt sich Suchen/Fragen pro Mitglied (Entscheidung 8.8)', async () => {
    expect(await getSearchMode(db, colleague)).toBe('suchen')
    await saveSearchMode(db, colleague, 'fragen')
    expect(await getSearchMode(db, colleague)).toBe('fragen')
    await expect(saveSearchMode(db, colleague, 'alles' as never)).rejects.toThrow()
  })

  it('löscht Schlüssel und Verlauf mit dem Konto', async () => {
    await saveQuestion(db, stranger, { question: 'Weg damit?', answer: '', outcome: 'no_source', sources: [], locale: 'de', provider: 'test', model: 'test', inputTokens: 0, outputTokens: 0 })
    await saveKey(db, stranger, { provider: 'openai', model: 'x', baseUrl: null, keyEncrypted: 'v1:x', keyHint: '…x' })
    await db.query(`delete from ${member} where id = $1`, [stranger])
    expect(await getKey(db, stranger)).toBeNull()
    expect(await listQuestions(db, stranger)).toEqual([])
  })

  it('liefert die Modellliste des Admins mit Standardwerten', async () => {
    const settings = await payload.findGlobal({ slug: 'ai-settings', depth: 0 })
    expect((settings.models ?? []).map((m) => m.model)).toContain('claude-opus-5-5')
  })
})
