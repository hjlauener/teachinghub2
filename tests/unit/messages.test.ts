import { describe, expect, it } from 'vitest'

import de from '../../messages/de.json'
import en from '../../messages/en.json'
import fr from '../../messages/fr.json'

type Messages = { [key: string]: string | Messages }

function keys(obj: Messages, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'string' ? [`${prefix}${key}`] : keys(value, `${prefix}${key}.`),
  )
}

describe('UI-Texte (4.2: UI ist immer übersetzt)', () => {
  const reference = keys(de).sort()

  it.each([
    ['en', en],
    ['fr', fr],
  ])('%s hat dieselben Schlüssel wie de', (_locale, messages) => {
    expect(keys(messages as Messages).sort()).toEqual(reference)
  })

  it.each([
    ['de', de],
    ['en', en],
    ['fr', fr],
  ])('%s hat keine leeren Texte', (_locale, messages) => {
    const empty = keys(messages as Messages).filter((key) => {
      const value = key.split('.').reduce<unknown>((o, k) => (o as Messages)[k], messages)
      return typeof value !== 'string' || value.trim() === ''
    })
    expect(empty).toEqual([])
  })
})
