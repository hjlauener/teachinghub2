import { getTranslations } from 'next-intl/server'
import React from 'react'

import type { Locale } from '@/i18n/routing'
import { findMany, listTaxonomies } from '@/lib/content'
import type { Taxonomy } from '@/payload-types'

import { CompassTable, type CompassMethod } from './CompassTable'

const ids = (terms: (number | Taxonomy)[] | number | Taxonomy | null | undefined): number[] =>
  (Array.isArray(terms) ? terms : terms ? [terms] : []).map((t) => (typeof t === 'object' ? t.id : t))

/** Methodenkompass: alle Methoden mit Filtern Zweck · Modalität · Sozialform · Aufwand (Analyse 5.1). */
export async function MethodsCompass({ locale }: { locale: Locale }) {
  const t = await getTranslations('Compass')
  const nav = await getTranslations('Nav')
  const [methods, purposes, modalities, socialForms, efforts] = await Promise.all([
    findMany('methods', locale, { sort: 'title', depth: 0 }),
    listTaxonomies('zweck', locale),
    listTaxonomies('modalitaet', locale),
    listTaxonomies('sozialform', locale),
    listTaxonomies('aufwand', locale),
  ])
  const data: CompassMethod[] = methods.docs.map((m) => ({
    id: m.id,
    title: m.title,
    lead: m.lead ?? '',
    path: m.path,
    purposes: ids(m.purposes),
    modalities: ids(m.modalities),
    socialForms: ids(m.socialForms),
    effort: ids(m.effort)[0] ?? null,
  }))
  const opt = (terms: Taxonomy[]) => terms.map((term) => ({ id: term.id, name: term.name, order: term.order ?? 0 }))

  return (
    <article className="content-page" aria-labelledby="page-heading">
      <header className="page-header">
        <h1 id="page-heading">{nav('methods')}</h1>
        <p className="lead">{t('intro')}</p>
      </header>
      <CompassTable
        locale={locale}
        methods={data}
        facets={{ purposes: opt(purposes), modalities: opt(modalities), socialForms: opt(socialForms), effort: opt(efforts) }}
      />
    </article>
  )
}
