import { getTranslations } from 'next-intl/server'
import React from 'react'

import type { Locale } from '@/i18n/routing'
import type { Tool } from '@/payload-types'

import { ContentSection } from '../parts'
import { RichText } from '../RichText'
import { ArticleView } from './ArticleView'

/** Tool-Seite: Zugang/Antrag oben, FAQ nach den Abschnitten. */
export async function ToolView({ doc, locale }: { doc: Tool; locale: Locale }) {
  const t = await getTranslations('Content')
  const links = [
    doc.accessUrl ? { href: doc.accessUrl, label: t('access') } : null,
    doc.requestUrl ? { href: doc.requestUrl, label: t('request') } : null,
  ].filter((l): l is { href: string; label: string } => l !== null)

  return (
    <ArticleView
      doc={doc}
      locale={locale}
      kind="tools"
      before={
        links.length > 0 ? (
          <p className="cta-row">
            {links.map((link) => (
              <a key={link.href} className="button button--secondary" href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
          </p>
        ) : null
      }
      afterResources={
        doc.faq?.length ? (
          <ContentSection id="faq" title={t('faq')}>
            {doc.faq.map((item) => (
              <details key={item.id} className="faq">
                <summary>{item.question}</summary>
                <RichText data={item.answer} locale={locale} />
              </details>
            ))}
          </ContentSection>
        ) : null
      }
    />
  )
}
