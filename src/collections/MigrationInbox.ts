import type { CollectionConfig, PayloadRequest } from 'payload'

import { editorsOnly, isEditor } from '@/access/roles'
import { l } from '@/lib/admin'

import { migrationGroup } from './LegacySnapshots'

const deny = () => false

async function readJson(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    return ((await req.json?.()) ?? {}) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Migrations-Inbox (Plan Abschnitt 6, Schritt 3): neue / geänderte / entfernte Seiten der Altsite
 * mit Diff und Aktionen übernehmen · ignorieren · später. Wird nur vom Delta-Abgleich gefüllt.
 */
export const MigrationInbox: CollectionConfig = {
  slug: 'migration-inbox',
  labels: { singular: l('Inbox-Eintrag', 'Inbox entry', "Entrée d'inbox"), plural: l('Migrations-Inbox', 'Migration inbox', 'Inbox de migration') },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'changeType', 'status', 'summary', 'detectedAt'],
    group: migrationGroup,
    listSearchableFields: ['path', 'summary'],
    components: {
      beforeList: ['@/components/admin/DeltaRunButton#DeltaRunButton'],
    },
  },
  defaultSort: '-detectedAt',
  access: { read: editorsOnly, create: deny, update: deny, delete: editorsOnly },
  endpoints: [
    {
      // POST /api/migration-inbox/:id/resolve  { action: 'apply' | 'ignore' | 'later', resolutions?: { feld: 'legacy' | 'local' } }
      path: '/:id/resolve',
      method: 'post',
      handler: async (req) => {
        if (!isEditor(req.user)) return Response.json({ error: 'Keine Berechtigung' }, { status: 403 })
        const body = await readJson(req)
        const action = body.action as 'apply' | 'ignore' | 'later'
        if (!['apply', 'ignore', 'later'].includes(action)) return Response.json({ error: 'Ungültige Aktion' }, { status: 400 })
        const { resolveEntry } = await import('@/migration/delta')
        try {
          const doc = await resolveEntry(req.payload, Number(req.routeParams?.id), action, {
            resolutions: (body.resolutions ?? {}) as Record<string, 'legacy' | 'local'>,
            userId: req.user?.id as number,
          })
          return Response.json({ doc })
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 })
        }
      },
    },
    {
      // POST /api/migration-inbox/run-delta – startet Crawl + Abgleich im Hintergrund
      path: '/run-delta',
      method: 'post',
      handler: async (req) => {
        if (!isEditor(req.user)) return Response.json({ error: 'Keine Berechtigung' }, { status: 403 })
        const { isDeltaRunning, runDelta } = await import('@/migration/delta')
        if (isDeltaRunning()) return Response.json({ running: true }, { status: 409 })
        void runDelta(req.payload).catch((error) => req.payload.logger.error(`[Delta] ${String(error)}`))
        return Response.json({ running: true }, { status: 202 })
      },
    },
    {
      path: '/delta-status',
      method: 'get',
      handler: async (req) => {
        if (!isEditor(req.user)) return Response.json({ error: 'Keine Berechtigung' }, { status: 403 })
        const { isDeltaRunning } = await import('@/migration/delta')
        return Response.json({ running: isDeltaRunning() })
      },
    },
  ],
  fields: [
    {
      name: 'review',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/InboxReview#InboxReview' } },
    },
    { name: 'path', type: 'text', required: true, index: true, admin: { readOnly: true } },
    {
      name: 'changeType',
      type: 'select',
      label: l('Art', 'Type', 'Type'),
      required: true,
      options: [
        { value: 'new', label: l('neu', 'new', 'nouveau') },
        { value: 'changed', label: l('geändert', 'changed', 'modifié') },
        { value: 'removed', label: l('entfernt', 'removed', 'supprimé') },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'open',
      index: true,
      options: [
        { value: 'open', label: l('offen', 'open', 'ouvert') },
        { value: 'later', label: l('später', 'later', 'plus tard') },
        { value: 'applied', label: l('übernommen', 'applied', 'appliqué') },
        { value: 'ignored', label: l('ignoriert', 'ignored', 'ignoré') },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'summary', type: 'text', label: l('Zusammenfassung', 'Summary', 'Résumé'), admin: { readOnly: true } },
    { name: 'targetCollection', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'docId', type: 'number', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'legacyUrl', type: 'text', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'legacyDate', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'detectedAt', type: 'date', label: l('Erkannt', 'Detected', 'Détecté'), admin: { readOnly: true, position: 'sidebar' } },
    { name: 'resolvedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'resolvedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'oldHash', type: 'text', admin: { hidden: true } },
    { name: 'newHash', type: 'text', index: true, admin: { hidden: true } },
    { name: 'changedFields', type: 'json', admin: { hidden: true } },
    { name: 'conflicts', type: 'json', admin: { hidden: true } },
    { name: 'diffs', type: 'json', admin: { hidden: true } },
    { name: 'proposed', type: 'json', admin: { hidden: true } },
    { name: 'source', type: 'json', admin: { hidden: true } },
  ],
}
