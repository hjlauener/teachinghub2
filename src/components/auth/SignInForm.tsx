'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { authClient, signInWithEduid } from '@/auth/client'
import { useRouter } from '@/i18n/navigation'

/** Anmeldung per Magic Link oder Passkey (Entscheidung 6.1). */
export function SignInForm({ linkInvalid = false, eduid = false }: { linkInvalid?: boolean; eduid?: boolean }) {
  const t = useTranslations('Auth')
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(linkInvalid ? t('linkInvalid') : null)

  async function sendLink(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    setError(null)
    const { error: err } = await authClient.signIn.magicLink({
      email,
      callbackURL: `/${locale}/konto`,
      errorCallbackURL: `/${locale}/anmelden?fehler=link`,
    })
    if (err) {
      setState('idle')
      setError(err.status === 429 ? t('tooMany') : err.message || t('error'))
      return
    }
    setState('sent')
  }

  async function signInWithPasskey() {
    setError(null)
    const result = await authClient.signIn.passkey()
    if (result?.error) setError(result.error.message || t('error'))
    else {
      router.push('/konto')
      router.refresh()
    }
  }

  return (
    <div className="auth-form">
      {state === 'sent' ? (
        <p className="alertbox alertbox--success" role="status">
          {t('sent', { email })}
        </p>
      ) : (
        <form onSubmit={sendLink} className="filters" noValidate={false}>
          <div className="filters__field filters__field--wide">
            <label htmlFor="signin-email">{t('email')}</label>
            <input
              id="signin-email"
              type="email"
              name="email"
              autoComplete="email webauthn"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? 'signin-error' : undefined}
            />
          </div>
          <button type="submit" className="button button--primary" disabled={state === 'sending'}>
            {state === 'sending' ? t('sending') : t('sendLink')}
          </button>
        </form>
      )}
      {error && (
        <p id="signin-error" className="alertbox alertbox--warning" role="alert">
          {error}
        </p>
      )}
      {eduid && (
        <p className="auth-form__passkey">
          <button
            type="button"
            className="button button--primary"
            onClick={async () => {
              const err = await signInWithEduid(`/${locale}/konto`, `/${locale}/anmelden?fehler=link`)
              if (err) setError(t('error'))
            }}
          >
            {t('eduid')}
          </button>
        </p>
      )}
      <p className="auth-form__passkey">
        <span>{t('orPasskey')}</span>
        <button type="button" className="button button--secondary" onClick={signInWithPasskey}>
          {t('passkeySignIn')}
        </button>
      </p>
    </div>
  )
}
