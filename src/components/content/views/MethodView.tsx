import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { Method, Taxonomy } from '@/payload-types'

import { MethodOccurrences } from '@/components/topics/TopicView'

import { ContentSection } from '../parts'
import { ArticleView } from './ArticleView'

const names = (terms: (number | Taxonomy)[] | number | Taxonomy | null | undefined) =>
  (Array.isArray(terms) ? terms : terms ? [terms] : [])
    .filter((t): t is Taxonomy => typeof t === 'object')
    .map((t) => t.name)

/** Methodenseite: Kategorien des Methodenkompasses + alternative Methoden mit Vergleichstext. */
export async function MethodView({ doc, locale }: { doc: Method; locale: Locale }) {
  const t = await getTranslations('Content')
  const facts = [
    { label: t('purposes'), values: names(doc.purposes) },
    { label: t('modalities'), values: names(doc.modalities) },
    { label: t('socialForms'), values: names(doc.socialForms) },
    { label: t('effort'), values: names(doc.effort) },
  ].filter((f) => f.values.length)

  const alternatives = (doc.alternatives ?? []).filter((a) => typeof a.method === 'object' && a.method)

  return (
    <ArticleView
      doc={doc}
      locale={locale}
      kind="methods"
      before={
        <dl className="method-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.values.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      }
      afterResources={
        <>
          <MethodOccurrences methodId={doc.id} locale={locale} />
          {alternatives.length > 0 ? (
          <ContentSection id="alternative-methoden" title={t('alternatives')}>
            <ul className="card-list">
              {alternatives.map((alt) => {
                const method = alt.method as Method
                return (
                  <li key={alt.id ?? method.id} className="card">
                    <h3>
                      <Link href={method.path}>{method.title}</Link>
                    </h3>
                    {alt.note && <p>{alt.note}</p>}
                  </li>
                )
              })}
            </ul>
          </ContentSection>
          ) : null}
        </>
      }
    />
  )
}
