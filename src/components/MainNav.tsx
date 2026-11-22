'use client'

import { useTranslations } from 'next-intl'

import { isActive, mainNavigation } from '@/config/navigation'
import { Link, usePathname } from '@/i18n/navigation'

export function MainNav() {
  const t = useTranslations('Nav')
  const pathname = usePathname()

  return (
    <nav className="main-nav" aria-label={t('label')} id="nav-main">
      <ul>
        {mainNavigation.map((item) => (
          <li key={item.key}>
            <Link href={item.href} aria-current={isActive(item.href, pathname) ? 'page' : undefined}>
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
