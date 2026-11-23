import { getTranslations, setRequestLocale } from 'next-intl/server'

import { RichText } from '@/components/content/RichText'
import { NewsTeasers } from '@/components/content/views/PageView'
import { Link } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'
import { findByPath } from '@/lib/content'

type Props = { params: Promise<{ locale: string }> }

/** Startseite: Intro mit Einstiegen, darunter News und Teaser aus dem CMS (Analyse 4). */
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Home')
  const home = isLocale(locale) ? await findByPath('/', locale) : null
  const intro = home?.collection === 'pages' ? home.doc.intro : null

  return (
    <>
      <section className="intro" aria-labelledby="home-heading">
        <h1 id="home-heading">{t('heading')}</h1>
        {intro && isLocale(locale) ? <RichText data={intro} locale={locale} className="lead" /> : <p className="lead">{t('lead')}</p>}
        <div className="cta-row">
          <Link className="button button--primary" href="/journey_der_lehre">
            {t('ctaJourney')}
          </Link>
          <Link className="button button--secondary" href="/themen">
            {t('ctaTopics')}
          </Link>
          <Link className="button button--secondary" href="/suche">
            {t('ctaSearch')}
          </Link>
        </div>
      </section>
      {isLocale(locale) && <NewsTeasers locale={locale} />}
    </>
  )
}
