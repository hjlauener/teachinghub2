import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { defaultLocale, locales } from './i18n/routing'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
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
