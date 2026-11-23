import type { CollectionBeforeChangeHook, Field } from 'payload'

import { valueToText } from '@/migration/text'

/**
 * Verstecktes Volltextfeld je Sprache: Titel, Lead und Abschnitte als reiner Text.
 * Grundlage der Facettensuche (Entscheidung 7.3); wird beim Speichern automatisch gefüllt.
 */
export const searchTextField: Field = {
  name: 'searchText',
  type: 'textarea',
  localized: true,
  admin: { hidden: true, readOnly: true },
}

export function buildSearchText(fields: string[]): CollectionBeforeChangeHook {
  return ({ data, originalDoc }) => {
    const merged = { ...(originalDoc ?? {}), ...data } as Record<string, unknown>
    const text = fields
      .map((f) => valueToText(merged[f]))
      .filter(Boolean)
      .join('\n')
      .replace(/\s+/g, ' ')
      .trim()
    return { ...data, searchText: text.slice(0, 20000) }
  }
}

export const SEARCH_FIELDS = ['title', 'lead', 'whatIsBehind', 'insights', 'gettingStarted', 'resources']
