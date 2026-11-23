import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { CollectionEditor, type EditorItem } from '@/components/hub/CollectionEditor'
import { hubDatabase } from '@/hub/database'
import { listMemberSuggestions } from '@/hub/payload-data'
import { getCollection, listItems, listShares } from '@/hub/repo-collections'
import { isUuid } from '@/hub/rules'
import { currentMember, refKey, resolveDocs } from '@/hub/server'
import { Link, redirect } from '@/i18n/navigation'
import { isLocale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/content'

type Props = { params: Promise<{ locale: string; id: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Collections' })
  return { title: t('pageTitle') }
}

/** Eine Sammlung aus „Meine Methoden/Tools“ – für Besitzer:in und Mitglieder, mit denen sie geteilt ist. */
export default async function CollectionPage({ params }: Props) {
  const { locale, id } = await params
  if (!isLocale(locale)) return null
  setRequestLocale(locale)
  const member = await currentMember()
  if (!member)
    return redirect({
      href: { pathname: '/anmelden', query: { zurueck: `/${locale}/mein-hub/sammlung/${id}` } },
      locale,
    })
  if (!isUuid(id)) notFound()

  const db = hubDatabase()
  const found = await getCollection(db, id, member.id)
  if (!found) notFound()
  const { collection, access } = found
  const [items, shares, suggestions] = await Promise.all([
    listItems(db, id),
    access.manage ? listShares(db, id) : Promise.resolve([]),
    access.manage
      ? listMemberSuggestions(await getPayloadClient(), member.id)
      : Promise.resolve([]),
  ])
  const docs = await resolveDocs(
    items.flatMap((i) => (i.ref ? [i.ref] : [])),
    locale,
  )
  const t = await getTranslations('Collections')
  const suggestionState = new Map(suggestions.map((s) => [s.id, t(`state_${s.state}`)]))

  const editorItems: EditorItem[] = items.map((item) => {
    const doc = item.ref ? docs.get(refKey(item.ref.collection, item.ref.docId)) : undefined
    return {
      id: item.id,
      title: item.title,
      docTitle: doc?.title ?? null,
      docPath: doc?.path ?? null,
      missing: Boolean(item.ref && !doc),
      note: item.note,
      suggestion: item.suggestionId
        ? { stateLabel: suggestionState.get(item.suggestionId) ?? t('state_neu') }
        : null,
    }
  })

  return (
    <article className="content-page hub" aria-labelledby="page-heading">
      <header className="page-header">
        <p className="meta">
          <Link href="/mein-hub">{t('backToHub')}</Link>
        </p>
        <span className="hub-item__type">{t(`kind_${collection.kind}`)}</span>
        <h1 id="page-heading">{collection.title}</h1>
        {collection.description && <p className="lead">{collection.description}</p>}
        <p className="meta">
          {access.manage ? t('privateNote') : t('sharedBy', { name: collection.ownerName })}
        </p>
      </header>
      <CollectionEditor
        collection={{
          id: collection.id,
          title: collection.title,
          description: collection.description,
          kindLabel: t(`kind_${collection.kind}`),
          ownerName: collection.ownerName,
        }}
        access={access}
        items={editorItems}
        shares={shares}
      />
    </article>
  )
}
