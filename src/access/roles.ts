import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

import { defaultLocale } from '@/i18n/routing'

/**
 * CMS-Rollen (Umsetzungsplan Abschnitt 8). Mitglieder der Website (Magic Link) folgen in Phase 4
 * und sind keine CMS-Benutzer.
 */
export const roles = ['admin', 'redaktion', 'uebersetzer'] as const
export type Role = (typeof roles)[number]

export const roleLabels: Record<Role, { de: string; en: string; fr: string }> = {
  admin: { de: 'Admin', en: 'Admin', fr: 'Admin' },
  redaktion: { de: 'Redaktion', en: 'Editor', fr: 'Rédaction' },
  uebersetzer: { de: 'Übersetzer:in', en: 'Translator', fr: 'Traducteur·rice' },
}

type UserLike = { roles?: readonly string[] | null } | null | undefined

export function hasRole(user: UserLike, ...wanted: Role[]): boolean {
  return Boolean(user?.roles?.some((role) => (wanted as string[]).includes(role)))
}

export const isAdmin = (user: UserLike) => hasRole(user, 'admin')
/** Darf Inhalte anlegen, bearbeiten, publizieren und löschen. */
export const isEditor = (user: UserLike) => hasRole(user, 'admin', 'redaktion')
/** Hat Zugang zum CMS. */
export const isStaff = (user: UserLike) => hasRole(user, 'admin', 'redaktion', 'uebersetzer')

/** Übersetzer:innen bearbeiten nur Zielsprachen, nie die Quellsprache DE (Entscheidung 4.3). */
export function canEditLocale(user: UserLike, locale: string | undefined | null): boolean {
  if (isEditor(user)) return true
  if (!hasRole(user, 'uebersetzer')) return false
  return Boolean(locale) && locale !== defaultLocale && locale !== 'all'
}

// ---- Access-Funktionen für Collections -------------------------------------------------------

export const adminOnly: Access = ({ req }) => isAdmin(req.user)
export const editorsOnly: Access = ({ req }) => isEditor(req.user)
export const staffOnly: Access = ({ req }) => isStaff(req.user)
export const anyone: Access = () => true

/** Update: Redaktion immer, Übersetzer:in nur in EN/FR. */
export const editorsOrTranslatorsInTargetLocale: Access = ({ req }) =>
  canEditLocale(req.user, localeOf(req))

/** Öffentlich nur Publiziertes, CMS-Benutzer sehen auch Entwürfe. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req.user)) return true
  const published: Where = { _status: { equals: 'published' } }
  return published
}

// ---- Feldzugriff ---------------------------------------------------------------------------

export const adminFieldOnly: FieldAccess = ({ req }) => isAdmin(req.user)

function localeOf(req: PayloadRequest): string | undefined {
  return typeof req.locale === 'string' ? req.locale : undefined
}
