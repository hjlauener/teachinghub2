import { type CollectionBeforeValidateHook, type CollectionConfig, type Validate, ValidationError } from 'payload'

import { annotatedLinksField, pathField, seoField, taxonomyField } from '@/fields/common'
import { groups, l } from '@/lib/admin'
import { validateCountWhenLive, validateRequiredWhenLive } from '@/lib/validation'
import { C } from '@/lib/slugs'

import { editorialDefaults } from './shared'

const liveRequired: Validate = (value, { data }) => validateRequiredWhenLive(value, data as { pageStatus?: unknown })
const liveCount =
  (min: number, max: number): Validate =>
  (value, { data }) =>
    validateCountWhenLive(value, data as { pageStatus?: unknown }, min, max)

/** Redaktionsregeln (Konzept): ≥ 5 Journey-Seiten, 3–8 Unterthemen – geprüft beim Live-Schalten. */
const topicRules: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  const merged = { ...(originalDoc ?? {}), ...(data ?? {}) } as Record<string, unknown>
  const pages = Array.isArray(merged.journeyPages) ? merged.journeyPages.length : 0
  const result = { ...data, journeyPageCount: pages }
  if (merged.pageStatus !== 'live' || merged._status === 'draft') return result
  const errors: { path: string; message: string }[] = []
  if (pages < 5) errors.push({ path: 'journeyPages', message: `Zu dünn für eine eigene Themenseite: ${pages} von mindestens 5 Seiten in der Journey.` })
  if (originalDoc?.id) {
    const { totalDocs } = await req.payload.count({ collection: C.subtopics, where: { topic: { equals: originalDoc.id } }, overrideAccess: true, req })
    if (totalDocs < 3 || totalDocs > 8) errors.push({ path: 'pageStatus', message: `Ein Kernthema braucht 3–8 Unterthemen (aktuell ${totalDocs}).` })
  }
  if (errors.length) throw new ValidationError({ collection: C.topics, errors })
  return result
}

/**
 * Kernthema = Landingpage Ebene 1 (Konzept: Landingpage_Kapitel.md, Themenstruktur_gesamt.md).
 * „Verteilseite“ mit 9 festen Kapiteln, vor allem kommentierte Links.
 * Mindest-/Höchstzahlen gelten beim Publizieren, nicht für Entwürfe.
 */
export const Topics: CollectionConfig = {
  slug: C.topics,
  ...editorialDefaults,
  labels: {
    singular: l('Kernthema', 'Core topic', 'Thème principal'),
    plural: l('Kernthemen', 'Core topics', 'Thèmes principaux'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'pageStatus', 'journeyPageCount', '_status'],
    group: groups.topics,
  },
  defaultSort: ['category', 'order'],
  hooks: { beforeValidate: [topicRules] },
  fields: [
    { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
    {
      name: 'shortTitle',
      type: 'text',
      label: l('Kurzform (Kacheln, Navigation)', 'Short form (tiles, navigation)', 'Forme courte'),
      localized: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: l('Ein Satz für die Themenübersicht', 'One sentence for the overview', 'Une phrase pour l’aperçu'),
      localized: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: l('1 Einstieg', '1 Introduction', '1 Introduction'),
          fields: [
            {
              name: 'intro',
              type: 'richText',
              label: l('Einstieg (2–3 Sätze)', 'Introduction (2–3 sentences)', 'Introduction (2–3 phrases)'),
              localized: true,
              validate: liveRequired,
            },
            { name: 'currentNotice', type: 'textarea', label: l('Aktueller Hinweis (optional)', 'Current notice (optional)', 'Actualité (facultatif)'), localized: true },
          ],
        },
        {
          label: l('2 Auf einen Blick', '2 At a glance', "2 En un coup d'œil"),
          fields: [
            {
              name: 'keyPoints',
              type: 'array',
              label: l('Kernaussagen', 'Key points', 'Points clés'),
              validate: liveCount(3, 5),
              fields: [{ name: 'text', type: 'textarea', label: l('Aussage', 'Statement', 'Énoncé'), required: true, localized: true }],
            },
          ],
        },
        {
          label: l('3 Passend zum Thema', '3 Related', '3 En lien avec le thème'),
          fields: [annotatedLinksField('relatedLinks', l('Passend zum Thema', 'Related to the topic', 'En lien avec le thème'), { min: 5, max: 10 })],
        },
        {
          label: l('4 Tools', '4 Tools', '4 Outils'),
          fields: [
            {
              name: 'tools',
              type: 'array',
              label: l('Tools an der UniBE', 'Tools at UniBE', "Outils à l'UniBE"),
              fields: [
                { name: 'name', type: 'text', label: l('Tool', 'Tool', 'Outil'), required: true, localized: true },
                { name: 'tool', type: 'relationship', relationTo: C.tools, label: l('Tool-Seite im Hub', 'Tool page in hub', "Page de l'outil") },
                { name: 'purpose', type: 'text', label: l('Wofür', 'For what', 'Pour quoi'), localized: true },
                { name: 'audience', type: 'text', label: l('Für wen', 'For whom', 'Pour qui'), localized: true },
              ],
            },
            { name: 'toolsNote', type: 'textarea', label: l('Hinweis unter der Tabelle', 'Note below the table', 'Remarque'), localized: true },
            { name: 'toolsAsOf', type: 'date', label: l('Stand', 'As of', 'État au'), admin: { date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        {
          label: l('5 Entlang der Journey', '5 Along the journey', '5 Le long du parcours'),
          fields: [annotatedLinksField('journeyLinks', l('Entlang der Journey', 'Along the journey', 'Le long du parcours'), { min: 5, max: 10 })],
        },
        {
          label: l('6 Aus der Praxis', '6 From practice', '6 De la pratique'),
          fields: [
            {
              name: 'practice',
              type: 'array',
              label: l('Beispiele von UniBE-Dozierenden', 'Examples from UniBE lecturers', "Exemples d'enseignant·e·s"),
              maxRows: 3,
              fields: [
                { name: 'title', type: 'text', label: l('Titel', 'Title', 'Titre'), required: true, localized: true },
                { name: 'context', type: 'text', label: l('Fakultät · Format', 'Faculty · format', 'Faculté · format'), localized: true },
                { name: 'text', type: 'textarea', label: l('Beschreibung', 'Description', 'Description'), localized: true },
                { name: 'url', type: 'text', label: 'URL' },
              ],
            },
          ],
        },
        {
          label: l('7 Angebote', '7 Offers', '7 Offres'),
          fields: [annotatedLinksField('offerLinks', l('Angebote', 'Offers', 'Offres'), { min: 3, max: 6 })],
        },
        {
          label: l('8 Andere Hochschulen', '8 Other universities', '8 Autres hautes écoles'),
          fields: [annotatedLinksField('externalLinks', l('Hinweise anderer Hochschulen', 'Pointers from other universities', "Ressources d'autres hautes écoles"), { min: 4, max: 8 })],
        },
        {
          label: l('9 Siehe auch', '9 See also', '9 Voir aussi'),
          fields: [
            {
              name: 'seeAlso',
              type: 'relationship',
              label: l('Verwandte Kernthemen', 'Related core topics', 'Thèmes principaux liés'),
              relationTo: C.topics,
              hasMany: true,
              maxRows: 3,
            },
          ],
        },
      ],
    },
    // Seitenleiste
    {
      name: 'category',
      type: 'select',
      label: l('Kategorie', 'Category', 'Catégorie'),
      required: true,
      defaultValue: 'A',
      options: [
        { value: 'A', label: l('A – Kernthema', 'A – Core topic', 'A – Thème principal') },
        { value: 'B', label: l('B – Ergänzendes Thema', 'B – Supplementary topic', 'B – Thème complémentaire') },
        { value: 'C', label: l('C – Später', 'C – Later', 'C – Plus tard') },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'pageStatus',
      type: 'select',
      label: l('Stand der Themenseite', 'Topic page status', 'État de la page'),
      defaultValue: 'planned',
      options: [
        { value: 'planned', label: l('folgt', 'coming soon', 'à venir') },
        { value: 'live', label: l('Themenseite', 'Topic page', 'Page thématique') },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'order', type: 'number', label: l('Reihenfolge', 'Order', 'Ordre'), defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'journeyPages',
      type: 'relationship',
      label: l('Seiten entlang der Journey (Matrix)', 'Pages along the journey (matrix)', 'Pages le long du parcours (matrice)'),
      relationTo: [C.articles, C.tools],
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: l(
          'Bestimmt die Matrix Themen × Journey. Unter 5 Seiten: zu dünn für eine eigene Themenseite.',
          'Drives the topics × journey matrix. Fewer than 5 pages: too thin for a topic page.',
          'Alimente la matrice. Moins de 5 pages : trop mince pour une page.',
        ),
      },
    },
    {
      name: 'journeyPageCount',
      type: 'number',
      label: l('Seiten in der Journey', 'Pages in the journey', 'Pages dans le parcours'),
      admin: { position: 'sidebar', readOnly: true },
    },
    taxonomyField('journeyPhases', 'rubrik', l('Bezug zur Journey', 'Journey phases', 'Étapes du parcours'), {
      admin: { position: 'sidebar' },
    }),
    pathField(l('z. B. /themen/ki_in_lehre_und_studium', 'e.g. /themen/ki_in_lehre_und_studium', 'p. ex. /themen/ki_in_lehre_und_studium')),
    seoField,
    // Kein legacy-Feld: Landingpages sind eigene Inhalte und nicht im Delta-Abgleich (Plan Abschnitt 5)
  ],
}
