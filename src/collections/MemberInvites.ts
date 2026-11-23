import type { CollectionConfig, GlobalConfig } from 'payload'

import { adminOnly, isAdmin } from '@/access/roles'
import { groups, l } from '@/lib/admin'

/** Einladungen für Mitgliederkonten (Modus „nur mit Einladung“, Entscheidung 2.1). */
export const MemberInvites: CollectionConfig = {
  slug: 'member-invites',
  labels: { singular: l('Einladung', 'Invitation', 'Invitation'), plural: l('Einladungen', 'Invitations', 'Invitations') },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'note', 'createdAt'], group: groups.admin },
  access: { read: adminOnly, create: adminOnly, update: adminOnly, delete: adminOnly },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)] },
    },
    { name: 'note', type: 'text', label: l('Notiz', 'Note', 'Note') },
  ],
}

/** Einstellungen der Mitgliederkonten: Registrierungsmodus und zugelassene Domains (Entscheidungen 2.1/2.2). */
export const MemberSettings: GlobalConfig = {
  slug: 'member-settings',
  label: l('Mitgliederkonten', 'Member accounts', 'Comptes membres'),
  admin: { group: groups.admin },
  access: { read: ({ req }) => isAdmin(req.user), update: ({ req }) => isAdmin(req.user) },
  fields: [
    {
      name: 'registrationMode',
      type: 'radio',
      label: l('Wer darf ein Konto anlegen?', 'Who may create an account?', 'Qui peut créer un compte ?'),
      defaultValue: 'domains',
      options: [
        { value: 'invite', label: l('Nur mit Einladung', 'Invitation only', 'Sur invitation') },
        { value: 'domains', label: l('Adressen der zugelassenen Domains', 'Addresses of allowed domains', 'Adresses des domaines autorisés') },
        { value: 'open', label: l('Alle (offen)', 'Everyone (open)', 'Tout le monde') },
      ],
    },
    {
      name: 'allowedDomains',
      type: 'array',
      label: l('Zugelassene Domains', 'Allowed domains', 'Domaines autorisés'),
      admin: {
        condition: (data) => data?.registrationMode === 'domains',
        description: l('Genau diese Domain, ohne Subdomains – z. B. unibe.ch (nicht students.unibe.ch).', 'Exactly this domain, no subdomains.', 'Exactement ce domaine, sans sous-domaines.'),
      },
      defaultValue: [{ domain: 'unibe.ch' }],
      fields: [{ name: 'domain', type: 'text', required: true }],
    },
  ],
}
