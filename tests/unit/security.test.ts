import { describe, expect, it } from 'vitest'

import { contentSecurityPolicy, createNonce } from '@/lib/csp'
import { isEmbeddableVideo, safeExternalUrl } from '@/lib/video'

describe('Content-Security-Policy (Review Sicherheit)', () => {
  it('erlaubt Skripte nur mit Nonce, keine Plugins, Rahmen nur von Video-Plattformen', () => {
    const csp = contentSecurityPolicy('abc123')
    expect(csp).toContain("script-src 'self' 'nonce-abc123' 'strict-dynamic'")
    expect(csp).not.toContain('unsafe-eval')
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'self'")
    expect(csp).toMatch(/frame-src 'self' https:\/\/www\.youtube-nocookie\.com .* https:\/\/\*\.unibe\.ch/)
    expect(contentSecurityPolicy('x', true)).toContain("'unsafe-eval'")
  })

  it('erzeugt jedes Mal eine neue Nonce', () => {
    const a = createNonce()
    expect(a).toMatch(/^[A-Za-z0-9+/]{22}==$/)
    expect(createNonce()).not.toBe(a)
  })
})

describe('Video-Einbettung nur von freigegebenen Plattformen', () => {
  it('lässt UniBE-Plattformen, YouTube (nocookie), Vimeo und SWITCHtube zu', () => {
    for (const url of ['https://tobira.unibe.ch/!v/abc', 'https://video.unibe.ch/embed/1', 'https://www.youtube-nocookie.com/embed/x', 'https://player.vimeo.com/video/1', 'https://tube.switch.ch/embed/1'])
      expect(isEmbeddableVideo(url), url).toBe(true)
  })

  it('lehnt andere Hosts, http, Zugangsdaten und Tricks mit dem Hostnamen ab', () => {
    for (const url of ['http://tobira.unibe.ch/x', 'https://evil.example/embed', 'https://unibe.ch.evil.example/x', 'https://evilunibe.ch/x', 'https://user:pw@tobira.unibe.ch/x', 'javascript:alert(1)', 'data:text/html,x'])
      expect(isEmbeddableVideo(url), url).toBe(false)
  })

  it('zeigt als Link nur http(s)-Adressen', () => {
    expect(safeExternalUrl('https://example.org/v')).toBe('https://example.org/v')
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
  })
})
