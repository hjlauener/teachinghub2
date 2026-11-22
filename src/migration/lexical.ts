import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { randomUUID } from 'crypto'
import type { Payload } from 'payload'

/** Mediathek-Eintrag einer übernommenen Altsite-Datei. */
export type MediaRef = { id: number; url: string }

type LexicalNode = { type: string; children?: LexicalNode[]; text?: string; [key: string]: unknown }
export type LexicalState = { root: LexicalNode & { type: 'root' } }

const VIDEO_MARKER = /^§§VIDEO§§(.*?)§§(.*?)§§$/

/**
 * HTML → Lexical mit dem Editor der Website (Tabellen, Video-Einbettungen).
 * Bilder werden mit Mediathek-Einträgen verknüpft, Dokument-Links auf die Mediathek umgeschrieben.
 */
export async function createHtmlConverter(payload: Payload) {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  return function htmlToLexical(html: string, media: Map<string, MediaRef>): LexicalState | null {
    if (!html || !html.replace(/<[^>]+>/g, '').trim() && !/<img|§§VIDEO/.test(html)) return null

    // Dokument-Links → Datei in der Mediathek
    const dom = new JSDOM(`<body>${html}</body>`)
    const body = dom.window.document.body
    body.querySelectorAll('a').forEach((a) => {
      const href = (a.getAttribute('href') ?? '').trim()
      const ref = media.get(href)
      if (ref) {
        a.setAttribute('href', ref.url)
        return
      }
      // Gültig: Pfade (/…), http(s), mailto/tel ohne Leerzeichen. Sprungmarken (#…) und Rest → nur Text
      const cleaned = href.replace(/^(mailto:|tel:)\s+/i, '$1')
      if (/^\/[^\s]*$/.test(cleaned) || /^(https?:\/\/|mailto:|tel:)[^\s]+$/i.test(cleaned)) a.setAttribute('href', cleaned)
      else a.replaceWith(...a.childNodes)
    })
    const images = [...body.querySelectorAll('img')].map((img) => img.getAttribute('src') ?? '')

    const state = convertHTMLToLexical({ editorConfig, html: body.innerHTML, JSDOM }) as unknown as LexicalState

    // Bilder: Upload-Knoten der Reihe nach den Mediathek-Einträgen zuordnen
    let imageIndex = 0
    const transform = (nodes: LexicalNode[] = []): LexicalNode[] =>
      nodes.flatMap((node): LexicalNode[] => {
        if (node.type === 'upload') {
          const ref = media.get(images[imageIndex++] ?? '')
          return ref
            ? [{ type: 'upload', version: 3, format: '', id: randomUUID(), fields: null, relationTo: 'media', value: ref.id }]
            : []
        }
        if (node.type === 'paragraph') {
          const plain = (node.children ?? []).map((c) => c.text ?? '').join('').trim()
          const video = plain.match(VIDEO_MARKER)
          if (video) {
            return [
              {
                type: 'block',
                version: 2,
                format: '',
                fields: { id: randomUUID(), blockName: '', blockType: 'videoEmbed', url: video[1], title: video[2] || 'Video' },
              },
            ]
          }
        }
        return [{ ...node, ...(node.children ? { children: transform(node.children) } : {}) }]
      })
    state.root.children = transform(state.root.children)
    return state.root.children.length > 0 ? state : null
  }
}
