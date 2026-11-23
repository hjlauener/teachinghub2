import { betterAuth } from 'better-auth'
import { afterAll, describe, expect, it } from 'vitest'

import { authDatabase, AUTH_TABLES } from '@/auth/database'
import { authOptions } from '@/auth/options'
import { MAGIC_LINKS_PER_EMAIL } from '@/auth/rules'

/**
 * Review Sicherheit: höchstens MAGIC_LINKS_PER_EMAIL Anmeldelinks pro Adresse im Zeitfenster,
 * unabhängig von der (fälschbaren) IP-Adresse.
 */
const email = `quota-${Date.now()}@unibe.ch`
const auth = betterAuth(authOptions)
const previous = process.env.AUTH_RATE_LIMIT

afterAll(async () => {
  process.env.AUTH_RATE_LIMIT = previous
  await authDatabase().query(`delete from ${AUTH_TABLES.verification} where position($1 in value) > 0`, [email])
})

describe('Anmeldelinks pro Adresse begrenzt', () => {
  it('lehnt den Link über dem Limit ab, auch mit wechselnder IP', async () => {
    process.env.AUTH_RATE_LIMIT = 'on'
    for (let i = 0; i < MAGIC_LINKS_PER_EMAIL; i++) {
      const headers = new Headers({ 'x-forwarded-for': `203.0.113.${i + 1}` })
      await expect(auth.api.signInMagicLink({ body: { email, callbackURL: '/de' }, headers })).resolves.toMatchObject({ status: true })
    }
    const headers = new Headers({ 'x-forwarded-for': '198.51.100.7' })
    await expect(auth.api.signInMagicLink({ body: { email: email.toUpperCase(), callbackURL: '/fr' }, headers })).rejects.toMatchObject({
      body: { code: 'TOO_MANY_LINKS' },
    })
  })
})
