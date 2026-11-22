import type { CollectionConfig } from 'payload'

import { articleSectionTabs, titleAndLead } from '@/fields/articleSections'
import { legacyField, pathField, seoField, taxonomyField } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'
import { validateUrl } from '@/lib/validation'

import { editorialDefaults } from './shared'

/** Tools (15) mit Unterseiten wie FAQ, Anleitungen und Anträgen (14). */
export const Tools: CollectionConfig = {
  slug: C.tools,
  ...editorialDefaults,
  labels: {
    singular: l('Tool', 'Tool', 'Outil'),
    plural: l('Tools', 'Tools', 'Outils'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'path', '_status'],
    group: groups.content,
    listSearchableFields: ['title', 'path'],
  },
  fields: [
    ...titleAndLead,
    {
      type: 'tabs',
      tabs: articleSectionTabs({
        before: [
          {
            label: l('Zugang & Zuordnung', 'Access & classification', 'Accès & classement'),
            fields: [
              {
                name: 'accessUrl',
                type: 'text',
                label: l('Zugang / Login', 'Access / login', 'Accès / connexion'),
                validate: (value: unknown) => validateUrl(value),
              },
              {
                name: 'requestUrl',
                type: 'text',
                label: l('Antrag / Bestellformular', 'Request form', 'Formulaire de demande'),
                validate: (value: unknown) => validateUrl(value),
              },
              taxonomyField('rubrics', 'rubrik', l('Rubriken', 'Sections', 'Rubriques')),
              taxonomyField('themes', 'thema', l('Themen', 'Themes', 'Thèmes')),
              {
                name: 'parent',
                type: 'relationship',
                label: l('Übergeordnetes Tool', 'Parent tool', 'Outil parent'),
                relationTo: C.tools,
                admin: { description: l('Nur für Unterseiten wie „Zoom FAQ“.', 'Only for sub-pages like “Zoom FAQ”.', 'Seulement pour les sous-pages.') },
              },
            ],
          },
          {
            label: 'FAQ',
            fields: [
              {
                name: 'faq',
                type: 'array',
                label: 'FAQ',
                fields: [
                  { name: 'question', type: 'text', label: l('Frage', 'Question', 'Question'), required: true, localized: true },
                  { name: 'answer', type: 'richText', label: l('Antwort', 'Answer', 'Réponse'), required: true, localized: true },
                ],
              },
            ],
          },
        ],
      }),
    },
    pathField(l('z. B. /journey_der_lehre/tools/zoom', 'e.g. /journey_der_lehre/tools/zoom', 'p. ex. /journey_der_lehre/tools/zoom')),
    seoField,
    legacyField,
  ],
}
