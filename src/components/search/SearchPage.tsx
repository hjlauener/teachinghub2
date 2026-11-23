import { getTranslations } from 'next-intl/server'
import type { Where } from 'payload'
import React from 'react'

import { isSearchMode, type SearchMode } from '@/ai/rules'
import { AskPanel } from '@/components/ai/AskPanel'
import { TermChips } from '@/components/content/parts'
import { SearchModes } from '@/components/search/SearchModes'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { hubDatabase } from '@/hub/database'
import { likeCounts } from '@/hub/repo'
import { publicLikeCount } from '@/hub/rules'
import { findMany, listTaxonomies } from '@/lib/content'
import type { Taxonomy } from '@/payload-types'

/**
 * Facettensuche (Entscheidung 7.3): ein Index über Artikel, Angebote, Methoden, Tools und News;
 * Filter Typ · Rubrik · Thema. Funktioniert ohne JavaScript (GET-Formular).
 * Methoden tragen auf der Altsite implizit Rubrik „Lehre durchführen“ und Thema „Lehrmethoden“.
 */
export const SEARCH_TYPES = ['article', 'offer', 'method', 'tool', 'news'] as const
export type SearchType = (typeof SEARCH_TYPES)[number]

const METHOD_RUBRIC = 'lehre_durchfuehren'
const METHOD_THEME = 'lehrmethoden'

type Hit = { key: string; type: SearchType; title: string; lead: string | null; path: string | null; rubrics?: (number | Taxonomy)[] | null; themes?: (number | Taxonomy)[] | null; score: number; likes: number }

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? ''

export function textWhere(q: string): Where | null {
  const term = q.trim()
  if (!term) return null
  return { or: [{ title: { like: term } }, { lead: { like: term } }, { searchText: { like: term } }] }
}

export function score(title: string, lead: string | null, q: string): number {
  const term = q.trim().toLowerCase()
  if (!term) return 0
  if (title.toLowerCase() === term) return 3
  if (title.toLowerCase().includes(term)) return 2
  return lead?.toLowerCase().includes(term) ? 1 : 0
}

export async function SearchPage({ locale, searchParams }: { locale: Locale; searchParams: Record<string, string | string[] | undefined> }) {
  const t = await getTranslations('Search')
  const h = await getTranslations('Hub')
  const q = one(searchParams.q)
  const modeParam = isSearchMode(one(searchParams.modus)) ? (one(searchParams.modus) as SearchMode) : null
  const popular = one(searchParams.sortierung) === 'beliebt'
  const type = SEARCH_TYPES.find((ty) => ty === one(searchParams.typ)) ?? null
  const [rubrics, themes] = await Promise.all([listTaxonomies('rubrik', locale), listTaxonomies('thema', locale)])
  const rubric = rubrics.find((r) => r.slug === one(searchParams.rubrik)) ?? null
  const theme = themes.find((th) => th.slug === one(searchParams.thema)) ?? null
  const text = textWhere(q)
  const and = (extra: Where[]): Where => ({ and: [...(text ? [text] : []), ...extra] })
  const taxonomy: Where[] = [
    ...(rubric ? [{ rubrics: { contains: rubric.id } }] : []),
    ...(theme ? [{ themes: { contains: theme.id } }] : []),
  ]
  const wants = (ty: SearchType) => !type || type === ty
  const methodsMatchTaxonomy = (!rubric || rubric.slug === METHOD_RUBRIC) && (!theme || theme.slug === METHOD_THEME)
  const active = Boolean(q || type || rubric || theme || popular)

  const hits: Hit[] = []
  if (active) {
    const counts = (collection: 'articles' | 'tools' | 'methods' | 'news') => likeCounts(hubDatabase(), collection).catch(() => new Map<number, number>())
    const [likesA, likesT, likesM, likesN] = await Promise.all([counts('articles'), counts('tools'), counts('methods'), counts('news')])
    const [articles, tools, methods, news] = await Promise.all([
      wants('article') || wants('offer') ? findMany('articles', locale, { where: and(taxonomy), depth: 1 }) : null,
      wants('tool') ? findMany('tools', locale, { where: and(taxonomy), depth: 1 }) : null,
      wants('method') && methodsMatchTaxonomy ? findMany('methods', locale, { where: and([]) }) : null,
      wants('news') && !rubric && !theme ? findMany('news', locale, { where: and([]) }) : null,
    ])
    for (const a of articles?.docs ?? []) {
      const ty: SearchType = a.kind === 'offer' ? 'offer' : 'article'
      if (wants(ty)) hits.push({ key: `a${a.id}`, type: ty, title: a.title, lead: a.lead ?? null, path: a.path, rubrics: a.rubrics, themes: a.themes, score: score(a.title, a.lead ?? null, q), likes: likesA.get(a.id) ?? 0 })
    }
    for (const x of tools?.docs ?? []) hits.push({ key: `t${x.id}`, type: 'tool', title: x.title, lead: x.lead ?? null, path: x.path, rubrics: x.rubrics, themes: x.themes, score: score(x.title, x.lead ?? null, q), likes: likesT.get(x.id) ?? 0 })
    for (const m of methods?.docs ?? []) hits.push({ key: `m${m.id}`, type: 'method', title: m.title, lead: m.lead ?? null, path: m.path, score: score(m.title, m.lead ?? null, q), likes: likesM.get(m.id) ?? 0 })
    for (const n of news?.docs ?? []) hits.push({ key: `n${n.id}`, type: 'news', title: n.title, lead: n.lead ?? null, path: n.path ?? null, score: score(n.title, n.lead ?? null, q), likes: likesN.get(n.id) ?? 0 })
    hits.sort((a, b) => (popular ? b.likes - a.likes : 0) || b.score - a.score || a.title.localeCompare(b.title))
  }

  const typeLabel = (ty: SearchType) => t(`type${ty.charAt(0).toUpperCase()}${ty.slice(1)}` as 'typeArticle')

  return (
    <article className="content-page" aria-labelledby="page-heading">
      <header className="page-header">
        <h1 id="page-heading">{t('heading')}</h1>
      </header>
      {/* Suchen oder Fragen (Entscheidung 8.8) */}
      <SearchModes initialMode={modeParam ?? 'suchen'} explicit={modeParam !== null} ask={<AskPanel initialQuestion={q} />} search={<>
      <form className="filters" role="search" method="get">
        <div className="filters__field filters__field--wide">
          <label htmlFor="search-q">{t('label')}</label>
          <input id="search-q" name="q" type="search" defaultValue={q} />
        </div>
        <div className="filters__field">
          <label htmlFor="search-typ">{t('type')}</label>
          <select id="search-typ" name="typ" defaultValue={type ?? ''}>
            <option value="">{t('any')}</option>
            {SEARCH_TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {typeLabel(ty)}
              </option>
            ))}
          </select>
        </div>
        <div className="filters__field">
          <label htmlFor="search-rubrik">{t('rubric')}</label>
          <select id="search-rubrik" name="rubrik" defaultValue={rubric?.slug ?? ''}>
            <option value="">{t('any')}</option>
            {rubrics.map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filters__field">
          <label htmlFor="search-thema">{t('theme')}</label>
          <select id="search-thema" name="thema" defaultValue={theme?.slug ?? ''}>
            <option value="">{t('any')}</option>
            {themes.map((th) => (
              <option key={th.id} value={th.slug}>
                {th.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filters__field">
          <label htmlFor="search-sortierung">{t('sort')}</label>
          <select id="search-sortierung" name="sortierung" defaultValue={popular ? 'beliebt' : ''}>
            <option value="">{t('sortRelevance')}</option>
            <option value="beliebt">{t('sortPopular')}</option>
          </select>
        </div>
        <button type="submit" className="button button--primary">
          {t('submit')}
        </button>
        {active && (
          <Link href="/suche" className="filters__reset">
            {t('reset')}
          </Link>
        )}
      </form>

      {active && (
        <>
          <h2 className="results-count" role="status">
            {t('results', { count: hits.length })}
          </h2>
          {hits.length === 0 ? (
            <p>{t('noResults')}</p>
          ) : (
            <ul className="card-list">
              {hits.map((hit) => (
                <li key={hit.key} className="card">
                  <p className="card__topic">{typeLabel(hit.type)}</p>
                  <h3>{hit.path ? <Link href={hit.path}>{hit.title}</Link> : hit.title}</h3>
                  {hit.lead && <p>{hit.lead}</p>}
                  {publicLikeCount(hit.likes) !== null && <p className="like-badge">♥ {h('likeCount', { count: hit.likes })}</p>}
                  <div className="card__terms">
                    <TermChips terms={hit.rubrics} />
                    <TermChips terms={hit.themes} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      </>} />
    </article>
  )
}
