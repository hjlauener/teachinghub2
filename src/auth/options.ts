import { passkey } from '@better-auth/passkey'
import config from '@payload-config'
import type { BetterAuthOptions } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { genericOAuth, magicLink } from 'better-auth/plugins'
import { getPayload } from 'payload'

import { deleteMemberData } from '../hub/payload-data'
import { savePreferences } from '../hub/repo-collections'

import { authDatabase, AUTH_TABLES } from './database'
import { nameFromProfile } from './eduid'
import { magicLinkEmail } from './email'
import {
  DEFAULT_SETTINGS,
  ipAddressHeaders,
  localeFromMagicLink,
  localeFromPath,
  MAGIC_LINK_WINDOW_MINUTES,
  MAGIC_LINKS_PER_EMAIL,
  mayRegister,
  NAME_MAX,
  normalizeEmail,
  normalizeName,
  REASON_MESSAGES,
  type RegistrationSettings,
} from './rules'

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

/** Prüft eine Registrierung; wirft einen verständlichen Fehler, wenn sie nicht zugelassen ist. */
async function assertMayRegister(email: string, locale: Locale) {
  const { settings, isInvited } = await registrationSettings()
  const decision = mayRegister(email, settings, await isInvited(email))
  if (!decision.allowed) throw new APIError('FORBIDDEN', { message: REASON_MESSAGES[decision.reason][locale], code: `REGISTRATION_${decision.reason.toUpperCase()}` })
}

const TOO_MANY_LINKS = {
  de: 'Für diese Adresse wurden gerade mehrere Anmeldelinks verschickt. Bitte prüfen Sie Ihr Postfach oder versuchen Sie es später erneut.',
  en: 'Several sign-in links were just sent to this address. Please check your inbox or try again later.',
  fr: 'Plusieurs liens de connexion viennent d’être envoyés à cette adresse. Consultez votre boîte ou réessayez plus tard.',
}

/**
 * Höchstens MAGIC_LINKS_PER_EMAIL offene Anmeldelinks pro Adresse im Zeitfenster (Schutz vor Mail-Bombing,
 * unabhängig von der fälschbaren IP-Adresse). AUTH_RATE_LIMIT=off schaltet es für Testläufe ab.
 */
// Ohne JSON-Cast: andere Einträge der Tabelle (z. B. Passkey-Challenges) müssen kein JSON sein
async function assertMagicLinkQuota(email: string, locale: Locale) {
  if (process.env.AUTH_RATE_LIMIT === 'off') return
  const { rows } = await authDatabase().query<{ n: string }>(
    `select count(*) as n from ${AUTH_TABLES.verification}
     where position('"type":"magic-link"' in value) > 0 and position(('"email":"' || $1 || '"') in lower(value)) > 0
       and "createdAt" > now() - make_interval(mins => $2)`,
    [email, MAGIC_LINK_WINDOW_MINUTES],
  )
  if (Number(rows[0]?.n ?? 0) >= MAGIC_LINKS_PER_EMAIL) throw new APIError('TOO_MANY_REQUESTS', { message: TOO_MANY_LINKS[locale], code: 'TOO_MANY_LINKS' })
}

function checkedName(value: unknown): string {
  const name = normalizeName(value)
  if (name === null) throw new APIError('BAD_REQUEST', { message: `Name: höchstens ${NAME_MAX} Zeichen, eine Zeile.`, code: 'INVALID_NAME' })
  return name
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
        // Das Konto ist bereits gelöscht: Fehler nur protokollieren, sonst meldet die UI fälschlich einen Fehlschlag
        try {
          const payload = await getPayload({ config })
          await deleteMemberData(payload, user.id)
        } catch (error) {
          console.error('[Konto löschen] Feedback/Vorschläge nicht bereinigt für', user.id, error)
        }
      },
    },
  },
  session: { modelName: AUTH_TABLES.session },
  // edu-ID mit bestehendem Konto gleicher E-Mail automatisch verknüpfen (6.2); im Konto auch bewusst verknüpfbar,
  // dann darf die edu-ID-Adresse abweichen (die Person ist bereits angemeldet)
  account: { modelName: AUTH_TABLES.account, accountLinking: { enabled: true, trustedProviders: ['eduid'], allowDifferentEmails: true } },
  verification: { modelName: AUTH_TABLES.verification },
  // Schutz vor Missbrauch (Entscheidung 9.1)
  // Client-IP nur aus dem Header, den der Proxy des Hosters setzt (z. B. AUTH_IP_HEADERS=x-real-ip);
  // ohne solchen Proxy ist die IP fälschbar – deshalb zusätzlich das Limit pro Adresse (assertMagicLinkQuota)
  advanced: { ipAddress: { ipAddressHeaders: ipAddressHeaders(process.env.AUTH_IP_HEADERS) } },
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
      await assertMagicLinkQuota(email, localeFromPath(ctx.body?.callbackURL))
      const existing = await ctx.context.internalAdapter.findUserByEmail(email)
      if (!existing) await assertMayRegister(email, localeFromPath(ctx.body?.callbackURL))
    }),
  },
  databaseHooks: {
    user: {
      create: {
        // Zweite Absicherung, unabhängig vom Anmeldeweg (Magic Link, Passkey, edu-ID): nur zugelassene Adressen (6.3)
        before: async (user) => {
          await assertMayRegister(user.email, 'de')
          return { data: { ...user, email: normalizeEmail(user.email), name: checkedName(user.name) } }
        },
        // Sprache für Mails (z. B. „… hat etwas mit Ihnen geteilt“) = Sprache der Seite bei der Registrierung;
        // änderbar in „Mein Hub“ (statt bei jedem Seitenaufruf zu speichern)
        after: async (user, ctx) => {
          // Magic Link: Konto entsteht beim Einlösen (GET, callbackURL in der Query); sonst im Body
          const source = ctx as { query?: { callbackURL?: string }; body?: { callbackURL?: string } } | null | undefined
          const locale = localeFromPath(source?.query?.callbackURL ?? source?.body?.callbackURL)
          await savePreferences(authDatabase(), user.id, { locale }).catch(() => null)
        },
      },
      update: {
        // Name erscheint in Mails, Suche und Sammlungen: nur einzeiliger Text bis NAME_MAX Zeichen
        before: async (data) => (data.name === undefined ? { data } : { data: { ...data, name: checkedName(data.name) } }),
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 15 * 60,
      sendMagicLink: async ({ email, url }) => {
        const payload = await getPayload({ config })
        await payload.sendEmail({ to: email, ...magicLinkEmail(url, localeFromMagicLink(url)) })
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
                // Echte edu-ID: zusätzliche Scopes per EDUID_SCOPES
                scopes: (process.env.EDUID_SCOPES ?? 'openid email profile').split(/\s+/).filter(Boolean),
                pkce: true,
                mapProfileToUser: (profile) => ({
                  name: nameFromProfile(profile),
                  email: typeof profile.email === 'string' ? normalizeEmail(profile.email) : undefined,
                }),
              },
            ],
          }),
        ]
      : []),
    nextCookies(),
  ],
} satisfies BetterAuthOptions

export const isEduidConfigured = () => eduidConfigured
