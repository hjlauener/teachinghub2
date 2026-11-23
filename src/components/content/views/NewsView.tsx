import { getFormatter, getTranslations } from 'next-intl/server'
import React from 'react'

import type { Locale } from '@/i18n/routing'
import type { News } from '@/payload-types'

import { PageHeader } from '../parts'
import { RichText } from '../RichText'

export async function NewsView({ doc, locale }: { doc: News; locale: Locale }) {
  const t = await getTranslations('Content')
  const format = await getFormatter()
  return (
    <article className="content-page" aria-labelledby="page-heading">
      <PageHeader title={doc.title} lead={doc.lead} />
      {doc.date && (
        <p className="meta">
          {t('publishedOn')} {format.dateTime(new Date(doc.date), { dateStyle: 'long' })}
        </p>
      )}
      <RichText data={doc.body} locale={locale} />
    </article>
  )
}
