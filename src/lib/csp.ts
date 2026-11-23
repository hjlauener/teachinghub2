import { VIDEO_HOST_SUFFIX, VIDEO_HOSTS } from './video'

/**
 * Content-Security-Policy der Website (Review Sicherheit, Entscheidung 9.1). Skripte nur mit Nonce pro Anfrage
 * (Next.js setzt sie auf seine Skripte), keine Plugins, Rahmen nur von Video-Plattformen, Einbettung der Site
 * nur durch sich selbst. Gilt für die Website; der Payload-Admin (/admin) ist ausgenommen.
 */
export function contentSecurityPolicy(nonce: string, dev = false): string {
  const frames = ["'self'", ...VIDEO_HOSTS.map((h) => `https://${h}`), `https://*${VIDEO_HOST_SUFFIX}`]
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    // React setzt Inline-Styles (style-Attribute); keine fremden Stylesheets
    "style-src 'self' 'unsafe-inline'",
    // data:/blob: für Bildschirmfoto und eigenes Bild im Feedback-Dialog
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${dev ? ' ws: wss:' : ''}`,
    "media-src 'self'",
    `frame-src ${frames.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ')
}

/** Zufällige Nonce (Base64, 128 Bit). */
export function createNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}
