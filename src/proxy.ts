import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

import { routing } from './i18n/routing'
import { contentSecurityPolicy, createNonce } from './lib/csp'
import { legacyRedirect } from './lib/redirects'

const intl = createMiddleware(routing)

/**
 * 1. Alte URLs der Altsite (`…/index_ger.html`) dauerhaft (301) auf die neuen Pfade umleiten (Entscheidung 7.2).
 * 2. Sprach-Routing: `/` → `/de`, Sprachpräfix für alle Frontend-Seiten.
 * 3. Content-Security-Policy (Nonce) für alle Frontend-Seiten.
 * Payload-Admin (`/admin`), API (`/api`), Next-Interna und Dateien sind ausgenommen.
 * (Next.js 16: `proxy.ts` ersetzt `middleware.ts`.)
 */
export default function proxy(request: NextRequest) {
  const target = legacyRedirect(request.nextUrl.pathname)
  if (target) {
    const url = request.nextUrl.clone()
    url.pathname = target
    return NextResponse.redirect(url, 301)
  }
  // 3. Content-Security-Policy mit Nonce pro Anfrage: Next.js liest sie aus dem Request-Header und
  //    versieht seine Skripte damit; der Browser erhält dieselbe Policy im Response-Header.
  const csp = contentSecurityPolicy(createNonce(), process.env.NODE_ENV !== 'production')
  const headers = new Headers(request.headers)
  headers.set('content-security-policy', csp)
  const response = intl(new NextRequest(request, { headers }))
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|brand|.*\\..*).*)', '/(.*)/index_(ger|eng|fra).html', '/index_(ger|eng|fra).html'],
}
