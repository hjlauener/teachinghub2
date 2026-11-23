import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  // E2E-Container ruft den Dev-Server als „app“ auf (docker compose --profile e2e)
  allowedDevOrigins: ['app'],
  // Nur vom Importer genutzt – nicht in den Server-Bundle packen
  serverExternalPackages: ['jsdom'],
  poweredByHeader: false,
  // Sicherheits-Header (Entscheidung 9.1); CSP folgt, sobald externe Einbettungen feststehen
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        // Ältere SVG-Dateien in der Mediathek: direkt aufgerufen ohne Skripte und isoliert (Sandbox)
        source: '/api/media/file/:file([^/]+\\.svg)',
        headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox" }],
      },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
