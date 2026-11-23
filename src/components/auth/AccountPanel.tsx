'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import { authClient } from '@/auth/client'
import { useRouter } from '@/i18n/navigation'

type Passkey = { id: string; name?: string | null; createdAt: string | Date }

/** „Mein Konto“: Name, Passkeys, Abmelden, Konto löschen (Entscheidung 9.1). */
export function AccountPanel({ email, initialName }: { email: string; initialName: string }) {
  const t = useTranslations('Auth')
  const locale = useLocale()
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [message, setMessage] = useState<string | null>(null)
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [reauth, setReauth] = useState(false)

  const loadPasskeys = () =>
    authClient.passkey
      .listUserPasskeys()
      .then((result: { data?: unknown }) => setPasskeys((result.data as Passkey[] | null) ?? []))
      .catch(() => undefined)

  useEffect(() => {
    void loadPasskeys()
  }, [])

  async function saveName(event: React.FormEvent) {
    event.preventDefault()
    const { error } = await authClient.updateUser({ name })
    setMessage(error ? (error.code === 'INVALID_NAME' ? t('nameInvalid') : t('error')) : t('saved'))
  }

  async function addPasskey() {
    const result = await authClient.passkey.addPasskey({ name: `${email} – ${new Date().toLocaleDateString(locale)}` })
    if (result?.error) setMessage(result.error.message || t('error'))
    await loadPasskeys()
  }

  async function removePasskey(id: string) {
    await authClient.passkey.deletePasskey({ id })
    await loadPasskeys()
  }

  async function signInAgain() {
    await authClient.signOut()
    router.push({ pathname: '/anmelden', query: { zurueck: `/${locale}/konto` } })
  }

  async function signOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  async function deleteAccount() {
    if (!window.confirm(t('deleteConfirm'))) return
    const { error } = await authClient.deleteUser({ callbackURL: `/${locale}` })
    // Löschen verlangt eine frische Anmeldung (Better Auth: höchstens 24 h alt)
    if (error?.code === 'SESSION_EXPIRED') return setReauth(true)
    if (error) return setMessage(t('error'))
    router.push('/')
    router.refresh()
  }

  return (
    <div className="account">
      <p>{t('signedInAs', { email })}</p>

      <form onSubmit={saveName} className="filters">
        <div className="filters__field filters__field--wide">
          <label htmlFor="account-name">{t('name')}</label>
          <input id="account-name" type="text" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="submit" className="button button--primary">
          {t('save')}
        </button>
      </form>
      {message && (
        <p role="status" className="meta">
          {message}
        </p>
      )}

      <section aria-labelledby="passkeys-heading" className="content-section">
        <h2 id="passkeys-heading">{t('passkeys')}</h2>
        <p>{t('passkeysLead')}</p>
        {passkeys.length === 0 ? (
          <p className="meta">{t('noPasskeys')}</p>
        ) : (
          <ul className="contact-cards">
            {passkeys.map((p) => (
              <li key={p.id} className="contact-card">
                <p>{p.name || 'Passkey'}</p>
                <button type="button" className="button button--secondary" onClick={() => removePasskey(p.id)}>
                  {t('remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="button button--secondary" onClick={addPasskey}>
          {t('addPasskey')}
        </button>
      </section>

      <p>
        <button type="button" className="button button--secondary" onClick={signOut}>
          {t('signOut')}
        </button>
      </p>

      <section aria-labelledby="delete-heading" className="content-section">
        <h2 id="delete-heading">{t('deleteHeading')}</h2>
        <p>{t('deleteLead')}</p>
        <button type="button" className="button button--secondary" onClick={deleteAccount}>
          {t('deleteButton')}
        </button>
        {reauth && (
          <div role="alert" className="alertbox alertbox--warning">
            <p>{t('reauthToDelete')}</p>
            <button type="button" className="button button--primary" onClick={signInAgain}>
              {t('reauthButton')}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
