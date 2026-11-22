import type { Field, Tab } from 'payload'

import { contentBlocks } from '@/blocks'
import { l } from '@/lib/admin'
import { C } from '@/lib/slugs'

/**
 * Feste Abschnitte der Altsite-Vorlage für Artikel, Methoden und Tools (Analyse 4):
 * Was steckt dahinter · Einblicke · Stolperfrei durchstarten · Ressourcen · Kontakt.
 * Feste Abschnitte statt freier Seiten erleichtern Übersetzung, KI-Index und einheitliche Darstellung.
 */
export function articleSectionTabs(extra: { before?: Tab[]; afterResources?: Field[] } = {}): Tab[] {
  return [
    ...(extra.before ?? []),
    {
      label: l('Was steckt dahinter', 'What it is about', 'De quoi s’agit-il'),
      fields: [
        {
          name: 'whatIsBehind',
          type: 'richText',
          label: l('Was steckt dahinter – und wofür ist es gut?', 'What is behind it – and what is it good for?', 'De quoi s’agit-il – et à quoi cela sert-il ?'),
          localized: true,
        },
      ],
    },
    {
      label: l('Einblicke', 'Insights', 'Aperçus'),
      fields: [
        {
          name: 'insights',
          type: 'array',
          label: l('Einblicke (Praxisbeispiele)', 'Insights (practice examples)', 'Aperçus (exemples)'),
          labels: { singular: l('Einblick', 'Insight', 'Aperçu'), plural: l('Einblicke', 'Insights', 'Aperçus') },
          fields: [
            { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), localized: true, required: true },
            { name: 'content', type: 'richText', label: l('Inhalt', 'Content', 'Contenu'), localized: true },
          ],
        },
      ],
    },
    {
      label: l('Stolperfrei durchstarten', 'Getting started', 'Bien démarrer'),
      fields: [{ name: 'gettingStarted', type: 'richText', label: l('Stolperfrei durchstarten', 'Getting started smoothly', 'Démarrer sans embûches'), localized: true }],
    },
    {
      label: l('Ressourcen', 'Resources', 'Ressources'),
      fields: [
        {
          name: 'resources',
          type: 'group',
          label: l('Ressourcen', 'Resources', 'Ressources'),
          fields: [
            { name: 'literature', type: 'richText', label: l('Literatur', 'Literature', 'Littérature'), localized: true },
            { name: 'guides', type: 'richText', label: l('Anleitungen & Schulungsmaterial', 'Guides & training material', 'Guides & matériel de formation'), localized: true },
            { name: 'support', type: 'richText', label: l('Beratung & Service', 'Advice & services', 'Conseil & services'), localized: true },
          ],
        },
        ...(extra.afterResources ?? []),
      ],
    },
    {
      label: l('Kontakt & Bausteine', 'Contact & blocks', 'Contact & blocs'),
      fields: [
        {
          name: 'contacts',
          type: 'relationship',
          label: l('Kontakt', 'Contact', 'Contact'),
          relationTo: C.contacts,
          hasMany: true,
        },
        {
          name: 'blocks',
          type: 'blocks',
          label: l('Weitere Bausteine', 'Further blocks', 'Blocs supplémentaires'),
          blocks: contentBlocks,
        },
      ],
    },
  ]
}

/** Titel und Lead (Untertitel, auf der Altsite = `description`). */
export const titleAndLead: Field[] = [
  { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
  {
    name: 'lead',
    type: 'textarea',
    label: l('Lead (Untertitel)', 'Lead (subtitle)', 'Chapeau (sous-titre)'),
    localized: true,
    maxLength: 300,
  },
]
