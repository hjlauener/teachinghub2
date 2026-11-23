import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getKey, getQuestionFor, keyInfo, listQuestions } from '@/ai/repo'
import { testProviderEnabled } from '@/ai/providers'
import { AiSettingsForm } from '@/components/ai/AiSettingsForm'
import { DeleteAllQuestions, QuestionItem } from '@/components/ai/QuestionItem'
import { BookmarkItem, LikeItem } from '@/components/hub/HubItems'
import {
  FeedbackItem,
  type InboxEntry,
  InboxItem,
  NewCollectionForm,
  PreferencesForm,
} from '@/components/hub/HubSections'
import { hubDatabase } from '@/hub/database'
import { listMemberFeedback, listMemberSuggestions } from '@/hub/payload-data'
import { listBookmarks, listLikes } from '@/hub/repo'
import {
  type CollectionRow,
  getPreferences,
  listInbox,
  listOwnCollections,
  listSharedCollections,
} from '@/hub/repo-collections'
import { COLLECTION_KINDS } from '@/hub/rules'
import { currentMember, refKey, resolveDocs } from '@/hub/server'
import { Link, redirect } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/content'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Hub' })
  return { title: t('heading') }
}

/**
 * „Mein Hub“: Gemerktes, Meine Methoden/Tools, Mit mir geteilt, eigene Likes, Feedback, Vorschläge,
 * Benachrichtigungen, Fragen an den Hub, KI-Einstellungen und Daten-Export (Phasen 5 und 6).
 */
export default async function MyHubPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) return null
  setRequestLocale(locale)
  const member = await currentMember()
  if (!member)
    return redirect({
      href: { pathname: '/anmelden', query: { zurueck: `/${locale}/mein-hub` } },
      locale,
    })

  const db = hubDatabase()
  const payload = await getPayloadClient()
  const [bookmarks, likes, own, shared, inbox, feedback, suggestions, prefs, questions, aiKey, aiSettings] = await Promise.all([
    listBookmarks(db, member.id),
    listLikes(db, member.id),
    listOwnCollections(db, member.id),
    listSharedCollections(db, member.id),
    listInbox(db, member.id),
    listMemberFeedback(payload, member.id),
    listMemberSuggestions(payload, member.id),
    getPreferences(db, member.id),
    listQuestions(db, member.id, 100),
    getKey(db, member.id),
    payload.findGlobal({ slug: 'ai-settings', depth: 0 }).catch(() => null),
  ])
  // Geteilte Antworten (Phase 6): Fragetext für „Mit mir geteilt“
  const sharedQuestions = new Map(
    (
      await Promise.all(
        inbox.flatMap((e) => (e.questionId ? [getQuestionFor(db, e.questionId, member.id)] : [])),
      )
    ).flatMap((q) => (q ? [[q.question.id, q.question.question] as const] : [])),
  )
  const inboxRefs = inbox.flatMap((e) => (e.ref ? [e.ref] : []))
  const docs = await resolveDocs([...bookmarks, ...likes, ...inboxRefs], locale)
  const t = await getTranslations('Hub')
  const tc = await getTranslations('Collections')
  const tf = await getTranslations('Feedback')
  const ti = await getTranslations('Inbox')
  const ta = await getTranslations('AskHistory')
  const tk = await getTranslations('AiSettings')

  const sharedById = new Map(shared.map((c) => [c.id, c]))
  const inboxEntries: InboxEntry[] = inbox.flatMap((e): InboxEntry[] => {
    const base = {
      id: e.id,
      sender: e.senderName ?? ti('formerMember'),
      message: e.message,
      read: Boolean(e.readAt),
      createdAt: e.createdAt.toISOString(),
    }
    if (e.questionId) {
      const text = sharedQuestions.get(e.questionId)
      return text
        ? [{ ...base, title: text, typeLabel: ta('sharedAnswer'), href: `/mein-hub/frage/${e.questionId}`, collectionId: null }]
        : []
    }
    if (e.collectionId) {
      const c = sharedById.get(e.collectionId)
      return c
        ? [
            {
              ...base,
              title: c.title,
              typeLabel: tc(`kind_${c.kind}`),
              href: `/mein-hub/sammlung/${c.id}`,
              collectionId: c.id,
            },
          ]
        : []
    }
    const doc = e.ref ? docs.get(refKey(e.ref.collection, e.ref.docId)) : undefined
    return doc
      ? [
          {
            ...base,
            title: doc.title,
            typeLabel: t(`type_${doc.collection}`),
            href: doc.path,
            collectionId: null,
          },
        ]
      : []
  })
  const sections = [
    ['gemerkt', t('bookmarksHeading')],
    ['methoden', tc('kind_methods')],
    ['tools', tc('kind_tools')],
    ['geteilt', ti('heading')],
    ['fragen', ta('heading')],
    ['hilfreich', t('likesHeading')],
    ['feedback', tf('myFeedback')],
    ['vorschlaege', tc('mySuggestions')],
    ['einstellungen', t('preferencesHeading')],
    ['ki', tk('heading')],
    ['daten', t('exportHeading')],
  ] as const

  const bookmarkItems = bookmarks.flatMap((b) => {
    const doc = docs.get(refKey(b.collection, b.docId))
    return doc ? [{ doc, note: b.note }] : []
  })
  const likeItems = likes.flatMap((l) => docs.get(refKey(l.collection, l.docId)) ?? [])

  return (
    <article className="content-page hub" aria-labelledby="page-heading">
      <header className="page-header">
        <h1 id="page-heading">{t('heading')}</h1>
        <p className="lead">{t('lead')}</p>
        <p className="meta">
          {member.name || member.email} · <Link href="/konto">{t('accountSettings')}</Link>
        </p>
      </header>

      <nav className="hub-toc" aria-label={t('tocLabel')}>
        <ul>
          {sections.map(([anchor, label]) => (
            <li key={anchor}>
              <a href={`#${anchor}`}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="content-section" aria-labelledby="bookmarks-heading" id="gemerkt">
        <h2 id="bookmarks-heading">{t('bookmarksHeading')}</h2>
        {bookmarkItems.length === 0 ? (
          <p>{t('noBookmarks')}</p>
        ) : (
          <ul className="hub-list">
            {bookmarkItems.map(({ doc, note }) => (
              <BookmarkItem key={refKey(doc.collection, doc.id)} item={doc} note={note} />
            ))}
          </ul>
        )}
      </section>

      {COLLECTION_KINDS.map((kind) => (
        <section
          key={kind}
          className="content-section"
          aria-labelledby={`${kind}-heading`}
          id={kind === 'methods' ? 'methoden' : 'tools'}
        >
          <h2 id={`${kind}-heading`}>{tc(`kind_${kind}`)}</h2>
          <p className="meta">{tc(`lead_${kind}`)}</p>
          <CollectionList
            collections={own.filter((c) => c.kind === kind)}
            empty={tc(`empty_${kind}`)}
            count={(n) => tc('itemCount', { count: n })}
          />
          <NewCollectionForm kind={kind} />
        </section>
      ))}

      <section className="content-section" aria-labelledby="inbox-heading" id="geteilt">
        <h2 id="inbox-heading">{ti('heading')}</h2>
        <p className="meta">{ti('lead')}</p>
        {inboxEntries.length === 0 ? (
          <p>{ti('empty')}</p>
        ) : (
          <ul className="hub-list">
            {inboxEntries.map((entry) => (
              <InboxItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-labelledby="questions-heading" id="fragen">
        <h2 id="questions-heading">{ta('heading')}</h2>
        <p className="meta">{ta('lead')}</p>
        {questions.length === 0 ? (
          <p>
            {ta('empty')} <Link href={{ pathname: '/suche', query: { modus: 'fragen' } }}>{ta('askNow')}</Link>
          </p>
        ) : (
          <>
            <ul className="hub-list">
              {questions.map((q) => (
                <QuestionItem
                  key={q.id}
                  entry={{ id: q.id, question: q.question, outcome: q.outcome, createdAt: q.createdAt.toISOString(), tokens: q.inputTokens + q.outputTokens }}
                />
              ))}
            </ul>
            <DeleteAllQuestions />
          </>
        )}
      </section>

      <section className="content-section" aria-labelledby="likes-heading" id="hilfreich">
        <h2 id="likes-heading">{t('likesHeading')}</h2>
        <p className="meta">{t('likesPrivate')}</p>
        {likeItems.length === 0 ? (
          <p>{t('noLikes')}</p>
        ) : (
          <ul className="hub-list">
            {likeItems.map((doc) => (
              <LikeItem key={refKey(doc.collection, doc.id)} item={doc} />
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-labelledby="feedback-heading" id="feedback">
        <h2 id="feedback-heading">{tf('myFeedback')}</h2>
        <p className="meta">{tf('myFeedbackLead')}</p>
        {feedback.length === 0 ? (
          <p>{tf('noFeedback')}</p>
        ) : (
          <ul className="hub-list">
            {feedback.map((f) => (
              <FeedbackItem
                key={f.id}
                entry={{
                  id: f.id,
                  kindLabel: tf(`kind_${f.kind}`),
                  stateLabel: tf(`state_${f.state}`),
                  done: f.state === 'erledigt',
                  place: f.place,
                  pageUrl: f.pageUrl,
                  message: f.message,
                  reply: f.reply,
                  hasImage: f.hasImage,
                  createdAt: f.createdAt,
                }}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-labelledby="suggestions-heading" id="vorschlaege">
        <h2 id="suggestions-heading">{tc('mySuggestions')}</h2>
        <p className="meta">{tc('mySuggestionsLead')}</p>
        {suggestions.length === 0 ? (
          <p>{tc('noSuggestions')}</p>
        ) : (
          <ul className="hub-list">
            {suggestions.map((s) => (
              <li key={s.id} className="hub-item">
                <div className="hub-item__head">
                  <div>
                    <span className="hub-item__type">{tc(`kind_${s.kind}`)}</span>
                    <h3>{s.title}</h3>
                  </div>
                  <span
                    className={`state-badge${s.state === 'angenommen' ? ' state-badge--done' : ''}`}
                  >
                    {tc(`state_${s.state}`)}
                  </span>
                </div>
                {s.editorNote && (
                  <div className="hub-item__reply">
                    <strong>{tc('editorNote')}</strong>
                    <p>{s.editorNote}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="content-section" aria-labelledby="preferences-heading" id="einstellungen">
        <h2 id="preferences-heading">{t('preferencesHeading')}</h2>
        <PreferencesForm notifyShares={prefs.notifyShares} mailLocale={prefs.locale} />
      </section>

      <section className="content-section" aria-labelledby="ai-heading" id="ki">
        <h2 id="ai-heading">{tk('heading')}</h2>
        <AiSettingsForm
          initialKey={keyInfo(aiKey)}
          models={(aiSettings?.models ?? []).map((m) => ({ provider: m.provider, model: m.model, label: m.label }))}
          testProvider={testProviderEnabled()}
        />
      </section>

      <section className="content-section" aria-labelledby="export-heading" id="daten">
        <h2 id="export-heading">{t('exportHeading')}</h2>
        <p>{t('exportLead')}</p>
        <a className="button button--secondary" href="/api/hub/export" download>
          {t('exportButton')}
        </a>
      </section>
    </article>
  )
}

function CollectionList({
  collections,
  empty,
  count,
}: {
  collections: CollectionRow[]
  empty: string
  count: (n: number) => string
}) {
  if (collections.length === 0) return <p>{empty}</p>
  return (
    <ul className="hub-list hub-list--compact">
      {collections.map((c) => (
        <li key={c.id} className="hub-item">
          <h3>
            <Link href={`/mein-hub/sammlung/${c.id}`}>{c.title}</Link>
          </h3>
          <span className="hub-item__type">{count(c.itemCount)}</span>
        </li>
      ))}
    </ul>
  )
}
