import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { mainNavigation } from '@/config/navigation'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string; slug: string[] }> }

/**
 * Phase 0: Platzhalter für die Bereiche der Hauptnavigation, damit keine Menülinks ins Leere führen.
 * Ab Phase 3 werden hier die migrierten Seiten aus dem CMS ausgeliefert.
 */
function findSection(slug: string[]) {
  const path = `/${slug.join('/')}`
  return mainNavigation.find(
    (item) => item.href !== '/' && (path === item.href || path.startsWith(`${item.href}/`)),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const section = findSection(slug)
  if (!section) return {}
  const t = await getTranslations({ locale, namespace: 'Nav' })
  return { title: t(section.key) }
}

export default async function PlaceholderPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const section = findSection(slug)
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
