'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { authClient, signInWithEduid } from '@/auth/client'

/** Anmeldung per Magic Link oder Passkey (Entscheidung 6.1). */
export function SignInForm({
  linkInvalid = false,
  eduidError = null,
  eduid = false,
  returnTo,
}: {
  linkInvalid?: boolean
  /** Fehlercode nach einer abgelehnten edu-ID-Anmeldung (z. B. REGISTRATION_DOMAIN) */
  eduidError?: string | null
  eduid?: boolean
  /** Geprüfter lokaler Pfad, auf den die Anmeldung zurückführt (z. B. die Seite, auf der „Merken“ geklickt wurde). */
  returnTo: string
}) {
  const t = useTranslations('Auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const eduidMessage =
    eduidError === null ? null : eduidError.startsWith('REGISTRATION_DOMAIN') ? t('eduidDomain') : eduidError.startsWith('REGISTRATION_INVITE') ? t('eduidInvite') : t('eduidFailed')
  const [error, setError] = useState<string | null>(eduidMessage ?? (linkInvalid ? t('linkInvalid') : null))
  const errorURL = `/${locale}/anmelden?fehler=link&zurueck=${encodeURIComponent(returnTo)}`
  const eduidErrorURL = `/${locale}/anmelden?fehler=eduid&zurueck=${encodeURIComponent(returnTo)}`

  async function sendLink(event: React.FormEvent) {
    event.preventDefault()
    setState('sending')
    setError(null)
    const { error: err } = await authClient.signIn.magicLink({
      email,
      callbackURL: returnTo,
      errorCallbackURL: errorURL,
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
      window.location.assign(returnTo)
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
              const err = await signInWithEduid(returnTo, eduidErrorURL)
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
