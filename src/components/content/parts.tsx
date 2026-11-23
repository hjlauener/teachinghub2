import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import type { Contact, Taxonomy } from '@/payload-types'

import { hasContent, RichText } from './RichText'

/** Seitenkopf mit Titel und Lead. */
export function PageHeader({ title, lead }: { title: string; lead?: string | null }) {
  return (
    <header className="page-header">
      <h1 id="page-heading">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  )
}

/** Hinweis, wenn die Seite in der gewählten Sprache noch nicht übersetzt ist (Entscheidung 4.2/4.3). */
export async function TranslationNotice({ state }: { state: 'human' | 'machine' | 'fallback' }) {
  if (state === 'human') return null
  const t = await getTranslations('Content')
  return (
    <p className="translation-notice" role="note">
      {t(state === 'machine' ? 'machineTranslated' : 'notTranslated')}
    </p>
  )
}

export type Section = { id: string; label: string }

/** „Wegweiser“: Sprunglinks zu den vorhandenen Abschnitten (wie auf der Altsite). */
export async function SectionNav({ sections }: { sections: Section[] }) {
  if (sections.length < 2) return null
  const t = await getTranslations('Content')
  return (
    <nav className="section-nav" aria-label={t('guide')}>
      <span className="section-nav__label">{t('guide')}:</span>
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`}>{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function ContentSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="content-section" aria-labelledby={`${id}-heading`} id={id}>
      <h2 id={`${id}-heading`}>{title}</h2>
      {children}
    </section>
  )
}

type Insight = { id?: string | null; title: string; content?: unknown }

export function Insights({ items, locale }: { items: Insight[] | null | undefined; locale: Locale }) {
  return (
    <div className="insights">
      {(items ?? []).map((item, i) => (
        <article className="insight" key={item.id ?? i}>
          <h3>{item.title}</h3>
          <RichText data={item.content} locale={locale} />
        </article>
      ))}
    </div>
  )
}

type Resources = { literature?: unknown; guides?: unknown; support?: unknown } | null | undefined

export async function ResourcesBlock({ resources, locale }: { resources: Resources; locale: Locale }) {
  const t = await getTranslations('Content')
  const parts = (['literature', 'guides', 'support'] as const).filter((key) => hasContent(resources?.[key]))
  return (
    <div className="resources">
      {parts.map((key) => (
        <details key={key} className="resources__item" open={parts.length === 1}>
          <summary>
            <h3>{t(key)}</h3>
          </summary>
          <RichText data={resources?.[key]} locale={locale} />
        </details>
      ))}
    </div>
  )
}

export function hasResources(resources: Resources): boolean {
  return (['literature', 'guides', 'support'] as const).some((key) => hasContent(resources?.[key]))
}

export async function ContactCards({ contacts }: { contacts: (number | Contact)[] | null | undefined }) {
  const items = (contacts ?? []).filter((c): c is Contact => typeof c === 'object')
  if (items.length === 0) return null
  const t = await getTranslations('Content')
  return (
    <ul className="contact-cards">
      {items.map((c) => (
        <li key={c.id} className="contact-card">
          {c.topic && <p className="contact-card__topic">{c.topic}</p>}
          <p className="contact-card__name">
            <strong>{c.name}</strong>
            {c.unit && <> · {c.unit}</>}
          </p>
          {c.phone && (
            <p>
              {t('phone')}: <a href={`tel:${c.phone.replace(/\s+/g, '')}`}>{c.phone}</a>
            </p>
          )}
          {c.email && (
            <p>
              {t('email')}: <a href={`mailto:${c.email}`}>{c.email}</a>
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

/** Schlagwort-Chips (Rubrik, Thema, Methoden-Kategorien). */
export function TermChips({ terms, label }: { terms: (number | Taxonomy)[] | null | undefined; label?: string }) {
  const items = (terms ?? []).filter((t): t is Taxonomy => typeof t === 'object')
  if (items.length === 0) return null
  return (
    <ul className="chips" aria-label={label}>
      {items.map((term) => (
        <li key={term.id} className="chip">
          {term.name}
        </li>
      ))}
    </ul>
  )
}

/** Breadcrumb aus den Pfadsegmenten mit den Titeln der Elternseiten. */
export async function Breadcrumb({ items }: { items: { href: string; label: string }[] }) {
  const t = await getTranslations('Content')
  return (
    <nav className="breadcrumb" aria-label={t('breadcrumb')}>
      <ol>
        <li>
          <Link href="/">{t('home')}</Link>
        </li>
        {items.map((item, i) => (
          <li key={item.href}>
            {i === items.length - 1 ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
