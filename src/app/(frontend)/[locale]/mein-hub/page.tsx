import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BookmarkItem, LikeItem } from '@/components/hub/HubItems'
import { hubDatabase } from '@/hub/database'
import { listBookmarks, listLikes } from '@/hub/repo'
import { currentMember, refKey, resolveDocs } from '@/hub/server'
import { Link, redirect } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Hub' })
  return { title: t('heading') }
}

/** „Mein Hub“: Gemerktes mit Notizen, eigene Likes, Daten-Export, Link zu den Kontoeinstellungen. */
export default async function MyHubPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) return null
  setRequestLocale(locale)
  const member = await currentMember()
  if (!member) return redirect({ href: { pathname: '/anmelden', query: { zurueck: `/${locale}/mein-hub` } }, locale })

  const db = hubDatabase()
  const [bookmarks, likes] = await Promise.all([listBookmarks(db, member.id), listLikes(db, member.id)])
  const docs = await resolveDocs([...bookmarks, ...likes], locale)
  const t = await getTranslations('Hub')

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
