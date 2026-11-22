import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  type FeatureProviderServer,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

import { l } from './admin'

/**
 * Video-Einbettung im Fliesstext (Tobira/Opencast/YouTube). Felder ohne `localized`,
 * weil das umgebende Rich-Text-Feld bereits pro Sprache gespeichert wird.
 */
export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  labels: { singular: l('Video', 'Video', 'Vidéo'), plural: l('Videos', 'Videos', 'Vidéos') },
  fields: [
    { name: 'url', type: 'text', label: l('Einbettungs-URL', 'Embed URL', "URL d'intégration"), required: true },
    { name: 'title', type: 'text', label: l('Titel (für Screenreader)', 'Title (for screen readers)', "Titre (lecteurs d'écran)") },
  ],
}

/** Editor-Features: Payload-Standard plus Tabellen (536 auf der Altsite) und Video-Einbettungen (59). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editorFeatures = ({ defaultFeatures }: { defaultFeatures: FeatureProviderServer<any, any, any>[] }) => [
  ...defaultFeatures,
  EXPERIMENTAL_TableFeature(),
  BlocksFeature({ blocks: [VideoEmbedBlock] }),
]

export const editor = lexicalEditor({ features: editorFeatures })
