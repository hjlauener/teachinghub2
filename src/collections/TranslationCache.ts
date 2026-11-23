import type { CollectionConfig } from 'payload'

import { editorsOnly } from '@/access/roles'
import { groups, l } from '@/lib/admin'

/**
 * Cache der maschinellen Übersetzungen (Entscheidung 4.3): ein Eintrag pro Feld, Sprache und DE-Stand.
 * Ändert sich der deutsche Text, entsteht ein neuer Schlüssel – alte Einträge werden nicht mehr gelesen.
 */
export const TranslationCache: CollectionConfig = {
  slug: 'translation-cache',
  labels: { singular: l('Maschinelle Übersetzung', 'Machine translation', 'Traduction automatique'), plural: l('Übersetzungs-Cache', 'Translation cache', 'Cache de traduction') },
  admin: { useAsTitle: 'key', group: groups.structure, defaultColumns: ['key', 'provider', 'createdAt'] },
  access: { read: editorsOnly, create: () => false, update: () => false, delete: editorsOnly },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true, index: true },
    { name: 'value', type: 'json' },
    { name: 'provider', type: 'text' },
  ],
}
