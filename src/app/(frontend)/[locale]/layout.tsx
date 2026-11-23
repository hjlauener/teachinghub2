import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { FeedbackLauncher } from '@/components/hub/FeedbackDialog'
import { PrototypeNotice } from '@/components/PrototypeNotice'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { routing } from '@/i18n/routing'

import './globals.css'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Site' })

  return {
    title: { default: t('title'), template: `%s – ${t('title')}` },
    description: t('description'),
    // Prototyp: nicht indexieren (Entscheidung 1.3a)
    robots: { index: false, follow: false },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  // Seiten immer pro Anfrage rendern: nur so erhalten die Skripte die Nonce der Content-Security-Policy
  await headers()

  const t = await getTranslations({ locale, namespace: 'Site' })

  return (
    <html lang={locale}>
      <body>
        <a className="skip-link" href="#content">
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <PrototypeNotice />
          <SiteHeader />
          <main id="content" className="site-main" tabIndex={-1}>
            <div className="container">{children}</div>
          </main>
          <SiteFooter />
          <FeedbackLauncher />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
