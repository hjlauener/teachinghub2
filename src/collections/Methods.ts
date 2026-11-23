import type { CollectionConfig } from 'payload'

import { articleSectionTabs, titleAndLead } from '@/fields/articleSections'
import { legacyField, pathField, seoField, taxonomyField } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

import { editorialDefaults } from './shared'

/** Methodenkompass (67 Methoden, Filter: Zweck, Modalität, Sozialform, Aufwand – Analyse 5.1). */
export const Methods: CollectionConfig = {
  slug: C.methods,
  ...editorialDefaults,
  labels: {
    singular: l('Methode', 'Method', 'Méthode'),
    plural: l('Methoden', 'Methods', 'Méthodes'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'effort', 'path', '_status'],
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
            label: l('Methodenkompass', 'Method compass', 'Boussole'),
            fields: [
              taxonomyField('purposes', 'zweck', l('Zweck', 'Purpose', 'Objectif'), { required: true }),
              taxonomyField('modalities', 'modalitaet', l('Modalität', 'Modality', 'Modalité'), { required: true }),
              taxonomyField('socialForms', 'sozialform', l('Sozialform', 'Social form', 'Forme sociale'), { required: true }),
              taxonomyField('effort', 'aufwand', l('Aufwand', 'Effort', 'Effort'), { hasMany: false, required: true }),
            ],
          },
        ],
        afterResources: [
          {
            name: 'alternatives',
            type: 'array',
            label: l('Alternative Methoden', 'Alternative methods', 'Méthodes alternatives'),
            labels: { singular: l('Alternative', 'Alternative', 'Alternative'), plural: l('Alternativen', 'Alternatives', 'Alternatives') },
            fields: [
              { name: 'method', type: 'relationship', relationTo: C.methods, required: true, label: l('Methode', 'Method', 'Méthode') },
              {
                name: 'note',
                type: 'textarea',
                label: l('Unterschied / wann besser geeignet', 'Difference / when better suited', 'Différence / quand préférable'),
                localized: true,
              },
            ],
          },
        ],
      }),
    },
    pathField(l('z. B. /methodenkompass/think_pair_share', 'e.g. /methodenkompass/think_pair_share', 'p. ex. /methodenkompass/think_pair_share')),
    seoField,
    legacyField,
  ],
}
