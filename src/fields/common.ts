import type { Field, RelationshipField, Validate } from 'payload'

import { l } from '@/lib/admin'
import { C, type TaxonomyType, linkableCollections } from '@/lib/slugs'
import { validateOneSentence, validatePath, validateUrl } from '@/lib/validation'

const asPayloadValidate = (fn: (value: unknown) => true | string): Validate => (value) => fn(value)

/** Pfad wie auf der Altsite (Entscheidung 7.2), eindeutig pro Collection. */
export function pathField(description?: string | Record<string, string>): Field {
  return {
    name: 'path',
    type: 'text',
    label: l('Pfad', 'Path', 'Chemin'),
    required: true,
    unique: true,
    index: true,
    validate: asPayloadValidate(validatePath),
    admin: {
      position: 'sidebar',
      description:
        description ??
        l(
          'Ohne Sprachpräfix, z. B. /journey_der_lehre/lehre_konzipieren/…',
          'Without language prefix, e.g. /journey_der_lehre/…',
          'Sans préfixe de langue, p. ex. /journey_der_lehre/…',
        ),
    },
  }
}

/** Herkunft auf der Altsite – Grundlage für den Delta-Abgleich (Phase 2). */
export const legacyField: Field = {
  name: 'legacy',
  type: 'group',
  label: l('Altsite', 'Legacy site', 'Ancien site'),
  admin: {
    position: 'sidebar',
    description: l('Wird vom Importer gesetzt.', 'Set by the importer.', "Défini par l'importateur."),
  },
  fields: [
    { name: 'url', type: 'text', label: 'URL', admin: { readOnly: true } },
    { name: 'date', type: 'date', label: l('Änderungsdatum (DC.Date)', 'Modified (DC.Date)', 'Modifié (DC.Date)'), admin: { readOnly: true } },
    { name: 'hash', type: 'text', label: 'Hash', admin: { readOnly: true } },
  ],
}

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', label: l('Titel (Browser/Suche)', 'Title (browser/search)', 'Titre (navigateur/recherche)'), localized: true },
    { name: 'description', type: 'textarea', label: l('Beschreibung', 'Description', 'Description'), localized: true, maxLength: 300 },
  ],
}

/** Relation auf Schlagwörter eines oder mehrerer Typen. */
export function taxonomyField(
  name: string,
  type: TaxonomyType | TaxonomyType[],
  label: ReturnType<typeof l>,
  options: Partial<Pick<RelationshipField, 'required' | 'admin'>> & { hasMany?: boolean } = {},
): Field {
  const { hasMany = true, ...rest } = options
  return {
    name,
    type: 'relationship',
    label,
    relationTo: C.taxonomies,
    hasMany,
    filterOptions: Array.isArray(type) ? { type: { in: type } } : { type: { equals: type } },
    ...rest,
  } as Field
}

/** Interner Link (Relation) oder externer Link (URL). */
export function linkFields(): Field[] {
  return [
    {
      name: 'linkType',
      type: 'radio',
      label: l('Linkart', 'Link type', 'Type de lien'),
      defaultValue: 'internal',
      options: [
        { value: 'internal', label: l('Intern', 'Internal', 'Interne') },
        { value: 'external', label: l('Extern', 'External', 'Externe') },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'internal',
      type: 'relationship',
      label: l('Interne Seite', 'Internal page', 'Page interne'),
      relationTo: [...linkableCollections],
      admin: { condition: (_, sibling) => sibling?.linkType !== 'external' },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.linkType === 'external' || value ? true : 'Bitte eine interne Seite wählen.',
    } as Field,
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      localized: true,
      admin: { condition: (_, sibling) => sibling?.linkType === 'external' },
      validate: ((value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.linkType !== 'external') return true
        if (!value) return 'Bitte eine URL angeben.'
        return validateUrl(value)
      }) as Validate,
    },
  ]
}

/**
 * „Kommentierter Link“ der Landingpages: Linktitel + genau ein Satz + Label (Entscheidung 7.6).
 */
export function annotatedLinksField(
  name: string,
  label: ReturnType<typeof l>,
  rows: { min?: number; max?: number } = {},
): Field {
  return {
    name,
    type: 'array',
    label,
    minRows: rows.min,
    maxRows: rows.max,
    labels: { singular: l('Kommentierter Link', 'Annotated link', 'Lien commenté'), plural: l('Kommentierte Links', 'Annotated links', 'Liens commentés') },
    admin: { initCollapsed: true },
    fields: [
      // Label: Kategorie (z. B. Beratung, Förderung) oder Journey-Phase (Entscheidung 7.6c)
      taxonomyField('label', ['linkLabel', 'rubrik'], l('Label', 'Label', 'Étiquette'), { hasMany: false }),
      { name: 'title', type: 'text', label: l('Linktitel', 'Link title', 'Titre du lien'), required: true, localized: true },
      {
        name: 'sentence',
        type: 'textarea',
        label: l('Ein Satz', 'One sentence', 'Une phrase'),
        required: true,
        localized: true,
        validate: asPayloadValidate(validateOneSentence),
        admin: { description: l('Was findet man dort? Genau ein Satz.', 'What will people find there? Exactly one sentence.', 'Que trouve-t-on ? Une seule phrase.') },
      },
      ...linkFields(),
      { name: 'asOf', type: 'date', label: l('Stand', 'As of', 'État au'), admin: { date: { pickerAppearance: 'dayOnly' } } },
    ],
  }
}
