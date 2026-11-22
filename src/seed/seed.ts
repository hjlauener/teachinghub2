import type { Payload } from 'payload'

import { C } from '@/lib/slugs'

import { navigationSeed, taxonomySeed } from './data'

export type SeedResult = { created: number; updated: number }

/**
 * Legt Schlagwörter und Navigation an bzw. aktualisiert sie (idempotent, Schlüssel: Typ + Slug).
 * Läuft mit `overrideAccess`, also nur aus vertrauenswürdigem Code (CLI, Tests).
 */
export async function seed(payload: Payload): Promise<SeedResult> {
  const result: SeedResult = { created: 0, updated: 0 }
  const ids = new Map<string, number | string>()

  // Rubriken zuerst, damit Themen ihre Rubrik referenzieren können
  const ordered = [...taxonomySeed].sort((a, b) => Number(a.type === 'thema') - Number(b.type === 'thema'))

  for (const term of ordered) {
    const existing = await payload.find({
      collection: C.taxonomies,
      where: { and: [{ type: { equals: term.type } }, { slug: { equals: term.slug } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const parent = term.parent ? ids.get(`rubrik:${term.parent}`) : undefined
    const base = {
      type: term.type,
      slug: term.slug,
      name: term.name.de,
      order: term.order,
      legacyKey: term.legacyKey,
      ...(parent !== undefined ? { parent: parent as number } : {}),
    }

    const doc = existing.docs[0]
      ? await payload.update({ collection: C.taxonomies, id: existing.docs[0].id, data: base, locale: 'de', overrideAccess: true })
      : await payload.create({ collection: C.taxonomies, data: base, locale: 'de', overrideAccess: true })
    if (existing.docs[0]) result.updated++
    else result.created++

    for (const locale of ['en', 'fr'] as const) {
      const name = term.name[locale]
      if (name) await payload.update({ collection: C.taxonomies, id: doc.id, data: { name }, locale, overrideAccess: true })
    }
    ids.set(`${term.type}:${term.slug}`, doc.id)
  }

  // Navigation: Struktur in DE anlegen, danach Bezeichnungen je Sprache an denselben Zeilen setzen
  const nav = await payload.updateGlobal({
    slug: 'navigation',
    locale: 'de',
    data: { mainMenu: navigationSeed.map((item) => ({ path: item.path, label: item.label.de })) },
    overrideAccess: true,
  })
  for (const locale of ['en', 'fr'] as const) {
    await payload.updateGlobal({
      slug: 'navigation',
      locale,
      data: {
        mainMenu: (nav.mainMenu ?? []).map((row, i) => ({ id: row.id, path: row.path, label: navigationSeed[i].label[locale] })),
      },
      overrideAccess: true,
    })
  }

  return result
}
