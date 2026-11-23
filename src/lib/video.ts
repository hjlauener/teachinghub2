/**
 * Eingebettete Videos nur von bekannten Plattformen (Review Sicherheit). Andere Adressen erscheinen als Link.
 * Die gleiche Liste steht in der Content-Security-Policy (`frame-src`, src/lib/csp.ts).
 */
export const VIDEO_HOSTS = ['www.youtube-nocookie.com', 'www.youtube.com', 'youtube.com', 'player.vimeo.com', 'tube.switch.ch'] as const
/** Plattformen der Universität Bern (Tobira, Opencast) */
export const VIDEO_HOST_SUFFIX = '.unibe.ch'

export function isEmbeddableVideo(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2000) return false
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' || url.username || url.password) return false
  const host = url.hostname.toLowerCase()
  return (VIDEO_HOSTS as readonly string[]).includes(host) || host.endsWith(VIDEO_HOST_SUFFIX)
}

/** Link-Ersatz für nicht einbettbare Videos: nur http(s). */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}
