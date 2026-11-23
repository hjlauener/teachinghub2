import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'

import { getQuestionFor } from '@/ai/repo'
import { AnswerView } from '@/components/ai/AnswerView'
import { hubDatabase } from '@/hub/database'
import { isUuid } from '@/hub/rules'
import { currentMember } from '@/hub/server'
import { Link, redirect } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string; id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AskHistory' })
  return { title: t('pageTitle') }
}

/** Eine gespeicherte Frage mit Antwort und Quellen – für die fragende Person und Mitglieder, mit denen sie geteilt wurde. */
export default async function QuestionPage({ params }: Props) {
  const { locale, id } = await params
  if (!isLocale(locale)) return null
  setRequestLocale(locale)
  const member = await currentMember()
  if (!member) return redirect({ href: { pathname: '/anmelden', query: { zurueck: `/${locale}/mein-hub/frage/${id}` } }, locale })
  if (!isUuid(id)) notFound()
  const found = await getQuestionFor(hubDatabase(), id, member.id)
  if (!found) notFound()
  const { question, own } = found
  const t = await getTranslations('AskHistory')
  const format = await getFormatter()
  return (
    <article className="content-page hub" aria-labelledby="page-heading">
      <header className="page-header">
        <p className="meta">
          <Link href={own ? '/mein-hub#fragen' : '/mein-hub#geteilt'}>{t('back')}</Link>
        </p>
        <span className="hub-item__type">
          {own ? t('yourQuestion') : t('sharedQuestion')} · {format.dateTime(question.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        <h1 id="page-heading">{question.question}</h1>
      </header>
      {question.outcome === 'answered' ? (
        <AnswerView answer={question.answer} sources={question.sources} locale={locale} />
      ) : (
        <p>{t(`outcome_${question.outcome}`)}</p>
      )}
      <p className="meta">
        {t('meta', { model: question.model, tokens: question.inputTokens + question.outputTokens })}
      </p>
      <p className="meta">{t('disclaimer')}</p>
    </article>
  )
}
