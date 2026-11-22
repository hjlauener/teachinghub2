import type { CollectionConfig } from 'payload'

import { pathField, seoField, taxonomyField } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

import { editorialDefaults } from './shared'

/**
 * Unterthema = Landingpage Ebene 2 („Arbeitsseite“) mit 9 festen Kapiteln.
 * Regel: genau ein Kernthema als Zuhause (Themenstruktur_gesamt.md, Regel 2).
 */
export const Subtopics: CollectionConfig = {
  slug: C.subtopics,
  ...editorialDefaults,
  labels: {
    singular: l('Unterthema', 'Subtopic', 'Sous-thème'),
    plural: l('Unterthemen', 'Subtopics', 'Sous-thèmes'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'topic', '_status'],
    group: groups.topics,
  },
  defaultSort: ['topic', 'order'],
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
    { name: 'summary', type: 'textarea', label: l('Worum es geht (ein Satz)', 'What it is about (one sentence)', 'De quoi il s’agit (une phrase)'), localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: l('1 Worum geht es?', '1 What is it about?', '1 De quoi s’agit-il ?'),
          fields: [{ name: 'whatIsIt', type: 'richText', label: l('Definition (3–4 Sätze)', 'Definition (3–4 sentences)', 'Définition (3–4 phrases)'), localized: true, required: true }],
        },
        {
          label: l('2 Wann lohnt es sich?', '2 When is it worth it?', '2 Quand est-ce utile ?'),
          fields: [{ name: 'whenUseful', type: 'richText', label: l('Eignung und Grenzen', 'Suitability and limits', 'Pertinence et limites'), localized: true, required: true }],
        },
        {
          label: l('3 So gehen Sie vor', '3 How to proceed', '3 Comment procéder'),
          fields: [
            {
              name: 'steps',
              type: 'array',
              label: l('Schritte', 'Steps', 'Étapes'),
              minRows: 4,
              maxRows: 6,
              fields: [
                { name: 'title', type: 'text', label: l('Schritt', 'Step', 'Étape'), required: true, localized: true },
                { name: 'text', type: 'textarea', label: l('Beschreibung', 'Description', 'Description'), localized: true },
              ],
            },
          ],
        },
        {
          label: l('4 Passende Methoden', '4 Suitable methods', '4 Méthodes adaptées'),
          fields: [
            {
              name: 'methods',
              type: 'array',
              label: l('Methoden aus dem Methodenkompass', 'Methods from the method compass', 'Méthodes de la boussole'),
              fields: [
                { name: 'method', type: 'relationship', relationTo: C.methods, required: true, label: l('Methode', 'Method', 'Méthode') },
                { name: 'purposeHere', type: 'text', label: l('Wofür hier', 'Used here for', 'Utilisée ici pour'), localized: true },
              ],
            },
          ],
        },
        {
          label: l('5 Tools', '5 Tools', '5 Outils'),
          fields: [
            {
              name: 'tools',
              type: 'array',
              label: l('Tools an der UniBE', 'Tools at UniBE', "Outils à l'UniBE"),
              fields: [
                { name: 'tool', type: 'relationship', relationTo: C.tools, label: l('Tool', 'Tool', 'Outil') },
                { name: 'note', type: 'text', label: l('Wofür', 'For what', 'Pour quoi'), localized: true },
              ],
            },
          ],
        },
        {
          label: l('6 Aus der Praxis', '6 From practice', '6 De la pratique'),
          fields: [
            {
              name: 'practice',
              type: 'group',
              label: l('Beispiel einer UniBE-Lehrveranstaltung', 'Example of a UniBE course', "Exemple d'un cours UniBE"),
              fields: [
                { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), localized: true },
                { name: 'text', type: 'textarea', label: l('Beschreibung', 'Description', 'Description'), localized: true },
                { name: 'url', type: 'text', label: 'URL' },
              ],
            },
          ],
        },
        {
          label: l('7 Stolpersteine', '7 Pitfalls', '7 Écueils'),
          fields: [
            {
              name: 'pitfalls',
              type: 'array',
              label: l('Typische Probleme mit Lösung', 'Typical problems and solutions', 'Problèmes typiques et solutions'),
              minRows: 3,
              maxRows: 4,
              fields: [
                { name: 'problem', type: 'text', label: l('Problem', 'Problem', 'Problème'), required: true, localized: true },
                { name: 'solution', type: 'textarea', label: l('Lösung', 'Solution', 'Solution'), required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: l('8 Unterstützung', '8 Support', '8 Soutien'),
          fields: [{ name: 'support', type: 'richText', label: l('Unterstützung und Weiterlesen', 'Support and further reading', 'Soutien et lectures'), localized: true, required: true }],
        },
        {
          label: l('9 Siehe auch', '9 See also', '9 Voir aussi'),
          fields: [
            {
              name: 'seeAlso',
              type: 'relationship',
              label: l('Verwandte Unterthemen', 'Related subtopics', 'Sous-thèmes liés'),
              relationTo: C.subtopics,
              hasMany: true,
            },
          ],
        },
      ],
    },
    // Seitenleiste
    {
      name: 'topic',
      type: 'relationship',
      label: l('Kernthema (Zuhause)', 'Core topic (home)', 'Thème principal'),
      relationTo: C.topics,
      required: true,
      hasMany: false,
      admin: { position: 'sidebar' },
    },
    taxonomyField('journeyPhase', 'rubrik', l('Journey-Phase', 'Journey phase', 'Étape du parcours'), {
      hasMany: false,
      admin: { position: 'sidebar' },
    }),
    { name: 'order', type: 'number', label: l('Reihenfolge', 'Order', 'Ordre'), defaultValue: 0, admin: { position: 'sidebar' } },
    pathField(l('z. B. /themen/digitale_und_hybride_lehre/flipped_classroom', 'e.g. /themen/…/flipped_classroom', 'p. ex. /themen/…/flipped_classroom')),
    seoField,
  ],
}
