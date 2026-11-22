/** Gruppen im Admin-Menü (dreisprachig wie die Admin-Oberfläche). */
export const groups = {
  content: { de: 'Inhalte', en: 'Content', fr: 'Contenus' },
  topics: { de: 'Themen der Lehre', en: 'Teaching topics', fr: "Thèmes de l'enseignement" },
  structure: { de: 'Struktur', en: 'Structure', fr: 'Structure' },
  admin: { de: 'Verwaltung', en: 'Administration', fr: 'Administration' },
}

/** Kurzform für dreisprachige Labels. */
export const l = (de: string, en: string, fr: string) => ({ de, en, fr })
