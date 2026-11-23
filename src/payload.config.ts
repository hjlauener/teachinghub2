import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { Contacts } from './collections/Contacts'
import { LegacySnapshots } from './collections/LegacySnapshots'
import { MigrationInbox } from './collections/MigrationInbox'
import { Media } from './collections/Media'
import { MemberInvites, MemberSettings } from './collections/MemberInvites'
import { Feedback, FeedbackImages } from './collections/Feedback'
import { Suggestions } from './collections/Suggestions'
import { withAiIndex } from './ai/indexer'
import { allowedOrigins } from './hub/rules'
import { AiSettings } from './globals/AiSettings'
import { Methods } from './collections/Methods'
import { News } from './collections/News'
import { Pages } from './collections/Pages'
import { Subtopics } from './collections/Subtopics'
import { Taxonomies } from './collections/Taxonomies'
import { Tools } from './collections/Tools'
import { Topics } from './collections/Topics'
import { TranslationCache } from './collections/TranslationCache'
import { Users } from './collections/Users'
import { Navigation } from './globals/Navigation'
import { editor } from './lib/editor'
import { migrations } from './migrations'
import { defaultLocale, locales } from './i18n/routing'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const weeklyDelta = process.env.LEGACY_DELTA_WEEKLY === 'true'

const localeLabels: Record<(typeof locales)[number], string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' – TeachingHub2 (Prototyp)',
    },
    components: {
      // Redaktions-Statistik der Likes (Phase 5, Entscheidung 8.1)
      afterNavLinks: ['@/components/admin/LikeStatsLink#LikeStatsLink'],
      views: {
        likeStats: { Component: '@/components/admin/LikeStats#LikeStats', path: '/like-statistik' },
      },
    },
  },
  // Sprache der Admin-Oberfläche
  i18n: {
    fallbackLanguage: 'de',
    supportedLanguages: { de, en, fr },
  },
  // Inhaltssprachen (Entscheidungen 4.1–4.3): DE ist Quelle, Fallback auf DE
  localization: {
    locales: locales.map((code) => ({ code, label: localeLabels[code] })),
    defaultLocale,
    fallback: true,
  },
  // Inhalts-Collections erhalten zusätzlich die Hooks des KI-Index (Phase 6)
  collections: [
    // Inhalte
    Pages,
    Articles,
    Methods,
    Tools,
    News,
    // Themen der Lehre
    Topics,
    Subtopics,
    // Struktur
    Taxonomies,
    Contacts,
    Media,
    TranslationCache,
    // Verwaltung
    Users,
    MemberInvites,
    // Rückmeldungen der Mitglieder (Phase 5)
    Feedback,
    FeedbackImages,
    Suggestions,
    // Migration Altsite
    MigrationInbox,
    LegacySnapshots,
  ].map(withAiIndex),
  globals: [Navigation, MemberSettings, AiSettings],
  // Wöchentlicher Delta-Abgleich (Entscheidung 3.2), nur wenn LEGACY_DELTA_WEEKLY=true
  jobs: {
    tasks: [
      {
        slug: 'legacyDelta',
        label: 'Delta-Abgleich Altsite',
        schedule: weeklyDelta ? [{ cron: '0 6 * * 1', queue: 'weekly' }] : undefined,
        handler: async ({ req }) => {
          const { runDelta } = await import('./migration/delta')
          await runDelta(req.payload)
          return { output: {} }
        },
      },
      {
        // KI-Index nach Änderungen im CMS nachführen (Phase 6; Aufträge aus src/ai/indexer.ts)
        slug: 'aiIndex',
        label: 'KI-Index aktualisieren',
        retries: 2,
        inputSchema: [
          { name: 'collection', type: 'text', required: true },
          { name: 'id', type: 'number', required: true },
        ],
        handler: async ({ input, req }) => {
          const { indexDocument } = await import('./ai/indexer')
          const embedded = await indexDocument(req.payload, input.collection as never, input.id)
          return { output: { embedded } }
        },
      },
    ],
    autoRun: [
      ...(weeklyDelta ? [{ cron: '*/15 * * * *', queue: 'weekly' }] : []),
      // Index-Aufträge jede Minute abarbeiten (nicht in Testläufen, damit Tests den Index selbst steuern)
      ...(process.env.AI_INDEX_ON_SAVE !== 'off' && !process.env.VITEST ? [{ cron: '* * * * *', queue: 'ai', limit: 20 }] : []),
    ],
  },
  editor,
  // Admin-Anmeldung per Cookie nur von der eigenen Website (CSRF-Schutz zusätzlich zu SameSite)
  csrf: allowedOrigins(),
  // Beim Start geprüft (src/instrumentation.ts): im Produktionsbetrieb kein Platzhalter, mindestens 32 Zeichen
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Lokal (dev/test): Schema-Push. Produktion: Migrationen aus src/migrations beim Start.
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  // Mailversand: lokal an Mailpit (http://localhost:8025), später SMTP des Hosters
  email: nodemailerAdapter({
    defaultFromAddress: process.env.MAIL_FROM || 'teachinghub2@localhost',
    defaultFromName: 'TeachingHub2 (Prototyp)',
    // Beim Build/CI gibt es keinen SMTP-Server – Verbindung erst beim Senden prüfen
    skipVerify: true,
    transportOptions: {
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT || 1025),
      secure: false,
      ignoreTLS: true,
    },
  }),
  sharp,
  plugins: [],
})
