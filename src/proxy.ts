import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

/**
 * Sprach-Routing: `/` → `/de`, Sprachpräfix für alle Frontend-Seiten.
 * Payload-Admin (`/admin`), API (`/api`), Next-Interna und Dateien sind ausgenommen.
 * (Next.js 16: `proxy.ts` ersetzt `middleware.ts`.)
 */
export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|brand|.*\\..*).*)'],
}
