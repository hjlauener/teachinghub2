/** Collection-Slugs zentral, damit Relationen ohne zirkuläre Importe auskommen. */
export const C = {
  articles: 'articles',
  pages: 'pages',
  methods: 'methods',
  tools: 'tools',
  topics: 'topics',
  subtopics: 'subtopics',
  news: 'news',
  taxonomies: 'taxonomies',
  contacts: 'contacts',
  media: 'media',
  users: 'users',
} as const

/** Inhalte, auf die interne Links und kommentierte Links zeigen dürfen. */
export const linkableCollections = [
  C.articles,
  C.pages,
  C.methods,
  C.tools,
  C.topics,
  C.subtopics,
] as const

/** Taxonomie-Typen (Analyse 5.1/5.2, Landingpage-Konzept, Entscheidung 7.6). */
export const taxonomyTypes = [
  'rubrik',
  'thema',
  'zweck',
  'modalitaet',
  'sozialform',
  'aufwand',
  'linkLabel',
] as const
export type TaxonomyType = (typeof taxonomyTypes)[number]

export const taxonomyTypeLabels: Record<TaxonomyType, { de: string; en: string; fr: string }> = {
  rubrik: { de: 'Rubrik (Journey-Etappe)', en: 'Section (journey stage)', fr: 'Rubrique (étape)' },
  thema: { de: 'Thema (Rubrik-Tab)', en: 'Theme (section tab)', fr: 'Thème (onglet)' },
  zweck: { de: 'Methode: Zweck', en: 'Method: purpose', fr: 'Méthode : objectif' },
  modalitaet: { de: 'Methode: Modalität', en: 'Method: modality', fr: 'Méthode : modalité' },
  sozialform: { de: 'Methode: Sozialform', en: 'Method: social form', fr: 'Méthode : forme sociale' },
  aufwand: { de: 'Methode: Aufwand', en: 'Method: effort', fr: 'Méthode : effort' },
  linkLabel: { de: 'Label für kommentierte Links', en: 'Annotated link label', fr: 'Étiquette de lien' },
}
