/**
 * Liste der inhaltlichen Änderungen der Altsite gegenüber dem übernommenen Stand (Migrations-Inbox).
 * Reine Formatierung, getestet; Daten liefert scripts/migration/changes.ts.
 */
export type ChangeEntry = {
  path: string
  changeType: 'new' | 'changed' | 'removed'
  status: string
  summary?: string | null
  legacyUrl?: string | null
  detectedAt?: string | null
  changedFields?: string[] | null
}

const LABELS: Record<ChangeEntry['changeType'], string> = { new: 'Neu auf der Altsite', changed: 'Geändert', removed: 'Auf der Altsite entfernt' }
const STATUS: Record<string, string> = { open: 'offen', later: 'später' }

/** Markdown-Liste, gruppiert nach Art der Änderung, je Gruppe nach Pfad sortiert. */
export function formatChanges(entries: ChangeEntry[], date = new Date()): string {
  const day = date.toISOString().slice(0, 10)
  if (!entries.length) return `# Änderungen der Altsite (Stand ${day})\n\nKeine offenen Änderungen gegenüber dem übernommenen Stand.\n`
  const lines = [`# Änderungen der Altsite (Stand ${day})`, '', `${entries.length} offene Einträge in der Migrations-Inbox.`]
  for (const type of ['changed', 'new', 'removed'] as const) {
    const group = entries.filter((e) => e.changeType === type).sort((a, b) => a.path.localeCompare(b.path))
    if (!group.length) continue
    lines.push('', `## ${LABELS[type]} (${group.length})`, '')
    for (const e of group) {
      const fields = e.changedFields?.length ? ` – Felder: ${e.changedFields.join(', ')}` : ''
      const conflict = e.summary?.includes('Konflikt') ? ' ⚠ Konflikt mit lokaler Bearbeitung' : ''
      const status = STATUS[e.status] ? ` [${STATUS[e.status]}]` : ''
      lines.push(`- \`${e.path}\`${status}${fields}${conflict}${e.legacyUrl ? `\n  ${e.legacyUrl}` : ''}`)
    }
  }
  lines.push('', 'Übernehmen, später oder ignorieren: Admin → Migration Altsite → Migrations-Inbox.')
  return `${lines.join('\n')}\n`
}
