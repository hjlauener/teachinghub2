import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { findMany, listTaxonomies } from '@/lib/content'

import { buildMatrix, MATRIX_PHASES } from '@/topics/matrix'

import { TEST_TOPIC_PATH } from './test/TestTopicView'
import { TopicsViews } from './TopicsViews'

/** Übersicht „Themen der Lehre“: Ansichten Nach Thema / Themen × Journey (Entscheidungen 7.4–7.6). */
export async function TopicsOverview({ locale }: { locale: Locale }) {
  const t = await getTranslations('Topics')
  const tt = await getTranslations('TopicTest')
  const [{ docs: topics }, rubrics] = await Promise.all([
    findMany('topics', locale, { sort: 'order', depth: 1, where: { category: { in: ['A', 'B'] } } }),
    listTaxonomies('rubrik', locale),
  ])
  const phases = MATRIX_PHASES.map((slug) => rubrics.find((r) => r.slug === slug)?.name ?? slug)
  const groups = (['A', 'B'] as const).map((category) => ({
    category,
    title: category === 'A' ? t('groupA') : t('groupB'),
    topics: topics
      .filter((topic) => topic.category === category)
      .map((topic) => ({ id: topic.id, title: topic.title, summary: topic.summary, path: topic.path, live: topic.pageStatus === 'live' })),
  }))

  return (
    <article className="content-page" aria-labelledby="page-heading">
      <header className="page-header">
        <h1 id="page-heading">{t('heading')}</h1>
        <p className="lead">{t('intro')}</p>
      </header>
      <TopicsViews groups={groups} matrix={buildMatrix(topics)} phases={phases} />
      <section className="test-topic" aria-labelledby="test-topic-heading">
        <h2 id="test-topic-heading">{tt('listHeading')}</h2>
        <p>
          <Link href={TEST_TOPIC_PATH}>{tt('listLink')}</Link> – {tt('listText')}
        </p>
      </section>
    </article>
  )
}
