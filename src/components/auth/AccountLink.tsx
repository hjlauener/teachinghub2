'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { authClient } from '@/auth/client'
import { Link } from '@/i18n/navigation'

/** Kopfbereich: „Anmelden“ bzw. „Mein Hub“ – clientseitig, damit Seiten nicht pro Person gerendert werden. */
export function AccountLink() {
  const t = useTranslations('Auth')
  const hub = useTranslations('Hub')
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <span className="account-link" aria-hidden="true" />
  return (
    <Link href={session ? '/mein-hub' : '/anmelden'} className="account-link">
      {session ? hub('nav') : t('signIn')}
    </Link>
  )
}
