import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

let payload: Payload

describe('Payload-Grundgerüst (Phase 0)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    await payload?.destroy()
  })

  it('verbindet sich mit PostgreSQL und liest Benutzer', async () => {
    const users = await payload.find({ collection: 'users', limit: 1 })
    expect(users.docs).toBeInstanceOf(Array)
  })

  it('kennt die Inhaltssprachen DE (Standard), EN und FR mit Fallback', () => {
    const localization = payload.config.localization
    expect(localization).not.toBe(false)
    if (!localization) return
    expect(localization.defaultLocale).toBe('de')
    expect(localization.localeCodes).toEqual(['de', 'en', 'fr'])
    expect(localization.fallback).toBe(true)
  })
})
