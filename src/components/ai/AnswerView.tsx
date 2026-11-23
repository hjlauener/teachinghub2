'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import type { QuestionSource } from '@/ai/repo'
import { answerParts } from '@/ai/rules'

export type PublicSource = QuestionSource

/** Link auf die Quelle: Seite im aktuellen Sprachpräfix, Anker auf den Abschnitt (8.7, 8.9). */
export const sourceHref = (s: PublicSource, locale: string) => (s.path ? `/${locale}${s.path}${s.anchor ? `#${s.anchor}` : ''}` : null)

/**
 * Antworttext mit Quellenverweisen [n] als Links und darunter die Quellen als Karten.
 * Absätze aus Leerzeilen; Aufzählungen bleiben als Zeilen mit „-“/„•“ lesbar (white-space: pre-line).
 */
export function AnswerView({ answer, sources, locale, streaming = false }: { answer: string; sources: PublicSource[]; locale: string; streaming?: boolean }) {
  const t = useTranslations('Ask')
  const paragraphs = answer.split(/\n{2,}/).filter((p) => p.trim())
  return (
    <div className="answer">
      <div className="answer__text" aria-live={streaming ? 'polite' : undefined} aria-busy={streaming || undefined}>
        {paragraphs.map((p, i) => (
          <p key={i}>
            {answerParts(p, sources.length).map((part, j) =>
              part.type === 'text' ? (
                <React.Fragment key={j}>{part.text}</React.Fragment>
              ) : (
                <a key={j} className="answer__cite" href={`#quelle-${part.n}`} aria-label={t('sourceRef', { n: part.n })}>
                  [{part.n}]
                </a>
              ),
            )}
          </p>
        ))}
      </div>
      {sources.length > 0 && (
        <section className="answer__sources" aria-labelledby="answer-sources-heading">
          <h3 id="answer-sources-heading">{t('sources')}</h3>
          <ol>
            {sources.map((s) => {
              const href = sourceHref(s, locale)
              return (
                <li key={s.n} id={`quelle-${s.n}`} className="answer__source">
                  <span className="hub-item__type">{t(`type_${s.collection}`)}</span>
                  {href ? <a href={href}>{s.title}</a> : s.title}
                  {s.label && <span className="meta"> › {s.label}</span>}
                </li>
              )
            })}
          </ol>
        </section>
      )}
    </div>
  )
}
