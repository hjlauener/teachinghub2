import type { CollectionConfig } from 'payload'

import { editorsOnly, editorsOrTranslatorsInTargetLocale, publishedOrStaff } from '@/access/roles'

/**
 * Gemeinsame Einstellungen redaktioneller Inhalte:
 * Entwürfe + Versionen, öffentlich nur Publiziertes, Übersetzer:innen nur in EN/FR.
 */
export const editorialDefaults: Pick<CollectionConfig, 'access' | 'versions'> = {
  access: {
    read: publishedOrStaff,
    readVersions: editorsOnly,
    create: editorsOnly,
    update: editorsOrTranslatorsInTargetLocale,
    delete: editorsOnly,
  },
  versions: {
    drafts: { autosave: false, schedulePublish: false },
    maxPerDoc: 30,
  },
}
