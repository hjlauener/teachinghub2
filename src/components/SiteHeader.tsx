import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

import { externalLinks } from '@/config/navigation'
import { Link } from '@/i18n/navigation'

import { AccountLink } from './auth/AccountLink'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MainNav } from './MainNav'

export async function SiteHeader() {
  const t = await getTranslations('Site')

  return (
    <header className="site-header">
      <div className="container site-header__top">
        <div className="site-header__brand">
          <a href={externalLinks.portal}>
            <Image
              className="site-logo"
              src="/brand/logo_unibern@2x.png"
              alt={t('logoAlt')}
              width={180}
              height={138}
              priority
            />
          </a>
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
