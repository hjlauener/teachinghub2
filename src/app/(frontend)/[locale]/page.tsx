import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Home')

  return (
    <section className="intro" aria-labelledby="home-heading">
      <h1 id="home-heading">{t('heading')}</h1>
      <p className="lead">{t('lead')}</p>
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
  )
}
