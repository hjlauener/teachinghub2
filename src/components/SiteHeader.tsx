import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { AccountLink } from './auth/AccountLink'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MainNav } from './MainNav'

export async function SiteHeader() {
  const t = await getTranslations('Site')

  return (
    <header className="site-header">
      <div className="container site-header__top">
        {/* Nur der Schriftzug, ohne UniBE-Logo (Entscheidung 1.3b) */}
        <div className="site-header__brand">
          <Link href="/" className="site-title">
            {t('title')}
          </Link>
        </div>
        <div className="site-header__tools">
          <AccountLink />
          <LanguageSwitcher />
        </div>
      </div>
      <div className="container">
        <MainNav />
      </div>
    </header>
  )
}
