import { describe, expect, it } from 'vitest'

import { countSentences, slugify, validateOneSentence, validatePath, validateUrl } from '@/lib/validation'

describe('validatePath (Entscheidung 7.2)', () => {
  it.each([
    '/',
    '/journey_der_lehre',
    '/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/learning_outcomes',
    '/methodenkompass/168_stunden_pruefung',
    '/themen/ki-in-lehre',
  ])('akzeptiert %s', (path) => expect(validatePath(path)).toBe(true))

  it.each([
    ['', 'leer'],
    ['journey_der_lehre', 'ohne führenden Slash'],
    ['/journey_der_lehre/', 'mit Slash am Ende'],
    ['/journey_der_lehre/index_ger.html', 'mit Dateiname'],
    ['/Lehre', 'Grossbuchstaben'],
    ['/de/journey_der_lehre ', 'Leerzeichen'],
  ])('lehnt %s ab (%s)', (path) => expect(validatePath(path)).not.toBe(true))
})

describe('slugify', () => {
  it('ersetzt Umlaute wie die Altsite', () => {
    expect(slugify('Prüfungen durchführen')).toBe('pruefungen_durchfuehren')
    expect(slugify('Lehr- und Lernräume')).toBe('lehr_und_lernraeume')
    expect(slugify('  KI in Lehre & Studium ')).toBe('ki_in_lehre_studium')
  })
})

describe('Kommentierter Link: genau ein Satz (Entscheidung 7.6)', () => {
  it.each([
    'Die verbindlichen Grundsätze der Universität Bern zum Umgang mit KI.',
    'Massnahmen, mit denen Sie z. B. die Eigenleistung absichern, geordnet nach Absicherungsgrad.',
    'Beratung, wenn Sie unsicher sind, ob Ihre Prüfung noch misst, was sie soll (PDF).',
    'Am 3. Oktober startet die Tagung zum 14. Mal',
    'Was ist erlaubt und wie teile ich es mit?',
  ])('akzeptiert: %s', (text) => {
    expect(countSentences(text)).toBe(1)
    expect(validateOneSentence(text)).toBe(true)
  })

  it('lehnt zwei Sätze ab', () => {
    expect(countSentences('Erster Satz. Zweiter Satz.')).toBe(2)
    expect(validateOneSentence('Erster Satz. Zweiter Satz.')).not.toBe(true)
    expect(validateOneSentence('Wirklich? Ja!')).not.toBe(true)
  })

  it('lehnt leeren Text ab', () => {
    expect(validateOneSentence('   ')).not.toBe(true)
  })
})

describe('validateUrl', () => {
  it('erlaubt leere Werte und http(s)', () => {
    expect(validateUrl('')).toBe(true)
    expect(validateUrl('https://www.unibe.ch/')).toBe(true)
  })
  it('lehnt andere Protokolle und Unsinn ab', () => {
    expect(validateUrl('javascript:alert(1)')).not.toBe(true)
    expect(validateUrl('kein link')).not.toBe(true)
  })
})
