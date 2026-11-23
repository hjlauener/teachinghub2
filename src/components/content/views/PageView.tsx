import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { findMany, listTaxonomies, relId } from '@/lib/content'
import type { Article, Media, News, Page, Taxonomy, Tool } from '@/payload-types'

import { ContactCards, PageHeader, TermChips } from '../parts'
import { localizeHref, RichText } from '../RichText'
import { Tabs } from '../Tabs'
import { ContentBlocks } from './ContentBlocks'

type LayoutBlock = NonNullable<Page['layout']>[number]

/** Übrige Seiten: Einleitung + Seiten-Bausteine (Rubrik-Tabs, Journey-Menü, Teaser, Kontakte …). */
export async function PageView({ doc, locale }: { doc: Page; locale: Locale }) {
  return (
    <article className="content-page" aria-labelledby="page-heading">
      <PageHeader title={doc.title} />
      <RichText data={doc.intro} locale={locale} className="intro-text" />
      {(doc.layout ?? []).map((block) => (
        <LayoutBlockView key={block.id} block={block} locale={locale} />
      ))}
    </article>
  )
}

async function LayoutBlockView({ block, locale }: { block: LayoutBlock; locale: Locale }) {
  switch (block.blockType) {
    case 'richText':
      return <RichText data={block.content} locale={locale} />
    case 'rubricTabs':
      return <RubricTabs rubricId={relId(block.rubric)} heading={block.heading} locale={locale} />
    case 'journeyMenu':
      return <JourneyMenu locale={locale} showThemes={block.showThemes !== false} />
    case 'teaserList':
      return <NewsTeasers locale={locale} />
    case 'contactList':
      return (
        <section aria-label={block.title ?? undefined}>
          {block.title && <h2>{block.title}</h2>}
          <ContactCards contacts={block.contacts} />
        </section>
      )
    case 'topicsOverview':
      return null
    default:
      return <ContentBlocks blocks={[block as never]} locale={locale} />
  }
}

/** Karten der Artikel und Tools eines Themas (Rubrikseiten, Suche). */
export function ArticleCards({ items }: { items: (Article | Tool)[] }) {
  return (
    <ul className="card-list">
      {items.map((item) => (
        <li key={`${item.id}-${item.path}`} className="card">
          <h3>
            <Link href={item.path}>{item.title}</Link>
          </h3>
          {item.lead && <p>{item.lead}</p>}
          <div className="card__terms">
            <TermChips terms={item.rubrics} />
            <TermChips terms={item.themes} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Rubrikseite: Tabs „Etappen“ je Thema mit automatisch gefilterten Artikelkarten (Entscheidung 7.6a). */
export async function RubricTabs({ rubricId, heading, locale }: { rubricId: number | null; heading?: string | null; locale: Locale }) {
  if (!rubricId) return null
  const t = await getTranslations('Content')
  const themes = (await listTaxonomies('thema', locale)).filter((theme) => relId(theme.parent) === rubricId)
  const [articles, tools] = await Promise.all([
    findMany('articles', locale, { where: { rubrics: { contains: rubricId } }, sort: 'title', depth: 1 }),
    findMany('tools', locale, { where: { rubrics: { contains: rubricId } }, sort: 'title', depth: 1 }),
  ])
  const all = [...articles.docs, ...tools.docs]
  const items = themes
    .map((theme) => {
      const inTheme = all.filter((doc) => (doc.themes ?? []).some((t) => relId(t) === theme.id))
      return {
        id: theme.slug,
        label: theme.name,
        content: (
          <>
            <h3 className="visually-hidden">{theme.name}</h3>
            {theme.description && <p>{theme.description}</p>}
            {inTheme.length ? <ArticleCards items={inTheme} /> : <p>{t('noArticles')}</p>}
          </>
        ),
      }
    })
    .filter((item) => item !== null)
  if (items.length === 0) return null
  return (
    <section className="rubric-tabs" aria-labelledby="rubric-tabs-heading">
      {/* Sichtbare Überschrift „Etappen“ steht bereits im übernommenen Einleitungstext der Altsite */}
      <h2 id="rubric-tabs-heading" className="visually-hidden">
        {heading || t('stages')}
      </h2>
      <Tabs items={items} label={heading || t('stages')} />
    </section>
  )
}

/** Journey der Lehre wie heute: Rubriken mit ihren Themen (Entscheidung 7.1). */
export async function JourneyMenu({ locale, showThemes = true }: { locale: Locale; showThemes?: boolean }) {
  const [rubrics, themes] = await Promise.all([listTaxonomies('rubrik', locale), listTaxonomies('thema', locale)])
  return (
    <nav className="journey-menu" aria-label="Journey der Lehre">
      <ul>
        {rubrics.map((rubric: Taxonomy) => (
          <li key={rubric.id} className="journey-menu__rubric">
            <Link href={`/journey_der_lehre/${rubric.slug}`} className="journey-menu__title">
              {rubric.name}
            </Link>
            {showThemes && (
              <ul>
                {themes
                  .filter((theme) => relId(theme.parent) === rubric.id)
                  .map((theme) => (
                    <li key={theme.id}>
                      <Link href={`/journey_der_lehre/${rubric.slug}#${theme.slug}`}>{theme.name}</Link>
                    </li>
                  ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

function newsHref(item: News, locale: Locale): string | null {
  if (item.path) return localizeHref(item.path, locale)
  const link = item.link
  if (!link || link.linkType === 'none') return null
  if (link.linkType === 'external') return link.url ?? null
  const target = link.internal?.value
  return target && typeof target === 'object' && 'path' in target ? localizeHref(String(target.path), locale) : null
}

/** News und Teaser der Startseite nach Platzierung (Fokus, News, Rahmenbedingungen). */
export async function NewsTeasers({ locale }: { locale: Locale }) {
  const t = await getTranslations('Content')
  const today = new Date().toISOString()
  const { docs } = await findMany('news', locale, {
    where: { or: [{ visibleUntil: { exists: false } }, { visibleUntil: { greater_than: today } }] },
    sort: '-date',
    depth: 2,
  })
  const groups = [
    { key: 'focus', title: t('focus') },
    { key: 'news', title: t('news') },
    { key: 'framework', title: t('framework') },
  ] as const
  return (
    <>
      {groups.map((group) => {
        const items = docs.filter((n) => (n.placement ?? 'news') === group.key)
        if (items.length === 0) return null
        return (
          <section key={group.key} className={`teasers teasers--${group.key}`} aria-labelledby={`teasers-${group.key}`}>
            <h2 id={`teasers-${group.key}`}>{group.title}</h2>
            <ul className="card-list card-list--teasers">
              {items.map((item) => {
                const href = newsHref(item, locale)
                const image = typeof item.image === 'object' ? (item.image as Media) : null
                const external = href ? /^https?:\/\//.test(href) : false
                return (
                  <li key={item.id} className="card card--teaser">
                    {image?.url && (
                      // eslint-disable-next-line @next/next/no-img-element -- Teaserbild aus der Mediathek
                      <img src={image.url} alt="" className="card__image" loading="lazy" />
                    )}
                    {item.link?.label && <p className="card__topic">{item.link.label}</p>}
                    <h3>{href ? <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{item.title}</a> : item.title}</h3>
                    {item.lead && <p>{item.lead}</p>}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </>
  )
}
