'use client'

import { useTranslations } from 'next-intl'
import React, { useMemo, useState } from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

export type CompassMethod = {
  id: number
  title: string
  lead: string
  path: string
  purposes: number[]
  modalities: number[]
  socialForms: number[]
  effort: number | null
}

type Option = { id: number; name: string; order: number }
type FacetKey = 'purposes' | 'modalities' | 'socialForms' | 'effort'

const FACETS: { key: FacetKey; label: 'purposes' | 'modalities' | 'socialForms' | 'effort' }[] = [
  { key: 'purposes', label: 'purposes' },
  { key: 'modalities', label: 'modalities' },
  { key: 'socialForms', label: 'socialForms' },
  { key: 'effort', label: 'effort' },
]

export function filterMethods(
  methods: CompassMethod[],
  query: string,
  selected: Partial<Record<FacetKey, number | null>>,
): CompassMethod[] {
  const q = query.trim().toLowerCase()
  return methods.filter((m) => {
    if (q && !`${m.title} ${m.lead}`.toLowerCase().includes(q)) return false
    for (const { key } of FACETS) {
      const value = selected[key]
      if (!value) continue
      const has = key === 'effort' ? m.effort === value : (m[key] as number[]).includes(value)
      if (!has) return false
    }
    return true
  })
}

/** Filterbare, sortierbare Methodentabelle (ersetzt die DataTables-Tabelle der Altsite). */
export function CompassTable({
  methods,
  facets,
}: {
  locale: Locale
  methods: CompassMethod[]
  facets: Record<FacetKey, Option[]>
}) {
  const t = useTranslations('Compass')
  const c = useTranslations('Content')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Partial<Record<FacetKey, number | null>>>({})
  const [sort, setSort] = useState<'name' | 'effort'>('name')

  const names = useMemo(() => {
    const map = new Map<number, string>()
    Object.values(facets).flat().forEach((o) => map.set(o.id, o.name))
    return map
  }, [facets])
  const effortOrder = useMemo(() => new Map(facets.effort.map((o) => [o.id, o.order])), [facets])

  const rows = useMemo(() => {
    const filtered = filterMethods(methods, query, selected)
    return [...filtered].sort((a, b) =>
      sort === 'effort'
        ? (effortOrder.get(a.effort ?? 0) ?? 99) - (effortOrder.get(b.effort ?? 0) ?? 99) || a.title.localeCompare(b.title)
        : a.title.localeCompare(b.title),
    )
  }, [methods, query, selected, sort, effortOrder])

  const list = (values: number[]) => values.map((v) => names.get(v)).filter(Boolean).join(', ')

  return (
    <div className="compass">
      <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="filters__field filters__field--wide">
          <label htmlFor="compass-q">{t('search')}</label>
          <input id="compass-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {FACETS.map(({ key, label }) => (
          <div className="filters__field" key={key}>
            <label htmlFor={`compass-${key}`}>{c(label)}</label>
            <select
              id={`compass-${key}`}
              value={selected[key] ?? ''}
              onChange={(e) => setSelected({ ...selected, [key]: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">{t('all')}</option>
              {facets[key].map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="filters__field">
          <label htmlFor="compass-sort">{t('sortBy')}</label>
          <select id="compass-sort" value={sort} onChange={(e) => setSort(e.target.value as 'name' | 'effort')}>
            <option value="name">{t('sortName')}</option>
            <option value="effort">{t('sortEffort')}</option>
          </select>
        </div>
        <button
          type="button"
          className="button button--secondary filters__reset"
          onClick={() => {
            setQuery('')
            setSelected({})
          }}
        >
          {t('reset')}
        </button>
      </form>

      <p role="status" className="results-count">
        {t('results', { count: rows.length })}
      </p>

      {rows.length === 0 ? (
        <p>{t('noResults')}</p>
      ) : (
        <div className="table-scroll" tabIndex={0} role="region" aria-label={t('results', { count: rows.length })}>
          <table className="compass-table">
            <thead>
              <tr>
                <th scope="col">{t('method')}</th>
                <th scope="col">{c('purposes')}</th>
                <th scope="col">{c('modalities')}</th>
                <th scope="col">{c('socialForms')}</th>
                <th scope="col">{c('effort')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <th scope="row">
                    <Link href={m.path}>{m.title}</Link>
                    {m.lead && <span className="compass-table__lead">{m.lead}</span>}
                  </th>
                  <td>{list(m.purposes)}</td>
                  <td>{list(m.modalities)}</td>
                  <td>{list(m.socialForms)}</td>
                  <td>{m.effort ? names.get(m.effort) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
