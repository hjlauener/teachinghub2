import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { findMany } from '@/lib/content'
import type { Article, Method, Tool } from '@/payload-types'

import {
  ContactCards,
  ContentSection,
  hasResources,
  Insights,
  PageHeader,
  ResourcesBlock,
  type Section,
  SectionNav,
  TermChips,
} from '../parts'
import { hasContent, RichText } from '../RichText'
import { ContentBlocks } from './ContentBlocks'

type Doc = Article | Method | Tool

/**
 * Vorlage der Altsite für Artikel, Methoden und Tools (Analyse 4):
 * Wegweiser · Was steckt dahinter · Einblicke · Stolperfrei durchstarten · Ressourcen · Kontakt.
 */
export async function ArticleView({
  doc,
  locale,
  kind,
  before,
  afterResources,
}: {
  doc: Doc
  locale: Locale
  kind: 'articles' | 'methods' | 'tools'
  before?: React.ReactNode
  afterResources?: React.ReactNode
}) {
  const t = await getTranslations('Content')
  const sections: Section[] = []
  if (hasContent(doc.whatIsBehind)) sections.push({ id: 'was-steckt-dahinter', label: t('whatIsBehind') })
  if (doc.insights?.length) sections.push({ id: 'einblicke', label: t('insights') })
  if (hasContent(doc.gettingStarted)) sections.push({ id: 'stolperfrei-durchstarten', label: t('gettingStarted') })
  if (kind === 'methods' && (doc as Method).alternatives?.length) sections.push({ id: 'alternative-methoden', label: t('alternatives') })
  if (hasResources(doc.resources)) sections.push({ id: 'ressourcen', label: t('resources') })
  const contacts = (doc.contacts ?? []).filter((c) => typeof c === 'object')
  if (contacts.length) sections.push({ id: 'kontakt', label: t('contact') })

  const children =
    kind === 'tools' || kind === 'articles'
      ? await findMany(kind, locale, { where: { parent: { equals: doc.id } }, sort: 'title' })
      : null

  return (
    <article className="content-page" aria-labelledby="page-heading">
      <PageHeader title={doc.title} lead={doc.lead} />
      {'rubrics' in doc && (
        <div className="content-page__terms">
          <TermChips terms={doc.rubrics} />
          <TermChips terms={doc.themes} />
        </div>
      )}
      {before}
      <SectionNav sections={sections} />

      {hasContent(doc.whatIsBehind) && (
        <ContentSection id="was-steckt-dahinter" title={t('whatIsBehind')}>
          <RichText data={doc.whatIsBehind} locale={locale} />
        </ContentSection>
      )}
      {doc.insights && doc.insights.length > 0 && (
        <ContentSection id="einblicke" title={t('insights')}>
          <Insights items={doc.insights} locale={locale} />
        </ContentSection>
      )}
      {hasContent(doc.gettingStarted) && (
        <ContentSection id="stolperfrei-durchstarten" title={t('gettingStarted')}>
          <RichText data={doc.gettingStarted} locale={locale} />
        </ContentSection>
      )}
      {afterResources}
      {hasResources(doc.resources) && (
        <ContentSection id="ressourcen" title={t('resources')}>
          <ResourcesBlock resources={doc.resources} locale={locale} />
        </ContentSection>
      )}
      {contacts.length > 0 && (
        <ContentSection id="kontakt" title={t('contact')}>
          <ContactCards contacts={doc.contacts} />
        </ContentSection>
      )}
      <ContentBlocks blocks={doc.blocks} locale={locale} />

      {children && children.docs.length > 0 && (
        <nav className="subpages" aria-labelledby="subpages-heading">
          <h2 id="subpages-heading">{t('subpages')}</h2>
          <ul className="card-list">
            {children.docs.map((child) => (
              <li key={child.id} className="card">
                <Link href={child.path}>{child.title}</Link>
                {child.lead && <p>{child.lead}</p>}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  )
}
