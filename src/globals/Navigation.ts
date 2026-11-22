import type { GlobalConfig } from 'payload'

import { anyone, editorsOrTranslatorsInTargetLocale } from '@/access/roles'
import { groups, l } from '@/lib/admin'
import { validatePath, validateUrl } from '@/lib/validation'

/**
 * Hauptmenü und Footer-Links, im CMS pflegbar und übersetzbar.
 * Bis Phase 3 liest die Website noch `src/config/navigation.ts`; der Seed füllt dieses Global identisch.
 */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: l('Navigation', 'Navigation', 'Navigation'),
  admin: { group: groups.structure },
  access: {
    read: anyone,
    update: editorsOrTranslatorsInTargetLocale,
  },
  fields: [
    {
      name: 'mainMenu',
      type: 'array',
      label: l('Hauptmenü', 'Main menu', 'Menu principal'),
      fields: [
        { name: 'label', type: 'text', label: l('Bezeichnung', 'Label', 'Libellé'), required: true, localized: true },
        { name: 'path', type: 'text', label: l('Pfad', 'Path', 'Chemin'), required: true, validate: (value: unknown) => validatePath(value) },
      ],
    },
    {
      name: 'footerLinks',
      type: 'array',
      label: l('Footer-Links', 'Footer links', 'Liens du pied de page'),
      fields: [
        { name: 'label', type: 'text', label: l('Bezeichnung', 'Label', 'Libellé'), required: true, localized: true },
        { name: 'url', type: 'text', label: 'URL', required: true, localized: true, validate: (value: unknown) => validateUrl(value) },
      ],
    },
  ],
}
