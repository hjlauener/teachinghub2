import type { CollectionConfig } from 'payload'

import { editorsOnly } from '@/access/roles'
import { l } from '@/lib/admin'

export const migrationGroup = l('Migration Altsite', 'Legacy migration', 'Migration ancien site')

/**
 * Stand jeder Altsite-Seite beim letzten Import („Basis“ für den 3-Wege-Vergleich, Plan Abschnitt 6).
 * Wird nur vom Importer geschrieben (overrideAccess); Redaktion darf lesen.
 */
export const LegacySnapshots: CollectionConfig = {
  slug: 'legacy-snapshots',
  labels: { singular: l('Import-Stand', 'Import snapshot', "État d'import"), plural: l('Import-Stände', 'Import snapshots', "États d'import") },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'targetCollection', 'legacyDate', 'importedAt'],
    group: migrationGroup,
  },
  access: {
    read: editorsOnly,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'path', type: 'text', required: true, unique: true, index: true },
    {
      name: 'targetCollection',
      type: 'select',
      required: true,
      options: ['articles', 'methods', 'tools', 'pages', 'news'].map((value) => ({ value, label: value })),
    },
    { name: 'docId', type: 'number', index: true },
    { name: 'legacyUrl', type: 'text' },
    { name: 'legacyDate', type: 'date' },
    { name: 'hash', type: 'text', admin: { description: 'Inhalts-Hash der Altsite-Seite' } },
    { name: 'importedAt', type: 'date' },
    { name: 'data', type: 'json', admin: { description: 'Feldwerte (DE) wie importiert' } },
    { name: 'fieldHashes', type: 'json', admin: { description: 'Hash je Feld – erkennt lokale Änderungen' } },
  ],
}
