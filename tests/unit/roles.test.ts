import { describe, expect, it } from 'vitest'

import { canEditLocale, hasRole, isEditor, isStaff } from '@/access/roles'

const admin = { roles: ['admin'] }
const editor = { roles: ['redaktion'] }
const translator = { roles: ['uebersetzer'] }

describe('Rollen', () => {
  it('erkennt Rollen', () => {
    expect(hasRole(admin, 'admin')).toBe(true)
    expect(isEditor(editor)).toBe(true)
    expect(isEditor(translator)).toBe(false)
    expect(isStaff(translator)).toBe(true)
    expect(isStaff(null)).toBe(false)
    expect(isStaff({ roles: [] })).toBe(false)
  })

  it('Übersetzer:innen bearbeiten nur EN/FR, nie DE (Entscheidung 4.3)', () => {
    expect(canEditLocale(translator, 'en')).toBe(true)
    expect(canEditLocale(translator, 'fr')).toBe(true)
    expect(canEditLocale(translator, 'de')).toBe(false)
    expect(canEditLocale(translator, 'all')).toBe(false)
    expect(canEditLocale(translator, undefined)).toBe(false)
  })

  it('Redaktion und Admin bearbeiten alle Sprachen', () => {
    for (const user of [admin, editor]) {
      expect(canEditLocale(user, 'de')).toBe(true)
      expect(canEditLocale(user, 'fr')).toBe(true)
    }
    expect(canEditLocale(null, 'en')).toBe(false)
  })
})
