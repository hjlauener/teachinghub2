import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { auth, isEduidConfigured } from '@/auth/server'
import { SignInForm } from '@/components/auth/SignInForm'
import { safeReturnPath } from '@/hub/rules'

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ fehler?: string; zurueck?: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return { title: t('signInHeading') }
}

/** Anmelden mit Magic Link oder Passkey (Entscheidung 6.1). */
export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const query = await searchParams
  const returnTo = safeReturnPath(query.zurueck, locale)
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(returnTo) // bereits geprüft: lokaler Pfad mit Sprachpräfix
  const t = await getTranslations('Auth')
  return (
    <article className="content-page" aria-labelledby="page-heading">
      <header className="page-header">
        <h1 id="page-heading">{t('signInHeading')}</h1>
        <p className="lead">{t('signInLead')}</p>
      </header>
      <SignInForm linkInvalid={query.fehler === 'link'} eduid={isEduidConfigured()} returnTo={returnTo} />
    </article>
  )
}
