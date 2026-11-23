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
import { Methods } from './collections/Methods'
import { News } from './collections/News'
import { Pages } from './collections/Pages'
import { Subtopics } from './collections/Subtopics'
import { Taxonomies } from './collections/Taxonomies'
import { Tools } from './collections/Tools'
import { Topics } from './collections/Topics'
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
    // Verwaltung
    Users,
    // Migration Altsite
    MigrationInbox,
    LegacySnapshots,
  ],
  globals: [Navigation],
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
    ],
    autoRun: weeklyDelta ? [{ cron: '*/15 * * * *', queue: 'weekly' }] : [],
  },
  editor,
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
