'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'

type OverviewTopic = { id: number; title: string; summary: string; path: string; live: boolean }
export type MatrixTopic = { id: number; title: string; path: string; live: boolean; cells: { title: string; path: string }[][] }

const MIN_PAGES = 5

/** Umschalter Nach Thema / Themen × Journey (per #themen / #matrix verlinkbar) mit Matrix und Detailband. */
export function TopicsViews({
  groups,
  matrix,
  phases,
}: {
  groups: { category: string; title: string; topics: OverviewTopic[] }[]
  matrix: MatrixTopic[]
  phases: string[]
}) {
  const t = useTranslations('Topics')
  const [view, setView] = useState<'themen' | 'matrix'>('themen')
  const [selected, setSelected] = useState<{ topic: number; phase: number | null }>({ topic: 0, phase: null })

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.location.hash === '#matrix') setView('matrix')
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const choose = (next: 'themen' | 'matrix') => {
    setView(next)
    history.replaceState(null, '', `#${next}`)
  }
  const max = Math.max(1, ...matrix.flatMap((row) => row.cells.map((c) => c.length)))
  const current = matrix[selected.topic]

  return (
    <div className="topics-views">
      <div role="tablist" aria-label={t('views')} className="tabs__list">
        {(['themen', 'matrix'] as const).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            id={`tab-${key}`}
            aria-controls={`view-${key}`}
            aria-selected={view === key}
            className="tabs__tab"
            onClick={() => choose(key)}
          >
            {key === 'themen' ? t('viewTopics') : t('viewMatrix')}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="view-themen" aria-labelledby="tab-themen" hidden={view !== 'themen'}>
        {groups.map((group) => (
          <section key={group.category} className="topic-group" aria-labelledby={`group-${group.category}`}>
            <h2 id={`group-${group.category}`}>
              <span className="topic-group__letter">{group.category}</span> {group.title}
            </h2>
            <ul className="topic-list">
              {group.topics.map((topic) => (
                <li key={topic.id}>
                  {topic.live ? (
                    <Link href={topic.path} className="topic-list__title">
                      {topic.title}
                    </Link>
                  ) : (
                    <span className="topic-list__title">
                      {topic.title} <span className="topic-list__soon">{t('soon')}</span>
                    </span>
                  )}
                  <p>{topic.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div role="tabpanel" id="view-matrix" aria-labelledby="tab-matrix" hidden={view !== 'matrix'}>
        <p>{t('matrixHint')}</p>
        <div className="table-scroll" role="region" aria-label={t('viewMatrix')} tabIndex={0}>
          <table className="matrix">
            <thead>
              <tr>
                <th scope="col">{t('topic')}</th>
                {phases.map((phase, i) => (
                  <th scope="col" key={phase}>
                    <button type="button" className="matrix__head" onClick={() => setSelected({ topic: selected.topic, phase: i })}>
                      {phase}
                    </button>
                  </th>
                ))}
                <th scope="col">{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, ti) => {
                const total = row.cells.reduce((sum, c) => sum + c.length, 0)
                return (
                  <tr key={row.id} className={ti === selected.topic ? 'is-selected' : undefined}>
                    <th scope="row">
                      <button type="button" className="matrix__topic" onClick={() => setSelected({ topic: ti, phase: null })}>
                        {row.title}
                      </button>
                    </th>
                    {row.cells.map((cell, pi) => (
                      <td key={pi}>
                        {cell.length > 0 ? (
                          <button
                            type="button"
                            className="matrix__dot"
                            style={{ ['--size' as string]: `${18 + (cell.length / max) * 22}px` }}
                            aria-label={`${row.title}, ${t('phaseColumn', { phase: phases[pi], count: cell.length })}`}
                            aria-pressed={ti === selected.topic && pi === selected.phase}
                            onClick={() => setSelected({ topic: ti, phase: pi })}
                          >
                            {cell.length}
                          </button>
                        ) : (
                          <span className="matrix__empty" aria-label={t('phaseColumn', { phase: phases[pi], count: 0 })} role="img" />
                        )}
                      </td>
                    ))}
                    <td className={total < MIN_PAGES ? 'matrix__total matrix__total--thin' : 'matrix__total'}>
                      {total}
                      {total < MIN_PAGES && <span className="visually-hidden"> ({t('thin')})</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {current && (
          <section className="matrix-detail" aria-live="polite" aria-labelledby="matrix-detail-heading">
            <h2 id="matrix-detail-heading">
              {current.live ? <Link href={current.path}>{current.title}</Link> : current.title}
            </h2>
            <div className="matrix-detail__band">
              {phases.map((phase, pi) => (
                <div key={phase} className={pi === selected.phase ? 'matrix-detail__phase is-selected' : 'matrix-detail__phase'}>
                  <h3>
                    {pi + 1} · {phase}
                  </h3>
                  {current.cells[pi].length ? (
                    <ul>
                      {current.cells[pi].map((page) => (
                        <li key={page.path}>
                          <Link href={page.path}>{page.title}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="meta">{t('pages', { count: 0 })}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
