'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

/** Sprachwahl DE/EN/FR – behält den aktuellen Pfad bei (Entscheidung 7.2). */
export function LanguageSwitcher() {
  const t = useTranslations('Language')
  const current = useLocale()
  const pathname = usePathname()

  return (
    <nav className="lang-switch" aria-label={t('label')} id="nav-lang">
      <ul>
        {locales.map((locale) => (
          <li key={locale}>
            {locale === current ? (
              <span aria-current="true" lang={locale} title={t(locale)}>
                {locale}
              </span>
            ) : (
              <Link href={pathname} locale={locale} lang={locale} hrefLang={locale} title={t(locale)}>
                <span aria-hidden="true">{locale}</span>
                <span className="visually-hidden">{t(locale)}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
