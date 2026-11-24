import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsTeasers } from '@/components/content/views/PageView'
import { Link } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string }> }

// Inhalte kommen aus dem CMS: bei jedem Aufruf rendern, nicht beim Build (kein Datenbankzugriff im Build)
export const dynamic = 'force-dynamic'

/** Startseite: Titel, Einstiege zu Kursen und Fachveranstaltungen des VRL, darunter News und Teaser aus dem CMS. */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Home')

  return (
    <>
      <section className="intro" aria-labelledby="home-heading">
        <h1 id="home-heading">{t('heading')}</h1>
        {/* Einstiege zu den Angeboten des VRL (Entscheidung 1.3b); Journey, Themen und Suche sind im Hauptmenü */}
        <ul className="arrow-links">
          <li>
            <Link href="/journey_der_lehre/lehrimpulse__unibe#kurse">{t('vrlCourses')}</Link>
          </li>
          <li>
            <Link href="/journey_der_lehre/lehrimpulse__unibe#fachveranstaltungen">{t('vrlEvents')}</Link>
          </li>
        </ul>
      </section>
      {isLocale(locale) && <NewsTeasers locale={locale} />}
    </>
  )
}
