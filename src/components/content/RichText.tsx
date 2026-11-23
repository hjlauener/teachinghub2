import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'
import React from 'react'

import type { Locale } from '@/i18n/routing'
import type { Media } from '@/payload-types'

type Props = {
  data: unknown
  locale: Locale
  className?: string
}

/** Interne Pfade (ohne Sprachpräfix gespeichert, Entscheidung 7.2) in der aktuellen Sprache verlinken. */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('/api/') || href.startsWith('//')) return href
  if (/^\/(de|en|fr)(\/|$)/.test(href)) return href
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}

type VideoFields = { url?: string; title?: string }

function converters(locale: Locale): JSXConvertersFunction {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => {
        const doc = linkNode.fields.doc?.value as { path?: string } | undefined
        return localizeHref(doc?.path ?? '/', locale)
      },
    }),
    link: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const fields = node.fields as { url?: string; newTab?: boolean; linkType?: string; doc?: { value?: { path?: string } } }
      const href =
        fields.linkType === 'internal' ? localizeHref(fields.doc?.value?.path ?? '/', locale) : localizeHref(fields.url ?? '#', locale)
      const external = /^https?:\/\//.test(href)
      return (
        <a href={href} {...(fields.newTab || external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      )
    },
    upload: ({ node }) => {
      const media = node.value as Media | number
      if (!media || typeof media !== 'object' || !media.url) return null
      if (media.mimeType?.startsWith('image/')) {
        // <span> statt <figure>: Bilder der Altsite stehen oft innerhalb eines Absatzes
        return (
          <span className="rt-figure">
            {/* eslint-disable-next-line @next/next/no-img-element -- Mediathek-Bilder in Originalgrösse */}
            <img src={media.url} alt={media.alt ?? ''} width={media.width ?? undefined} height={media.height ?? undefined} loading="lazy" />
          </span>
        )
      }
      return (
        <p>
          <a href={media.url}>{media.alt || media.filename}</a>
        </p>
      )
    },
    blocks: {
      videoEmbed: ({ node }: { node: { fields: VideoFields } }) => {
        const { url, title } = node.fields
        if (!url) return null
        return (
          <div className="rt-video">
            <iframe src={url} title={title || 'Video'} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen />
          </div>
        )
      },
    },
  })
}

/** Rich Text aus dem CMS (Lexical) inkl. Tabellen, Bildern, Videos und lokalisierten Links. */
export function RichText({ data, locale, className }: Props) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <PayloadRichText
      data={data as SerializedEditorState}
      converters={converters(locale)}
      className={['rich-text', className].filter(Boolean).join(' ')}
      disableContainer={false}
    />
  )
}

/** Hat ein Rich-Text-Feld sichtbaren Inhalt? */
export function hasContent(data: unknown): boolean {
  if (!data || typeof data !== 'object' || !('root' in data)) return false
  const root = (data as { root: { children?: unknown[] } }).root
  return Array.isArray(root.children) && root.children.length > 0
}
