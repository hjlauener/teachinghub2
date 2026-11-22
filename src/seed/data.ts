import type { TaxonomyType } from '@/lib/slugs'

/**
 * Struktur-Startdaten (keine redaktionellen Inhalte der Altsite – die kommen mit dem Importer in Phase 2).
 * Quelle: Analyse 5.1/5.2 (Rubrik × Thema, Methoden-Kategorien) und Landingpage-Konzept (Labels).
 */
export type TermSeed = {
  type: TaxonomyType
  slug: string
  name: { de: string; en?: string; fr?: string }
  order: number
  parent?: string // Slug der Rubrik (nur für Themen)
  legacyKey?: string
}

const rubrics: TermSeed[] = [
  { slug: 'lehre_konzipieren', name: { de: 'Lehre konzipieren', en: 'Designing teaching', fr: "Concevoir l'enseignement" }, legacyKey: 'LEHREKONZIPIEREN1758245' },
  { slug: 'lehre_administrieren', name: { de: 'Lehre administrieren', en: 'Administering teaching', fr: "Administrer l'enseignement" }, legacyKey: 'LEHREADMINISTRIEREN1758241' },
  { slug: 'lehre_durchfuehren', name: { de: 'Lehre durchführen', en: 'Delivering teaching', fr: "Dispenser l'enseignement" }, legacyKey: 'LEHREDURCHFHREN1758243' },
  { slug: 'pruefungen_gestalten', name: { de: 'Prüfungen gestalten', en: 'Designing assessments', fr: 'Concevoir les examens' }, legacyKey: 'PRFUNGENGESTALTEN1758247' },
  { slug: 'lehre_evaluieren', name: { de: 'Lehre evaluieren', en: 'Evaluating teaching', fr: "Évaluer l'enseignement" }, legacyKey: 'LEHREEVALUIEREN1758244' },
  { slug: 'curriculum_entwickeln', name: { de: 'Curriculum entwickeln', en: 'Developing curricula', fr: 'Développer les cursus' }, legacyKey: 'CURRICULUMENTWICKELN1758240' },
  { slug: 'lehrimpulse__unibe', name: { de: 'Lehr|Impulse @ UniBE', en: 'Teaching impulses @ UniBE', fr: 'Impulsions pédagogiques @ UniBE' }, legacyKey: 'LEHRIMPULSE1758246' },
  { slug: 'tools', name: { de: 'Tools', en: 'Tools', fr: 'Outils' }, legacyKey: 'TOOLS1758248' },
].map((t, i) => ({ ...t, type: 'rubrik' as const, order: i + 1 }))

const themesByRubric: Record<string, string[]> = {
  lehre_konzipieren: ['Didaktische Grundlagen', 'Lehr- und Lernszenarien', 'Lehr- und Lernräume', 'Lehrformate', 'Unterrichtsformen'],
  lehre_administrieren: ['Prüfungsadministration', 'Veranstaltungsadministration'],
  lehre_durchfuehren: ['Lehr- und Lernmaterialien', 'Lehrmethoden'],
  pruefungen_gestalten: ['Prüfungen entwickeln', 'Prüfungen durchführen'],
  lehre_evaluieren: ['Lehrbegleitendes Feedback', 'Standardisierte Evaluationen'],
  curriculum_entwickeln: ['Studienprogramme'],
  lehrimpulse__unibe: ['Beratung & Services', 'Fachveranstaltungen', 'Förderprogramme', 'Kurse', 'Praxisimpulse', 'Preisgekrönte Lehre', 'Anlaufstellen'],
  tools: ['Lehrtools', 'Admintools', 'Prüfungstools', 'Qualitätssicherungstools'],
}

const themeSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const themes: TermSeed[] = Object.entries(themesByRubric).flatMap(([parent, names]) =>
  names.map((de, i) => ({ type: 'thema' as const, slug: themeSlug(de), name: { de }, order: i + 1, parent })),
)

const methodTerms = (type: TaxonomyType, items: [string, string, string][]): TermSeed[] =>
  items.map(([de, en, fr], i) => ({ type, slug: themeSlug(de), name: { de, en, fr }, order: i + 1 }))

const purposes = methodTerms('zweck', [
  ['Einstieg', 'Getting started', 'Entrée en matière'],
  ['Vorwissen aktivieren', 'Activating prior knowledge', 'Activer les connaissances préalables'],
  ['Verarbeiten', 'Processing content', 'Traiter les contenus'],
  ['Formatives Prüfen', 'Formative assessment', 'Évaluation formative'],
  ['Summatives Prüfen', 'Summative assessment', 'Évaluation sommative'],
  ['Zwischenfeedback', 'Interim feedback', 'Feedback intermédiaire'],
  ['Begleiten', 'Accompanying', 'Accompagner'],
])

const modalities = methodTerms('modalitaet', [
  ['Schriftlich', 'Written', 'Écrit'],
  ['Mündlich', 'Oral', 'Oral'],
  ['Praktisch', 'Practical', 'Pratique'],
])

const socialForms = methodTerms('sozialform', [
  ['Einzeln', 'Individual', 'Individuel'],
  ['Partner', 'Pairs', 'En binôme'],
  ['Gruppe', 'Group', 'Groupe'],
  ['Plenum', 'Plenary', 'Plénière'],
])

const effort = methodTerms('aufwand', [
  ['Niedrig', 'Low', 'Faible'],
  ['Niedrig bis mittel', 'Low to medium', 'Faible à moyen'],
  ['Mittel', 'Medium', 'Moyen'],
  ['Mittel bis hoch', 'Medium to high', 'Moyen à élevé'],
  ['Hoch', 'High', 'Élevé'],
])

/** Labels der kommentierten Links (Kernthema-Entwürfe, Entscheidung 7.6c); Journey-Phasen = Rubriken. */
const linkLabels = methodTerms('linkLabel', [
  ['Aktuell', 'Current', 'Actualité'],
  ['Veranstaltung', 'Event', 'Événement'],
  ['Community', 'Community', 'Communauté'],
  ['Beratung', 'Advice', 'Conseil'],
  ['Förderung', 'Funding', 'Soutien financier'],
  ['Kurs', 'Course', 'Cours'],
  ['Für Studierende', 'For students', 'Pour les étudiant·e·s'],
  ['Andere Hochschule', 'Other university', 'Autre haute école'],
])

export const taxonomySeed: TermSeed[] = [
  ...rubrics,
  ...themes,
  ...purposes,
  ...modalities,
  ...socialForms,
  ...effort,
  ...linkLabels,
]

/** Hauptmenü wie `src/config/navigation.ts` (Entscheidungen 7.2, 7.5). */
export const navigationSeed = [
  { path: '/', label: { de: 'Startseite', en: 'Home', fr: 'Accueil' } },
  { path: '/journey_der_lehre', label: { de: 'Journey der Lehre', en: 'Teaching Journey', fr: "Parcours d'enseignement" } },
  { path: '/themen', label: { de: 'Themen', en: 'Topics', fr: 'Thèmes' } },
  { path: '/methodenkompass', label: { de: 'Methodenkompass', en: 'Method Compass', fr: 'Boussole des méthodes' } },
  { path: '/suche', label: { de: 'Suche', en: 'Search', fr: 'Recherche' } },
  { path: '/ueber_uns', label: { de: 'Über uns', en: 'About us', fr: 'À propos' } },
]
