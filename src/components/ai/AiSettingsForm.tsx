'use client'

import { useTranslations } from 'next-intl'
import React, { useId, useState } from 'react'

type Provider = 'anthropic' | 'openai' | 'compatible' | 'test'
type KeyInfo = { provider: Provider; model: string; baseUrl: string | null; keyHint: string } | null
type ModelOption = { provider: string; model: string; label: string }

/**
 * KI-Einstellungen in „Mein Hub“ (Entscheidung 8.4): Anbieter, Modell, eigener Schlüssel.
 * Der Schlüssel wird nach dem Speichern nie mehr angezeigt, nur die letzten vier Zeichen.
 */
export function AiSettingsForm({ initialKey, models, testProvider }: { initialKey: KeyInfo; models: ModelOption[]; testProvider: boolean }) {
  const t = useTranslations('AiSettings')
  const id = useId()
  const [key, setKey] = useState<KeyInfo>(initialKey)
  const [provider, setProvider] = useState<Provider>(initialKey?.provider ?? 'anthropic')
  const listed = models.filter((m) => m.provider === provider)
  const [model, setModel] = useState(initialKey?.model ?? listed[0]?.model ?? '')
  const [baseUrl, setBaseUrl] = useState(initialKey?.baseUrl ?? '')
  const [apiKey, setApiKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  function changeProvider(next: Provider) {
    setProvider(next)
    const first = models.find((m) => m.provider === next)
    setModel(next === key?.provider ? key.model : (first?.model ?? ''))
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setStatus(null)
    const response = await fetch('/api/hub/ai/key', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, model, baseUrl: provider === 'compatible' ? baseUrl : undefined, apiKey }),
    }).catch(() => null)
    setBusy(false)
    const data = (await response?.json().catch(() => ({}))) as { key?: KeyInfo; error?: string; code?: string } | undefined
    if (!response?.ok || !data?.key) {
      const code = data?.error === 'verify' ? `verify_${data.code ?? 'other'}` : (data?.error ?? 'other')
      return setStatus({ ok: false, text: t.has(`error_${code}`) ? t(`error_${code}`) : t('error_other') })
    }
    setKey(data.key)
    setApiKey('')
    setStatus({ ok: true, text: t('saved') })
  }

  async function remove() {
    if (!window.confirm(t('deleteConfirm'))) return
    const response = await fetch('/api/hub/ai/key', { method: 'DELETE', credentials: 'same-origin' }).catch(() => null)
    if (!response?.ok) return setStatus({ ok: false, text: t('error_other') })
    setKey(null)
    setStatus({ ok: true, text: t('deleted') })
  }

  const providers: Provider[] = ['anthropic', 'openai', 'compatible', ...(testProvider ? (['test'] as const) : [])]
  return (
    <div className="ai-settings">
      {key ? (
        <p>
          {t('current', { provider: t(`provider_${key.provider}`), model: key.model, hint: key.keyHint })}
        </p>
      ) : (
        <p>{t('none')}</p>
      )}
      <p className="meta">{t('lead')}</p>
      <form className="stack-form" onSubmit={save}>
        <label htmlFor={`${id}-provider`}>{t('provider')}</label>
        <select id={`${id}-provider`} value={provider} onChange={(e) => changeProvider(e.target.value as Provider)}>
          {providers.map((p) => (
            <option key={p} value={p}>
              {t(`provider_${p}`)}
            </option>
          ))}
        </select>
        <label htmlFor={`${id}-model`}>{t('model')}</label>
        {listed.length ? (
          <select id={`${id}-model`} value={model} onChange={(e) => setModel(e.target.value)}>
            {listed.map((m) => (
              <option key={m.model} value={m.model}>
                {m.label}
              </option>
            ))}
          </select>
        ) : (
          <input id={`${id}-model`} type="text" required maxLength={100} value={model} onChange={(e) => setModel(e.target.value)} placeholder={t('modelPlaceholder')} />
        )}
        {provider === 'compatible' && (
          <>
            <label htmlFor={`${id}-base`}>{t('baseUrl')}</label>
            <input id={`${id}-base`} type="url" required value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.example.ch/v1" aria-describedby={`${id}-base-hint`} />
            <span id={`${id}-base-hint`} className="meta">
              {t('baseUrlHint')}
            </span>
          </>
        )}
        <label htmlFor={`${id}-key`}>{key && key.provider === provider ? t('apiKeyNew') : t('apiKey')}</label>
        <input
          id={`${id}-key`}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={apiKey}
          required={!key || key.provider !== provider}
          onChange={(e) => setApiKey(e.target.value)}
          aria-describedby={`${id}-key-hint`}
        />
        <span id={`${id}-key-hint`} className="meta">
          {t(`keyHelp_${provider}`)}
        </span>
        <div className="hub-item__actions">
          <button type="submit" className="button button--primary" disabled={busy}>
            {busy ? t('checking') : t('save')}
          </button>
          {key && (
            <button type="button" className="button button--secondary" onClick={remove}>
              {t('delete')}
            </button>
          )}
          {status && (
            <span role={status.ok ? 'status' : 'alert'} className="meta">
              {status.text}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
