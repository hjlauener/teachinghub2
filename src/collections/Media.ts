import type { CollectionConfig } from 'payload'

import { anyone, editorsOnly, editorsOrTranslatorsInTargetLocale } from '@/access/roles'
import { legacyField } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

/** Bilder und Dokumente (PDF/Office) – Kopien aus der Altsite tragen `legacy` (Entscheidung 3.1). */
export const Media: CollectionConfig = {
  slug: C.media,
  labels: { singular: l('Datei', 'File', 'Fichier'), plural: l('Mediathek', 'Media library', 'Médiathèque') },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    group: groups.structure,
  },
  access: {
    read: anyone,
    create: editorsOnly,
    update: editorsOrTranslatorsInTargetLocale,
    delete: editorsOnly,
  },
  fields: [
    {
      // Alt-Text ist Pflicht und übersetzbar (Entscheidung 9.1, WCAG 2.1 AA)
      name: 'alt',
      type: 'text',
      label: l('Alternativtext', 'Alt text', 'Texte alternatif'),
      required: true,
      localized: true,
    },
    { name: 'credit', type: 'text', label: l('Quelle / Rechte', 'Source / rights', 'Source / droits') },
    legacyField,
  ],
  upload: {
    // Keine SVG: sie können Skripte enthalten und liefen auf der eigenen Domain (Review Sicherheit)
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.*',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
    ],
  },
}
