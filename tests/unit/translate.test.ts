// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { applyTexts, collectTexts } from '@/lib/translate/machine'
import { googleProvider } from '@/lib/translate/provider'

const lexical = {
  root: {
    type: 'root',
    children: [
      { type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Titel' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Ein ' }, { type: 'link', fields: { url: '/de/x', linkType: 'custom' }, children: [{ type: 'text', text: 'Link' }] }] },
      { type: 'upload', relationTo: 'media', value: 4 },
    ],
  },
}

describe('Maschinelle Übersetzung (Entscheidung 4.3)', () => {
  it('sammelt nur Texte, keine URLs oder Typen', () => {
    expect(collectTexts(lexical)).toEqual(['Titel', 'Ein ', 'Link'])
    expect(collectTexts({ title: 'Hallo', path: '/x', items: [{ id: 'a', note: 'Notiz' }] })).toEqual(['Hallo', 'Notiz'])
  })

  it('setzt Übersetzungen an derselben Stelle ein und erhält die Struktur', () => {
    const out = applyTexts(lexical, ['Title', 'A ', 'link'])
    expect(collectTexts(out)).toEqual(['Title', 'A ', 'link'])
    expect(JSON.stringify(out)).toContain('"url":"/de/x"')
    expect(out.root.children[2]).toEqual(lexical.root.children[2])
  })

  it('Google-Adapter sendet Texte als Stapel und liest die Antwort', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { q: string[]; target: string }
      return new Response(JSON.stringify({ data: { translations: body.q.map((q) => ({ translatedText: `${body.target}:${q}` })) } }))
    })
    const provider = googleProvider('test-key', fetchMock as unknown as typeof fetch)
    expect(await provider.translate(['Hallo', 'Welt'], 'fr')).toEqual(['fr:Hallo', 'fr:Welt'])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
