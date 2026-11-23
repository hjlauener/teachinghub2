import React from 'react'

import type { Locale } from '@/i18n/routing'
import type { Article } from '@/payload-types'

import { localizeHref, RichText } from '../RichText'

type Block = NonNullable<Article['blocks']>[number]

/** Freie Bausteine (Infobox, Zweispalter, Video, Hinweisbox, Linkliste). */
export function ContentBlocks({ blocks, locale }: { blocks: Block[] | null | undefined; locale: Locale }) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'infobox':
            return (
              <aside key={block.id} className="infobox">
                {block.title && <h3>{block.title}</h3>}
                <RichText data={block.content} locale={locale} />
              </aside>
            )
          case 'twoColumns':
            return (
              <div key={block.id} className="two-columns">
                <RichText data={block.left} locale={locale} />
                <RichText data={block.right} locale={locale} />
              </div>
            )
          case 'video':
            return (
              <figure key={block.id} className="rt-video">
                <iframe src={block.url} title={block.title} loading="lazy" allowFullScreen />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            )
          case 'alertbox':
            return (
              <div key={block.id} className={`alertbox alertbox--${block.variant ?? 'info'}`} role="note">
                <RichText data={block.content} locale={locale} />
              </div>
            )
          case 'linkList':
            return (
              <nav key={block.id} className="link-list" aria-label={block.title ?? undefined}>
                {block.title && <h3>{block.title}</h3>}
                <ul>
                  {(block.links ?? []).map((link) => {
                    const internal = link.internal && typeof link.internal.value === 'object' ? (link.internal.value as { path?: string }).path : null
                    const href = link.linkType === 'external' ? (link.url ?? '#') : localizeHref(internal ?? '/', locale)
                    return (
                      <li key={link.id}>
                        <a href={href}>{link.label}</a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            )
          default:
            return null
        }
      })}
    </>
  )
}
