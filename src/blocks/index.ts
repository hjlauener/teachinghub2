import type { Block } from 'payload'

import { linkFields } from '@/fields/common'
import { l } from '@/lib/admin'
import { isEmbeddableVideo } from '@/lib/video'

/** Freie Bausteine aus den Altsite-Vorlagen (Analyse 4: Infobox, Zweispalter, Video, Alertbox, Linkliste). */

export const InfoboxBlock: Block = {
  slug: 'infobox',
  labels: { singular: 'Infobox', plural: 'Infoboxen' },
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), localized: true },
    { name: 'content', type: 'richText', label: l('Inhalt', 'Content', 'Contenu'), localized: true, required: true },
  ],
}

export const TwoColumnsBlock: Block = {
  slug: 'twoColumns',
  labels: { singular: l('Zweispalter', 'Two columns', 'Deux colonnes'), plural: l('Zweispalter', 'Two columns', 'Deux colonnes') },
  fields: [
    { name: 'left', type: 'richText', label: l('Links', 'Left', 'Gauche'), localized: true },
    { name: 'right', type: 'richText', label: l('Rechts', 'Right', 'Droite'), localized: true },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'platform',
      type: 'select',
      label: l('Plattform', 'Platform', 'Plateforme'),
      defaultValue: 'tobira',
      options: [
        { value: 'tobira', label: 'Tobira' },
        { value: 'opencast', label: 'Opencast' },
        { value: 'other', label: l('Andere', 'Other', 'Autre') },
      ],
    },
    // Videos werden eingebettet, nicht kopiert (Entscheidung 3.1)
    {
      name: 'url',
      type: 'text',
      label: l('Einbettungs-URL', 'Embed URL', "URL d'intégration"),
      required: true,
      admin: {
        description: l(
          'Nur https von Tobira/Opencast (unibe.ch), YouTube (nocookie), Vimeo oder SWITCHtube; andere Adressen erscheinen als Link.',
          'https only from Tobira/Opencast (unibe.ch), YouTube (nocookie), Vimeo or SWITCHtube; other addresses are shown as a link.',
          'https uniquement depuis Tobira/Opencast (unibe.ch), YouTube (nocookie), Vimeo ou SWITCHtube ; les autres adresses sont affichées comme lien.',
        ),
      },
      // Bei Eingaben im CMS prüfen; der Import der Altsite (ohne Benutzer:in) übernimmt alles und zeigt Fremdes als Link
      validate: (value: unknown, { req }: { req: { user?: unknown } }) =>
        !req.user || isEmbeddableVideo(value) || 'Diese Video-Plattform ist nicht freigegeben (siehe Hinweis).',
    },
    { name: 'title', type: 'text', label: l('Titel (für Screenreader)', 'Title (for screen readers)', "Titre (lecteurs d'écran)"), localized: true, required: true },
    { name: 'caption', type: 'textarea', label: l('Legende', 'Caption', 'Légende'), localized: true },
  ],
}

export const AlertboxBlock: Block = {
  slug: 'alertbox',
  labels: { singular: l('Hinweisbox', 'Alert box', "Boîte d'alerte"), plural: l('Hinweisboxen', 'Alert boxes', "Boîtes d'alerte") },
  fields: [
    {
      name: 'variant',
      type: 'select',
      label: l('Art', 'Variant', 'Type'),
      defaultValue: 'info',
      options: [
        { value: 'info', label: 'Info' },
        { value: 'warning', label: l('Warnung', 'Warning', 'Avertissement') },
        { value: 'success', label: l('Erfolg', 'Success', 'Succès') },
      ],
    },
    { name: 'content', type: 'richText', label: l('Inhalt', 'Content', 'Contenu'), localized: true, required: true },
  ],
}

export const LinkListBlock: Block = {
  slug: 'linkList',
  labels: { singular: l('Linkliste', 'Link list', 'Liste de liens'), plural: l('Linklisten', 'Link lists', 'Listes de liens') },
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), localized: true },
    {
      name: 'links',
      type: 'array',
      label: 'Links',
      minRows: 1,
      fields: [{ name: 'label', type: 'text', label: l('Linktext', 'Link text', 'Texte du lien'), required: true, localized: true }, ...linkFields()],
    },
  ],
}

export const contentBlocks: Block[] = [InfoboxBlock, TwoColumnsBlock, VideoBlock, AlertboxBlock, LinkListBlock]
