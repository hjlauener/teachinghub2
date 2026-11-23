import { describe, expect, it } from 'vitest'

import { feedbackReplyEmail, shareEmail } from '@/hub/mail'
import {
  collectionAccess,
  detectImageType,
  feedbackPlace,
  isCollectionKind,
  isFeedbackKind,
  isUuid,
  memberSearchPattern,
  normalizeText,
  PLACE_MAX,
  publicShareLinks,
} from '@/hub/rules'

describe('Sammlungen, Teilen, Feedback – Regeln (Phase 5, Teil 2)', () => {
  it('kennt nur „Meine Methoden“ und „Meine Tools“ (Entscheidung 2.3)', () => {
    expect(isCollectionKind('methods')).toBe(true)
    expect(isCollectionKind('tools')).toBe(true)
    expect(isCollectionKind('articles')).toBe(false)
  })

  it('bereinigt Freitext ein- und mehrzeilig', () => {
    expect(normalizeText('  Mein\tSeminar \n 2027 ', 200)).toBe('Mein Seminar 2027')
    expect(normalizeText('Zeile 1\r\nZeile 2\u0007', 200, { multiline: true })).toBe(
      'Zeile 1\nZeile 2',
    )
    expect(normalizeText('   ', 200, { required: true })).toBeNull()
    expect(normalizeText(undefined, 200)).toBe('')
    expect(normalizeText(undefined, 200, { required: true })).toBeNull()
    expect(normalizeText(5, 200)).toBeNull()
    expect(normalizeText('x'.repeat(201), 200)).toBeNull()
  })

  it('prüft UUIDs streng', () => {
    expect(isUuid('5f0c2a43-8b7e-4b8c-9d2a-0a1b2c3d4e5f')).toBe(true)
    expect(isUuid('5f0c2a43-8b7e-4b8c-9d2a-0a1b2c3d4e5f; drop')).toBe(false)
    expect(isUuid(42)).toBe(false)
  })

  it('vergibt Rechte an Sammlungen: Besitz, lesen, bearbeiten (Entscheidung 8.3)', () => {
    expect(collectionAccess('a', 'a', null)).toEqual({ read: true, edit: true, manage: true })
    expect(collectionAccess('a', 'b', { canEdit: false })).toEqual({
      read: true,
      edit: false,
      manage: false,
    })
    expect(collectionAccess('a', 'b', { canEdit: true })).toEqual({
      read: true,
      edit: true,
      manage: false,
    })
    expect(collectionAccess('a', 'b', null)).toEqual({ read: false, edit: false, manage: false })
  })

  it('sucht Mitglieder erst ab 3 Zeichen und maskiert LIKE-Platzhalter', () => {
    expect(memberSearchPattern('ab')).toBeNull()
    expect(memberSearchPattern('  ab  ')).toBeNull()
    expect(memberSearchPattern(null)).toBeNull()
    expect(memberSearchPattern('mül')).toEqual({ name: '%mül%', email: 'mül%' })
    expect(memberSearchPattern('a%_\\')).toEqual({ name: '%a\\%\\_\\\\%', email: 'a\\%\\_\\\\%' })
  })


  it('kennt die Feedback-Arten der Vorlage (Entscheidung 8.2)', () => {
    for (const kind of ['fehler', 'verbesserung', 'idee', 'frage'])
      expect(isFeedbackKind(kind)).toBe(true)
    expect(isFeedbackKind('lob')).toBe(false)
  })

  it('erkennt Bildtypen an den ersten Bytes, nicht am Namen', () => {
    expect(
      detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])),
    ).toBe('image/png')
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(
      detectImageType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])),
    ).toBe('image/webp')
    expect(detectImageType(new TextEncoder().encode('<svg onload=alert(1)>'))).toBeNull()
    expect(detectImageType(new Uint8Array([]))).toBeNull()
  })

  it('bestimmt die Stelle aus Seitentitel und Abschnitt (Entscheidung 8.2b)', () => {
    expect(feedbackPlace('Think-Pair-Share', 'Ablauf')).toBe('Think-Pair-Share › Ablauf')
    expect(feedbackPlace(' Think-Pair-Share ', null)).toBe('Think-Pair-Share')
    expect(feedbackPlace('Gleich', 'Gleich')).toBe('Gleich')
    expect(feedbackPlace('x'.repeat(400), 'y')).toHaveLength(PLACE_MAX)
  })

  it('baut öffentliche Teilen-Links für E-Mail und LinkedIn (ohne Facebook)', () => {
    const links = publicShareLinks(
      'https://hub.example/de/methodenkompass/think_pair_share',
      'Think & Share',
    )
    expect(links.mail).toBe(
      'mailto:?subject=Think%20%26%20Share&body=Think%20%26%20Share%0Ahttps%3A%2F%2Fhub.example%2Fde%2Fmethodenkompass%2Fthink_pair_share',
    )
    expect(links.linkedin).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fhub.example%2Fde%2Fmethodenkompass%2Fthink_pair_share',
    )
    expect(Object.keys(links)).toEqual(['mail', 'linkedin'])
  })

  it('maskiert Inhalte von Mitgliedern in Mails', () => {
    const mail = shareEmail('de', {
      from: 'Eva <b>',
      title: 'Liste',
      message: '<script>x</script>\nZeile 2',
      url: 'https://hub.example/de/mein-hub#geteilt',
    })
    expect(mail.subject).toBe('Eva <b> hat etwas mit Ihnen geteilt')
    const header = shareEmail('de', { from: 'Eva\r\nBcc: x@example.com', title: 'Liste\nzwei', message: '', url: 'https://hub.example' })
    expect(header.subject).toBe('Eva Bcc: x@example.com hat etwas mit Ihnen geteilt')
    expect(header.text).toContain('«Liste zwei»')
    expect(mail.html).not.toContain('<script>')
    expect(mail.html).toContain('&lt;script&gt;x&lt;/script&gt;<br>Zeile 2')
    expect(mail.text).toContain('https://hub.example/de/mein-hub#geteilt')
    const reply = feedbackReplyEmail('fr', {
      place: 'Page',
      reply: 'Merci',
      message: 'Bug',
      url: 'https://hub.example/fr/mein-hub#feedback',
    })
    expect(reply.subject).toContain('Teaching Hub')
    expect(reply.html).toContain('Merci')
  })
})
