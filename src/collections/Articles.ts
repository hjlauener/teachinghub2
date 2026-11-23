import type { CollectionConfig } from 'payload'

import { articleSectionTabs, titleAndLead } from '@/fields/articleSections'
import { legacyField, pathField, seoField, taxonomyField } from '@/fields/common'
import { buildSearchText, SEARCH_FIELDS, searchTextField } from '@/fields/searchText'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

import { editorialDefaults } from './shared'

/**
 * Artikel der Journey der Lehre (≈ 145) und Angebote wie Beratung, Kurse, Förderprogramme (≈ 30).
 * Zuordnung zu Rubriken und Themen ist n:m (Analyse 5.2).
 */
export const Articles: CollectionConfig = {
  slug: C.articles,
  ...editorialDefaults,
  hooks: { beforeChange: [buildSearchText(SEARCH_FIELDS)] },
  labels: {
    singular: l('Artikel', 'Article', 'Article'),
    plural: l('Artikel', 'Articles', 'Articles'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'path', '_status', 'updatedAt'],
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
            label: l('Zuordnung', 'Classification', 'Classement'),
            fields: [
              {
                name: 'kind',
                type: 'select',
                label: l('Art', 'Kind', 'Type'),
                defaultValue: 'article',
                required: true,
                options: [
                  { value: 'article', label: l('Artikel', 'Article', 'Article') },
                  { value: 'offer', label: l('Angebot (Beratung, Kurs, Förderung, Veranstaltung)', 'Offer (advice, course, funding, event)', 'Offre (conseil, cours, soutien, événement)') },
                  { value: 'archive', label: l('Archiv-/Listenseite', 'Archive/list page', "Page d'archive/liste") },
                ],
              },
              taxonomyField('rubrics', 'rubrik', l('Rubriken', 'Sections', 'Rubriques')),
              taxonomyField('themes', 'thema', l('Themen', 'Themes', 'Thèmes')),
              {
                name: 'parent',
                type: 'relationship',
                label: l('Übergeordneter Artikel', 'Parent article', 'Article parent'),
                relationTo: C.articles,
                admin: { description: l('Nur für Unterseiten, z. B. Fragetypen unter „Prüfungsfragen“.', 'Only for sub-pages.', 'Seulement pour les sous-pages.') },
              },
            ],
          },
        ],
      }),
    },
    pathField(),
    seoField,
    searchTextField,
    legacyField,
  ],
}
