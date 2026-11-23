import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { MethodsCompass } from '@/components/compass/MethodsCompass'
import { Breadcrumb, TranslationNotice } from '@/components/content/parts'
import { ArticleView } from '@/components/content/views/ArticleView'
import { MethodView } from '@/components/content/views/MethodView'
import { NewsView } from '@/components/content/views/NewsView'
import { PageView } from '@/components/content/views/PageView'
import { ToolView } from '@/components/content/views/ToolView'
import { ContentActions } from '@/components/hub/ContentActions'
import { SearchPage } from '@/components/search/SearchPage'
import { TopicsOverview } from '@/components/topics/TopicsOverview'
import { SubtopicView, TopicView } from '@/components/topics/TopicView'
import { mainNavigation } from '@/config/navigation'
import { hubDatabase } from '@/hub/database'
import { likeCount } from '@/hub/repo'
import { publicLikeCount } from '@/hub/rules'
import { Link } from '@/i18n/navigation'
import { isLocale, type Locale } from '@/i18n/routing'
import { type ContentDoc, findByPath, getPayloadClient, isTranslated, titleForPath } from '@/lib/content'
import { translateFields } from '@/lib/translate/machine'
import { configuredProvider } from '@/lib/translate/provider'

type Props = {
  params: Promise<{ locale: string; slug: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Felder, die maschinell übersetzt werden – nur öffentliche Inhalte. */
const MACHINE_FIELDS = ['title', 'lead', 'whatIsBehind', 'insights', 'gettingStarted', 'resources', 'faq', 'intro', 'body', 'summary', 'keyPoints', 'currentNotice', 'relatedLinks', 'journeyLinks', 'offerLinks', 'externalLinks', 'tools', 'toolsNote', 'practice']

const toPath = (slug: string[]) => `/${slug.map(decodeURIComponent).join('/')}`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}
  const found = await findByPath(toPath(slug), locale)
  if (found) {
    const seo = 'seo' in found.doc ? found.doc.seo : null
    const lead = 'lead' in found.doc ? found.doc.lead : null
    return { title: seo?.title || found.doc.title, description: seo?.description || lead || undefined }
  }
  const section = mainNavigation.find((item) => item.href === toPath(slug))
  if (!section) return {}
  const t = await getTranslations({ locale, namespace: 'Nav' })
  return { title: t(section.key) }
}

/** Breadcrumb: Titel aller Elternpfade, die es als Seite gibt. */
async function crumbs(path: string, locale: Locale) {
  const nav = await getTranslations({ locale, namespace: 'Nav' })
  const parts = path.split('/').filter(Boolean)
  const items: { href: string; label: string }[] = []
  for (let i = 1; i <= parts.length; i++) {
    const href = `/${parts.slice(0, i).join('/')}`
    // Menüseiten ohne CMS-Dokument (z. B. „Themen“) über die Navigation benennen
    const section = mainNavigation.find((item) => item.href === href)
    const label = (await titleForPath(href, locale)) ?? (section ? nav(section.key) : null)
    if (label) items.push({ href, label })
  }
  return items
}

export default async function ContentRoute({ params, searchParams }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const path = toPath(slug)

  // Seiten mit eigener Funktion
  if (path === '/methodenkompass') return <MethodsCompass locale={locale} />
  if (path === '/suche') return <SearchPage locale={locale} searchParams={await searchParams} />
  if (path === '/themen') return <TopicsOverview locale={locale} />

  const found = (await findByPath(path, locale)) as ContentDoc | null
  if (!found) {
    // Menüpunkte ohne Inhalt (z. B. „Themen“ bis Phase 3b) zeigen einen Platzhalter
    const section = mainNavigation.find((item) => item.href !== '/' && item.href === path)
    if (!section) notFound()
    const nav = await getTranslations('Nav')
    const t = await getTranslations('Placeholder')
    return (
      <section className="intro" aria-labelledby="page-heading">
        <h1 id="page-heading">{nav(section.key)}</h1>
        <p className="lead">{t('heading')}</p>
        <p>{t('text')}</p>
        <Link href="/">{t('back')}</Link>
      </section>
    )
  }

  // Übersetzung: menschlich > maschinell (falls Dienst konfiguriert) > DE mit Hinweis (Entscheidungen 4.2/4.3)
  let state: 'human' | 'machine' | 'fallback' = (await isTranslated(found.collection, found.doc.id, locale)) ? 'human' : 'fallback'
  const provider = configuredProvider()
  if (state === 'fallback' && provider && locale !== 'de') {
    try {
      const payload = await getPayloadClient()
      found.doc = await translateFields(payload, provider, found.doc as never, { collection: found.collection, id: found.doc.id }, MACHINE_FIELDS, locale)
      state = 'machine'
    } catch (error) {
      console.error('[Übersetzung]', error)
    }
  }
  const breadcrumb = await crumbs(path, locale)
  // Like-Zähler ist öffentlich, aber erst ab 3 (Entscheidung 8.1)
  const likes = publicLikeCount(
    await likeCount(hubDatabase(), { collection: found.collection, id: found.doc.id }).catch(() => 0),
  )

  return (
    <>
      <Breadcrumb items={breadcrumb} />
      <TranslationNotice state={state} />
      <ContentActions collection={found.collection} id={found.doc.id} count={likes} />
      {found.collection === 'articles' && <ArticleView doc={found.doc} locale={locale} kind="articles" />}
      {found.collection === 'methods' && <MethodView doc={found.doc} locale={locale} />}
      {found.collection === 'tools' && <ToolView doc={found.doc} locale={locale} />}
      {found.collection === 'news' && <NewsView doc={found.doc} locale={locale} />}
      {found.collection === 'pages' && <PageView doc={found.doc} locale={locale} />}
      {found.collection === 'topics' && <TopicView doc={found.doc} locale={locale} />}
      {found.collection === 'subtopics' && <SubtopicView doc={found.doc} locale={locale} />}
    </>
  )
}
