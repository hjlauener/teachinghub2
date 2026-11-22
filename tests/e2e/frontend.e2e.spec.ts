import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const headings = {
  de: 'Ihr Hub für gute Lehre an der Universität Bern',
  en: 'Your hub for good teaching at the University of Bern',
  fr: "Votre hub pour un bon enseignement à l'Université de Berne",
} as const

test('Root leitet auf /de weiter', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/de$/)
})

for (const [locale, heading] of Object.entries(headings)) {
  test.describe(`Startseite ${locale}`, () => {
    test('zeigt Überschrift, Prototyp-Hinweis und Navigation', async ({ page }) => {
      await page.goto(`/${locale}`)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
      await expect(page.getByTestId('prototype-notice')).toBeVisible()
      await expect(page.locator('#nav-main a')).toHaveCount(6)
    })

    test('hat keine WCAG-2.1-AA-Verstösse (axe)', async ({ page }) => {
      await page.goto(`/${locale}`)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(results.violations).toEqual([])
    })
  })
}

test('Sprachwahl behält den Pfad bei', async ({ page }) => {
  await page.goto('/de/methodenkompass')
  await page.locator('#nav-lang a[hreflang="fr"]').click()
  await expect(page).toHaveURL(/\/fr\/methodenkompass$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Boussole des méthodes')
})

test('Unbekannte Pfade liefern 404', async ({ page }) => {
  const response = await page.goto('/de/gibt_es_nicht')
  expect(response?.status()).toBe(404)
})
