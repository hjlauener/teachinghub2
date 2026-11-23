import type { MatrixTopic } from '@/components/topics/TopicsViews'
import type { Article, Tool, Topic } from '@/payload-types'

/** Reihenfolge der sechs Journey-Phasen in der Matrix (Konzept: Startseite_Landingpages). */
export const MATRIX_PHASES = [
  'lehre_konzipieren',
  'lehre_administrieren',
  'lehre_durchfuehren',
  'pruefungen_gestalten',
  'lehre_evaluieren',
  'curriculum_entwickeln',
] as const

/** Phase einer Journey-Seite aus ihrem Pfad (`/journey_der_lehre/<rubrik>/…`). */
export function phaseOf(path: string): number {
  const rubric = path.split('/')[2] ?? ''
  return (MATRIX_PHASES as readonly string[]).indexOf(rubric)
}

/** Matrix automatisch aus den Relationen „Seiten entlang der Journey“ berechnen (Plan Abschnitt 5). */
export function buildMatrix(topics: Topic[]): MatrixTopic[] {
  return topics
    .filter((t) => t.category === 'A')
    .map((topic) => {
      const cells: { title: string; path: string }[][] = MATRIX_PHASES.map(() => [])
      for (const ref of topic.journeyPages ?? []) {
        const doc = typeof ref.value === 'object' ? (ref.value as Article | Tool) : null
        if (!doc?.path) continue
        const phase = phaseOf(doc.path)
        if (phase >= 0) cells[phase].push({ title: doc.title, path: doc.path })
      }
      return { id: topic.id, title: topic.title, path: topic.path, live: topic.pageStatus === 'live', cells }
    })
}

