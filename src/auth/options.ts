import { passkey } from '@better-auth/passkey'
import config from '@payload-config'
import type { BetterAuthOptions } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { genericOAuth, magicLink } from 'better-auth/plugins'
import { getPayload } from 'payload'

import { deleteMemberData } from '../hub/payload-data'

import { authDatabase, AUTH_TABLES } from './database'
import { magicLinkEmail } from './email'
import { DEFAULT_SETTINGS, mayRegister, normalizeEmail, REASON_MESSAGES, type RegistrationSettings } from './rules'

/**
 * Konfiguration der Mitgliederkonten (ohne `server-only`, damit auch CLI-Skripte sie laden können).
 * Mitgliederkonten der Website (Entscheidungen 2.1, 2.2, 6.1, 6.2) – getrennt von den CMS-Benutzer:innen.
 * Login per Magic Link (15 Minuten, einmalig) und optional Passkey; keine Passwörter.
 * edu-ID (OIDC) ist vorbereitet und wird nur mit EDUID_* aktiviert (Phase 7).
 */
const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'
type Locale = 'de' | 'en' | 'fr'

async function registrationSettings(): Promise<{ settings: RegistrationSettings; isInvited: (email: string) => Promise<boolean> }> {
  const payload = await getPayload({ config })
  const global = await payload.findGlobal({ slug: 'member-settings', overrideAccess: true }).catch(() => null)
  const settings: RegistrationSettings = {
    mode: (global?.registrationMode as RegistrationSettings['mode']) ?? DEFAULT_SETTINGS.mode,
    domains: global?.allowedDomains?.length ? global.allowedDomains.map((d) => d.domain) : DEFAULT_SETTINGS.domains,
  }
  return {
    settings,
    isInvited: async (email) =>
      (await payload.count({ collection: 'member-invites', where: { email: { equals: normalizeEmail(email) } }, overrideAccess: true })).totalDocs > 0,
  }
}

export function localeFromUrl(url: string | undefined | null): Locale {
  const match = (url ?? '').match(/\/(de|en|fr)(\/|$|\?)/)
  return (match?.[1] as Locale) ?? 'de'
}

/** Prüft eine Registrierung; wirft einen verständlichen Fehler, wenn sie nicht zugelassen ist. */
async function assertMayRegister(email: string, locale: Locale) {
  const { settings, isInvited } = await registrationSettings()
  const decision = mayRegister(email, settings, await isInvited(email))
  if (!decision.allowed) throw new APIError('FORBIDDEN', { message: REASON_MESSAGES[decision.reason][locale], code: `REGISTRATION_${decision.reason.toUpperCase()}` })
}

const eduidConfigured = Boolean(process.env.EDUID_DISCOVERY_URL && process.env.EDUID_CLIENT_ID && process.env.EDUID_CLIENT_SECRET)

export const authOptions = {
  appName: 'TeachingHub2',
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: authDatabase(),
  trustedOrigins: [baseURL, ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(',').filter(Boolean)],
  user: {
    modelName: AUTH_TABLES.user,
    deleteUser: {
      enabled: true,
      // Hub-Tabellen löschen sich per Cascade; Feedback (inkl. Bilder) löschen, Vorschläge anonymisieren (Phase 5)
      afterDelete: async (user) => {
        const payload = await getPayload({ config })
        await deleteMemberData(payload, user.id)
      },
    },
  },
  session: { modelName: AUTH_TABLES.session },
  account: { modelName: AUTH_TABLES.account, accountLinking: { enabled: true, trustedProviders: ['eduid'] } },
  verification: { modelName: AUTH_TABLES.verification },
  // Schutz vor Missbrauch (Entscheidung 9.1)
  rateLimit: {
    // Nur im Produktionsbetrieb (Standard von Better Auth); AUTH_RATE_LIMIT=off z. B. für E2E-Läufe
    enabled: process.env.NODE_ENV === 'production' && process.env.AUTH_RATE_LIMIT !== 'off',
    window: 60,
    max: 60,
    customRules: { '/sign-in/magic-link': { window: 300, max: 5 } },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-in/magic-link') return
      const email = normalizeEmail(String(ctx.body?.email ?? ''))
      const existing = await ctx.context.internalAdapter.findUserByEmail(email)
      if (!existing) await assertMayRegister(email, localeFromUrl(ctx.body?.callbackURL))
    }),
  },
  databaseHooks: {
    user: {
      create: {
        // Zweite Absicherung, unabhängig vom Anmeldeweg
        before: async (user) => {
          await assertMayRegister(user.email, 'de')
          return { data: { ...user, email: normalizeEmail(user.email) } }
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 15 * 60,
      sendMagicLink: async ({ email, url }) => {
        const payload = await getPayload({ config })
        await payload.sendEmail({ to: email, ...magicLinkEmail(url, localeFromUrl(url)) })
      },
    }),
    passkey({
      rpID: new URL(baseURL).hostname,
      rpName: 'Teaching Hub (Prototyp)',
      origin: baseURL,
      schema: { passkey: { modelName: AUTH_TABLES.passkey } },
    }),
    ...(eduidConfigured
      ? [
          genericOAuth({
            config: [
              {
                providerId: 'eduid',
                discoveryUrl: process.env.EDUID_DISCOVERY_URL as string,
                clientId: process.env.EDUID_CLIENT_ID as string,
                clientSecret: process.env.EDUID_CLIENT_SECRET as string,
                scopes: ['openid', 'email', 'profile'],
                pkce: true,
              },
            ],
          }),
        ]
      : []),
    nextCookies(),
  ],
} satisfies BetterAuthOptions

export const isEduidConfigured = () => eduidConfigured
