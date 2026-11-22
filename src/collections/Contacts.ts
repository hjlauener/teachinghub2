import type { CollectionConfig } from 'payload'

import { anyone, editorsOnly, editorsOrTranslatorsInTargetLocale } from '@/access/roles'
import { groups, l } from '@/lib/admin'
import { C } from '@/lib/slugs'

/** Anlaufstellen und Kontaktboxen (Über uns: LEAD, ILUB, VSL, Stab VRL, SAE, Redaktion). */
export const Contacts: CollectionConfig = {
  slug: C.contacts,
  labels: { singular: l('Kontakt', 'Contact', 'Contact'), plural: l('Kontakte', 'Contacts', 'Contacts') },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'unit', 'email'],
    group: groups.structure,
  },
  access: {
    read: anyone,
    create: editorsOnly,
    update: editorsOrTranslatorsInTargetLocale,
    delete: editorsOnly,
  },
  fields: [
    { name: 'topic', type: 'text', label: l('Mit Fragen zu …', 'For questions about …', 'Pour des questions sur …'), localized: true },
    { name: 'name', type: 'text', label: l('Stelle / Abkürzung', 'Unit / abbreviation', 'Service / abréviation'), required: true },
    { name: 'unit', type: 'text', label: l('Ausgeschrieben', 'Full name', 'Nom complet'), localized: true },
    { name: 'phone', type: 'text', label: l('Telefon', 'Phone', 'Téléphone') },
    { name: 'email', type: 'email', label: 'E-Mail' },
    { name: 'url', type: 'text', label: l('Website', 'Website', 'Site web') },
    { name: 'order', type: 'number', label: l('Reihenfolge', 'Order', 'Ordre'), defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
