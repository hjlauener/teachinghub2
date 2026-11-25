import { getTranslations, setRequestLocale } from 'next-intl/server'

import { NewsTeasers } from '@/components/content/views/PageView'
import { TEST_TOPIC_PATH } from '@/components/topics/test/TestTopicView'
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
  const tt = await getTranslations('TopicTest')

  return (
    <>
      <section className="intro home-intro" aria-labelledby="home-heading">
        <h1 id="home-heading">{t('heading')}</h1>
        {/* Einstiege zu den Angeboten des VRL als eigener Bereich rechts (Entscheidung 1.3b) */}
        <ul className="arrow-links home-intro__aside" aria-label={t('vrlLabel')}>
          <li>
            <Link href="/journey_der_lehre/lehrimpulse__unibe#kurse">{t('vrlCourses')}</Link>
          </li>
          <li>
            <Link href="/journey_der_lehre/lehrimpulse__unibe#fachveranstaltungen">{t('vrlEvents')}</Link>
          </li>
        </ul>
      </section>
      {/* Zugang zur Test-Landingpage (Entscheidung 7.10) */}
      <p className="meta home-test-link">
        <Link href={TEST_TOPIC_PATH}>{tt('homeLink')}</Link>
      </p>
      {isLocale(locale) && <NewsTeasers locale={locale} />}
    </>
  )
}
