import { type CollectionConfig, ValidationError } from 'payload'

import { anyone, editorsOnly, editorsOrTranslatorsInTargetLocale } from '@/access/roles'
import { groups, l } from '@/lib/admin'
import { C, taxonomyTypeLabels, taxonomyTypes } from '@/lib/slugs'
import { slugify } from '@/lib/validation'

/**
 * Eine Collection für alle Schlagwortlisten (Rubrik, Thema, Methoden-Kategorien, Link-Labels).
 * Relationen filtern über `type` (siehe `taxonomyField`).
 */
export const Taxonomies: CollectionConfig = {
  slug: C.taxonomies,
  labels: {
    singular: l('Schlagwort', 'Taxonomy term', 'Mot-clé'),
    plural: l('Schlagwörter', 'Taxonomy terms', 'Mots-clés'),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'order', 'parent'],
    group: groups.structure,
    listSearchableFields: ['name', 'slug'],
  },
  defaultSort: ['type', 'order'],
  access: {
    read: anyone,
    create: editorsOnly,
    update: editorsOrTranslatorsInTargetLocale,
    delete: editorsOnly,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: l('Typ', 'Type', 'Type'),
      required: true,
      index: true,
      options: taxonomyTypes.map((value) => ({ value, label: taxonomyTypeLabels[value] })),
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      type: 'text',
      label: l('Name', 'Name', 'Nom'),
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: l('Kurzname (URL)', 'Slug', 'Identifiant'),
      required: true,
      index: true,
      admin: { description: l('Wird aus dem deutschen Namen erzeugt.', 'Generated from the German name.', 'Généré à partir du nom allemand.') },
      hooks: {
        beforeValidate: [
          ({ value, siblingData, req }) => {
            if (value) return value
            const name = siblingData?.name
            return typeof name === 'string' && (!req.locale || req.locale === 'de') ? slugify(name) : value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: l('Beschreibung', 'Description', 'Description'),
      localized: true,
      admin: { description: l('z. B. Text des Themen-Tabs auf der Rubrikseite', 'e.g. text of the theme tab', "p. ex. texte de l'onglet") },
    },
    {
      name: 'parent',
      type: 'relationship',
      label: l('Gehört zu Rubrik', 'Belongs to section', 'Appartient à la rubrique'),
      relationTo: C.taxonomies,
      filterOptions: { type: { equals: 'rubrik' } },
      admin: { condition: (data) => data?.type === 'thema', position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      label: l('Reihenfolge', 'Order', 'Ordre'),
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'legacyKey',
      type: 'text',
      label: l('Schlüssel Altsite', 'Legacy key', 'Clé ancien site'),
      admin: { position: 'sidebar', readOnly: true, description: 'z. B. LEHREKONZIPIEREN1758245' },
    },
  ],
  hooks: {
    beforeValidate: [
      // Slug ist pro Typ eindeutig
      async ({ data, originalDoc, req }) => {
        const type = data?.type ?? originalDoc?.type
        const slug = data?.slug ?? originalDoc?.slug
        if (!type || !slug) return data
        const existing = await req.payload.find({
          collection: C.taxonomies,
          where: { and: [{ type: { equals: type } }, { slug: { equals: slug } }] },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        })
        const clash = existing.docs.find((doc) => doc.id !== originalDoc?.id)
        if (clash) {
          throw new ValidationError({
            collection: C.taxonomies,
            errors: [{ path: 'slug', message: `Schlagwort „${slug}“ existiert bereits für Typ „${type}“.` }],
          })
        }
        return data
      },
    ],
  },
}
