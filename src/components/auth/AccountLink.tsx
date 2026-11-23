'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { authClient } from '@/auth/client'
import { Link } from '@/i18n/navigation'

/** Kopfbereich: „Anmelden“ bzw. „Mein Konto“ – clientseitig, damit Seiten nicht pro Person gerendert werden. */
export function AccountLink() {
  const t = useTranslations('Auth')
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <span className="account-link" aria-hidden="true" />
  return (
    <Link href={session ? '/konto' : '/anmelden'} className="account-link">
      {session ? t('account') : t('signIn')}
    </Link>
  )
}
