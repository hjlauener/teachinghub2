import type { Block, CollectionConfig } from 'payload'

import { contentBlocks } from '@/blocks'
import { legacyField, linkFields, pathField, seoField, taxonomyField } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

import { editorialDefaults } from './shared'

/** Seiten-Bausteine, die nur auf Übersichtsseiten vorkommen. */
const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Texte' },
  fields: [{ name: 'content', type: 'richText', label: l('Inhalt', 'Content', 'Contenu'), localized: true, required: true }],
}

const TeaserListBlock: Block = {
  slug: 'teaserList',
  labels: { singular: l('Teaser-Liste', 'Teaser list', 'Liste de teasers'), plural: l('Teaser-Listen', 'Teaser lists', 'Listes de teasers') },
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), localized: true },
    {
      name: 'source',
      type: 'radio',
      label: l('Quelle', 'Source', 'Source'),
      defaultValue: 'news',
      options: [
        { value: 'news', label: l('Aktuelle News (automatisch)', 'Current news (automatic)', 'Actualités (automatique)') },
        { value: 'manual', label: l('Manuell', 'Manual', 'Manuel') },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: l('Teaser', 'Teasers', 'Teasers'),
      admin: { condition: (_, sibling) => sibling?.source === 'manual' },
      fields: [
        { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
        { name: 'text', type: 'textarea', label: l('Text', 'Text', 'Texte'), localized: true },
        { name: 'image', type: 'upload', relationTo: C.media, label: l('Bild', 'Image', 'Image') },
        ...linkFields(),
      ],
    },
  ],
}

/** Rubrikseite: Tabs „Etappen“ je Thema mit automatisch gefilterten Artikelkarten (Entscheidung 7.6a). */
const RubricTabsBlock: Block = {
  slug: 'rubricTabs',
  labels: { singular: l('Rubrik-Tabs', 'Section tabs', 'Onglets de rubrique'), plural: l('Rubrik-Tabs', 'Section tabs', 'Onglets de rubrique') },
  fields: [
    taxonomyField('rubric', 'rubrik', l('Rubrik', 'Section', 'Rubrique'), { hasMany: false, required: true }),
    {
      name: 'heading',
      type: 'text',
      label: l('Überschrift', 'Heading', 'Titre'),
      localized: true,
      defaultValue: 'Etappen',
    },
  ],
}

/** Journey der Lehre: Titel + aufgeklapptes Journey-Menü wie heute (Entscheidung 7.1). */
const JourneyMenuBlock: Block = {
  slug: 'journeyMenu',
  labels: { singular: l('Journey-Menü', 'Journey menu', 'Menu du parcours'), plural: l('Journey-Menüs', 'Journey menus', 'Menus du parcours') },
  fields: [{ name: 'showThemes', type: 'checkbox', label: l('Themen anzeigen', 'Show themes', 'Afficher les thèmes'), defaultValue: true }],
}

const ContactListBlock: Block = {
  slug: 'contactList',
  labels: { singular: l('Kontaktliste', 'Contact list', 'Liste de contacts'), plural: l('Kontaktlisten', 'Contact lists', 'Listes de contacts') },
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), localized: true },
    { name: 'contacts', type: 'relationship', relationTo: C.contacts, hasMany: true, required: true, label: l('Kontakte', 'Contacts', 'Contacts') },
  ],
}

/** Themenübersicht „Themen der Lehre“ mit Ansichten Nach Thema / Themen × Journey (Plan Abschnitt 5). */
const TopicsOverviewBlock: Block = {
  slug: 'topicsOverview',
  labels: { singular: l('Themenübersicht', 'Topics overview', 'Aperçu des thèmes'), plural: l('Themenübersichten', 'Topics overviews', 'Aperçus des thèmes') },
  fields: [
    {
      name: 'defaultView',
      type: 'select',
      label: l('Startansicht', 'Default view', 'Vue par défaut'),
      defaultValue: 'themen',
      options: [
        { value: 'themen', label: l('Nach Thema', 'By topic', 'Par thème') },
        { value: 'matrix', label: l('Themen × Journey', 'Topics × journey', 'Thèmes × parcours') },
      ],
    },
  ],
}

/** Übrige Seiten: Startseite, Journey-Übersicht, Rubrikseiten, Über uns, Themenübersicht, Archivlisten. */
export const Pages: CollectionConfig = {
  slug: C.pages,
  ...editorialDefaults,
  labels: {
    singular: l('Seite', 'Page', 'Page'),
    plural: l('Seiten', 'Pages', 'Pages'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', '_status', 'updatedAt'],
    group: groups.content,
  },
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
    { name: 'intro', type: 'richText', label: l('Einleitung', 'Introduction', 'Introduction'), localized: true },
    {
      name: 'layout',
      type: 'blocks',
      label: l('Inhalt', 'Content', 'Contenu'),
      blocks: [RichTextBlock, TeaserListBlock, RubricTabsBlock, JourneyMenuBlock, ContactListBlock, TopicsOverviewBlock, ...contentBlocks],
    },
    pathField(l('Startseite: /', 'Home page: /', "Page d'accueil : /")),
    seoField,
    legacyField,
  ],
}
