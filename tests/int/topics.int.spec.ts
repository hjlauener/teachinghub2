import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/** Redaktionsregeln der Landingpages (Konzept): ≥ 5 Journey-Seiten und 3–8 Unterthemen beim Live-Schalten. */
let payload: Payload
const run = Math.random().toString(36).slice(2, 8)
const created: { collection: 'articles' | 'topics' | 'subtopics'; id: number }[] = []
const articleIds: number[] = []
let topicId: number

const paragraph = (text: string) => ({
  root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children: [{ type: 'paragraph', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, children: [{ type: 'text', text, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }] }] },
})
const link = (n: number) => ({ title: `Link ${n}`, sentence: 'Ein Satz.', linkType: 'external' as const, url: `https://example.org/${n}` })

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  for (let i = 0; i < 5; i++) {
    const a = await payload.create({ collection: 'articles', data: { title: `Matrix ${i} ${run}`, kind: 'article', path: `/journey_der_lehre/lehre_konzipieren/x/matrix_${i}_${run}`, _status: 'published' }, overrideAccess: true })
    articleIds.push(a.id)
    created.push({ collection: 'articles', id: a.id })
  }
  const topic = await payload.create({
    collection: 'topics',
    data: {
      title: `Regeltest ${run}`,
      summary: 'Ein Satz.',
      category: 'A',
      path: `/themen/regeltest_${run}`,
      intro: paragraph('Einstieg.'),
      keyPoints: [{ text: 'Eins' }, { text: 'Zwei' }, { text: 'Drei' }],
      relatedLinks: [1, 2, 3, 4, 5].map(link),
      journeyLinks: [1, 2, 3, 4, 5].map(link),
      offerLinks: [1, 2, 3].map(link),
      externalLinks: [1, 2, 3, 4].map(link),
      journeyPages: articleIds.slice(0, 2).map((value) => ({ relationTo: 'articles' as const, value })),
      _status: 'published',
    },
    overrideAccess: true,
  })
  topicId = topic.id
  created.push({ collection: 'topics', id: topic.id })
})

afterAll(async () => {
  for (const { collection, id } of created.reverse()) await payload.delete({ collection, id, overrideAccess: true }).catch(() => undefined)
  await payload?.destroy()
})

describe('Landingpages: Live-Schalten', () => {
  it('„folgt“ ist ohne Bedingungen publizierbar und zählt die Journey-Seiten', async () => {
    const topic = await payload.findByID({ collection: 'topics', id: topicId, overrideAccess: true })
    expect(topic.pageStatus).toBe('planned')
    expect(topic.journeyPageCount).toBe(2)
  })

  it('weniger als 5 Journey-Seiten: zu dünn', async () => {
    await expect(payload.update({ collection: 'topics', id: topicId, data: { pageStatus: 'live' }, overrideAccess: true })).rejects.toThrow()
  })

  it('genug Seiten, aber weniger als 3 Unterthemen: abgelehnt', async () => {
    await payload.update({ collection: 'topics', id: topicId, data: { journeyPages: articleIds.map((value) => ({ relationTo: 'articles' as const, value })) }, overrideAccess: true })
    await expect(payload.update({ collection: 'topics', id: topicId, data: { pageStatus: 'live' }, overrideAccess: true })).rejects.toThrow()
  })

  it('mit 3 Unterthemen und 5 Seiten: live', async () => {
    for (const n of [1, 2, 3]) {
      const sub = await payload.create({ collection: 'subtopics', data: { title: `Unterthema ${n}`, topic: topicId, path: `/themen/regeltest_${run}/u${n}`, _status: 'published' }, overrideAccess: true })
      created.push({ collection: 'subtopics', id: sub.id })
    }
    const topic = await payload.update({ collection: 'topics', id: topicId, data: { pageStatus: 'live' }, overrideAccess: true })
    expect(topic.pageStatus).toBe('live')
    expect(topic.journeyPageCount).toBe(5)
  })
})
