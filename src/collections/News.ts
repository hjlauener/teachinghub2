import type { CollectionConfig } from 'payload'

import { legacyField, linkFields } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

import { editorialDefaults } from './shared'

/** News und Teaser der Startseite – viele verlinken extern (uniAKTUELL, ILIAS-Blog). */
export const News: CollectionConfig = {
  slug: C.news,
  ...editorialDefaults,
  labels: { singular: l('News', 'News item', 'Actualité'), plural: l('News', 'News', 'Actualités') },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'placement', 'date', '_status'],
    group: groups.content,
  },
  defaultSort: '-date',
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
    { name: 'lead', type: 'textarea', label: l('Lead', 'Lead', 'Chapeau'), localized: true },
    { name: 'body', type: 'richText', label: l('Text (nur bei eigener Detailseite)', 'Body (only for own detail page)', 'Texte (page de détail)'), localized: true },
    { name: 'image', type: 'upload', relationTo: C.media, label: l('Bild', 'Image', 'Image') },
    {
      name: 'link',
      type: 'group',
      label: l('Link', 'Link', 'Lien'),
      fields: [{ name: 'label', type: 'text', label: l('Linktext', 'Link text', 'Texte du lien'), localized: true }, ...linkFields()],
    },
    // Seitenleiste
    {
      name: 'placement',
      type: 'select',
      label: l('Platzierung Startseite', 'Home page placement', "Placement page d'accueil"),
      defaultValue: 'news',
      options: [
        { value: 'focus', label: l('Aktuelles im Fokus', 'In focus', 'À la une') },
        { value: 'news', label: l('Weitere News', 'More news', 'Autres actualités') },
        { value: 'framework', label: l('Rahmenbedingungen', 'Framework', 'Cadre') },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'date', type: 'date', label: l('Datum', 'Date', 'Date'), required: true, defaultValue: () => new Date().toISOString(), admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'visibleUntil', type: 'date', label: l('Sichtbar bis', 'Visible until', "Visible jusqu'au"), admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'path',
      type: 'text',
      label: l('Pfad der Detailseite (optional)', 'Detail page path (optional)', 'Chemin de la page de détail'),
      unique: true,
      admin: { position: 'sidebar', description: 'z. B. /ablage/news/sub_motion' },
    },
    legacyField,
  ],
}
