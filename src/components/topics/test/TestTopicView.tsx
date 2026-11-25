/**
 * Test-Landingpage `/themen/test` (Entscheidung 7.10): eigenständige KOPIE der Kernthema-Ansicht aus
 * `../TopicView.tsx`, Inhalt aus „Digitales Prüfen“. Änderungen hier wirken sich bewusst NICHT auf die
 * anderen Themenseiten aus. Was sich bewährt, wird gezielt in `TopicView.tsx` übernommen.
 */
import { getFormatter, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import React from 'react'

import { ContentSection, PageHeader } from '@/components/content/parts'
import { localizeHref, RichText } from '@/components/content/RichText'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { findByPath, findMany } from '@/lib/content'

import { EXTERNAL_SHOWN, pickRandom } from '../pick'
import type { Article, Method, Subtopic, Taxonomy, Tool, Topic } from '@/payload-types'

type AnnotatedLink = NonNullable<Topic['relatedLinks']>[number]

function hrefOf(link: AnnotatedLink, locale: Locale): string {
  if (link.linkType === 'internal') {
    const target = link.internal?.value
    const path = target && typeof target === 'object' && 'path' in target ? String(target.path) : null
    return path ? localizeHref(path, locale) : '#'
  }
  return link.url ?? '#'
}

/** „Kommentierter Link“: Label · Linktitel · genau ein Satz (Konzept Landingpage_Kapitel.md). */
function AnnotatedLinks({ links, locale }: { links: AnnotatedLink[] | null | undefined; locale: Locale }) {
  if (!links?.length) return null
  return (
    <ul className="annotated-links">
      {links.map((link) => {
        const href = hrefOf(link, locale)
        const external = /^https?:\/\//.test(href)
        const label = link.label && typeof link.label === 'object' ? (link.label as Taxonomy).name : null
        return (
          <li key={link.id}>
            {label && <span className="chip">{label}</span>}
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="annotated-links__title">
              {link.title}
            </a>
            <span className="annotated-links__sentence">{link.sentence}</span>
          </li>
        )
      })}
    </ul>
  )
}

async function SubtopicList({ topicId, locale }: { topicId: number; locale: Locale }) {
  const t = await getTranslations('Topics')
  const { docs } = await findMany('subtopics', locale, { where: { topic: { equals: topicId } }, sort: 'order', depth: 1 })
  if (!docs.length) return null
  return (
    <ContentSection id="unterthemen" title={t('subtopics')}>
      <ul className="card-list">
        {docs.map((sub) => (
          <li key={sub.id} className="card">
            <h3>
              <Link href={sub.path}>{sub.title}</Link>
            </h3>
            {sub.summary && <p>{sub.summary}</p>}
            <MethodNames methods={sub.methods} />
          </li>
        ))}
      </ul>
    </ContentSection>
  )
}

function MethodNames({ methods }: { methods: Subtopic['methods'] }) {
  const items = (methods ?? []).map((m) => m.method).filter((m): m is Method => typeof m === 'object' && m !== null)
  if (!items.length) return null
  return (
    <ul className="chips">
      {items.map((m) => (
        <li key={m.id} className="chip">
          {m.title}
        </li>
      ))}
    </ul>
  )
}

/** Kopie der Kernthema-Ansicht (Stand 25.11.2026) – hier dürfen neue Ideen ausprobiert werden. */
async function TestTopicBody({ doc, locale }: { doc: Topic; locale: Locale }) {
  const t = await getTranslations('Topics')
  const format = await getFormatter()
  const live = doc.pageStatus === 'live'

  if (!live) {
    const pages = (doc.journeyPages ?? []).map((r) => r.value).filter((v): v is Article | Tool => typeof v === 'object' && v !== null)
    return (
      <article className="content-page" aria-labelledby="page-heading">
        <PageHeader title={doc.title} lead={doc.summary} />
        <p className="translation-notice" role="note">
          {t('planned')}
        </p>
        <SubtopicList topicId={doc.id} locale={locale} />
        {pages.length > 0 && (
          <ContentSection id="journey" title={t('journeyPages')}>
            <ul>
              {pages.map((p) => (
                <li key={p.id}>
                  <Link href={p.path}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </ContentSection>
        )}
      </article>
    )
  }

  return (
    <article className="content-page topic-page" aria-labelledby="page-heading">
      <PageHeader title={doc.title} />
      <RichText data={doc.intro} locale={locale} className="lead" />
      {doc.currentNotice && (
        <p className="callout">
          <span className="chip">{t('current')}</span> {doc.currentNotice}
        </p>
      )}
      {doc.keyPoints?.length ? (
        <ContentSection id="auf-einen-blick" title={t('glance')}>
          <ul className="glance">
            {doc.keyPoints.map((k) => (
              <li key={k.id}>{k.text}</li>
            ))}
          </ul>
        </ContentSection>
      ) : null}
      {doc.relatedLinks?.length ? (
        <ContentSection id="passend-zum-thema" title={t('related')}>
          <AnnotatedLinks links={doc.relatedLinks} locale={locale} />
        </ContentSection>
      ) : null}
      {doc.tools?.length ? (
        <ContentSection id="tools" title={t('tools')}>
          <div className="table-scroll" tabIndex={0} role="region" aria-label={t('tools')}>
            <table className="compass-table">
              <thead>
                <tr>
                  <th scope="col">{t('tool')}</th>
                  <th scope="col">{t('purpose')}</th>
                  <th scope="col">{t('audience')}</th>
                </tr>
              </thead>
              <tbody>
                {doc.tools.map((tool) => {
                  const page = tool.tool && typeof tool.tool === 'object' ? tool.tool : null
                  return (
                    <tr key={tool.id}>
                      <th scope="row">{page ? <Link href={page.path}>{tool.name}</Link> : tool.name}</th>
                      <td>{tool.purpose}</td>
                      <td>{tool.audience}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {doc.toolsNote && <p>{doc.toolsNote}</p>}
          {doc.toolsAsOf && (
            <p className="meta">
              {t('asOf')}: {format.dateTime(new Date(doc.toolsAsOf), { dateStyle: 'medium' })}
            </p>
          )}
        </ContentSection>
      ) : null}
      {doc.journeyLinks?.length ? (
        <ContentSection id="entlang-der-journey" title={t('journey')}>
          <AnnotatedLinks links={doc.journeyLinks} locale={locale} />
        </ContentSection>
      ) : null}
      {doc.practice?.length ? (
        <ContentSection id="aus-der-praxis" title={t('practice')}>
          <ul className="card-list">
            {doc.practice.map((c) => (
              <li key={c.id} className="card">
                <h3>{c.url ? <a href={localizeHref(c.url, locale)}>{c.title}</a> : c.title}</h3>
                {c.context && <p className="card__topic">{c.context}</p>}
                {c.text && <p>{c.text}</p>}
              </li>
            ))}
          </ul>
        </ContentSection>
      ) : null}
      {doc.offerLinks?.length ? (
        <ContentSection id="angebote" title={t('offers')}>
          <AnnotatedLinks links={doc.offerLinks} locale={locale} />
        </ContentSection>
      ) : null}
      {doc.externalLinks?.length ? (
        <ContentSection id="andere-hochschulen" title={t('external')}>
          <AnnotatedLinks links={pickRandom(doc.externalLinks, EXTERNAL_SHOWN)} locale={locale} />
        </ContentSection>
      ) : null}
      <SubtopicList topicId={doc.id} locale={locale} />
    </article>
  )
}

/** Pfad der Test-Landingpage und des Kernthemas, dessen Inhalt sie zeigt. */
export const TEST_TOPIC_PATH = '/themen/test'
export const TEST_SOURCE_PATH = '/themen/digitales_pruefen'

export async function TestTopicPage({ locale }: { locale: Locale }) {
  const t = await getTranslations('TopicTest')
  const found = await findByPath(TEST_SOURCE_PATH, locale)
  if (!found || found.collection !== 'topics') notFound()
  const doc = { ...(found.doc as Topic), title: `${t('prefix')}: ${found.doc.title}` }
  return (
    <>
      <p className="translation-notice" role="note">
        {t('notice')}
      </p>
      <TestTopicBody doc={doc} locale={locale} />
    </>
  )
}
