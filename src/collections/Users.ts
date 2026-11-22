import type { CollectionConfig } from 'payload'

import { adminFieldOnly, adminOnly, isAdmin, isStaff, roleLabels, roles } from '@/access/roles'
import { groups } from '@/lib/admin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: { de: 'CMS-Benutzer:in', en: 'CMS user', fr: 'Utilisateur·rice CMS' },
    plural: { de: 'CMS-Benutzer:innen', en: 'CMS users', fr: 'Utilisateur·rice·s CMS' },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: groups.admin,
  },
  auth: true,
  access: {
    // Nur CMS-Rollen kommen ins Admin-Panel
    admin: ({ req }) => isStaff(req.user),
    create: adminOnly,
    delete: adminOnly,
    read: ({ req }) => {
      if (isAdmin(req.user)) return true
      if (!req.user) return false
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (isAdmin(req.user)) return true
      if (!req.user) return false
      return { id: { equals: req.user.id } }
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: { de: 'Name', en: 'Name', fr: 'Nom' },
    },
    {
      name: 'roles',
      type: 'select',
      label: { de: 'Rollen', en: 'Roles', fr: 'Rôles' },
      hasMany: true,
      required: true,
      defaultValue: ['redaktion'],
      saveToJWT: true,
      options: roles.map((value) => ({ value, label: roleLabels[value] })),
      admin: {
        description: {
          de: 'Das allererste Konto wird automatisch Admin.',
          en: 'The very first account automatically becomes admin.',
          fr: 'Le tout premier compte devient automatiquement admin.',
        },
      },
      access: {
        // Nur Admins vergeben Rollen
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
    },
  ],
  hooks: {
    beforeChange: [
      // Das erste Konto (Ersteinrichtung im Admin) wird automatisch Admin
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        if (totalDocs === 0) return { ...data, roles: ['admin'] }
        return data
      },
    ],
  },
}
