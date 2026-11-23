import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { auth } from '@/auth/server'
import { AccountPanel } from '@/components/auth/AccountPanel'
import { Link, redirect } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return { title: t('accountHeading') }
}

/** „Mein Konto“ – nur angemeldet; Einstellungen zu „Mein Hub“. */
export default async function AccountPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return redirect({ href: { pathname: '/anmelden', query: { zurueck: `/${locale}/konto` } }, locale })
  const t = await getTranslations('Auth')
  const hub = await getTranslations('Hub')
  const format = await getFormatter()
  return (
    <article className="content-page" aria-labelledby="page-heading">
      <header className="page-header">
        <h1 id="page-heading">{t('accountHeading')}</h1>
        <p className="meta">
          <Link href="/mein-hub">{hub('backToHub')}</Link>
        </p>
        <p className="meta">{t('memberSince', { date: format.dateTime(new Date(session.user.createdAt), { dateStyle: 'long' }) })}</p>
      </header>
      <AccountPanel email={session.user.email} initialName={session.user.name ?? ''} />
    </article>
  )
}
