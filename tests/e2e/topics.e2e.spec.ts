import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Abnahme Phase 3b: Themenübersicht mit beiden Ansichten, Themenseite (lokal mit echten Daten). */
const real = process.env.E2E_REAL_DATA === '1'
const axe = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()

test('Themenübersicht: Kernthemen, ergänzende Themen und Matrix', async ({ page }) => {
  await page.goto('/de/themen')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Themen der Lehre')
  await expect(page.getByRole('heading', { level: 2, name: /Kernthemen/ })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: /Ergänzende Themen/ })).toBeVisible()
  await expect(page.locator('.topic-list li')).toHaveCount(18) // 8 A + 10 B (Entscheidung 7.9)
  expect((await axe(page)).violations).toEqual([])

  await page.getByRole('tab', { name: 'Themen × Journey' }).click()
  await expect(page.locator('table.matrix tbody tr')).toHaveCount(8)
  await expect(page).toHaveURL(/#matrix$/)
  expect((await axe(page)).violations).toEqual([])
})

test('Kernthema mit Themenseite: Kapitel und kommentierte Links', async ({ page }) => {
  test.skip(!real, 'Live-Themenseiten brauchen die importierten Altsite-Seiten')
  await page.goto('/de/themen/ki_in_lehre_und_studium')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KI in Lehre und Studium')
  for (const name of ['Auf einen Blick', 'Passend zum Thema', 'Entlang der Journey', 'Unterthemen']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible()
  }
  await expect(page.locator('.annotated-links li').first()).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
})

test('Unterthema zeigt passende Methoden', async ({ page }) => {
  await page.goto('/de/themen/aktivierende_lehre/aktivierung_in_grossveranstaltungen')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Aktivierung in Grossveranstaltungen')
  if (real) await expect(page.locator('#passende-methoden .card').first()).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
})

test('Test-Landingpage: Kopie von „Digitales Prüfen“, verlinkt auf Übersicht und Startseite (Entscheidung 7.10)', async ({ page }) => {
  await page.goto('/de/themen')
  await page.waitForLoadState('networkidle')
  await page.getByRole('link', { name: 'Test: Digitales Prüfen' }).click()
  await expect(page).toHaveURL(/\/de\/themen\/test$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/^Test: /)
  await expect(page.getByText(/^Testseite: Hier werden neue Ideen/)).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
  await page.goto('/de')
  await expect(page.getByRole('link', { name: 'Test-Themenseite' })).toBeVisible()
})
