import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Abnahme Phase 3 (öffentliche Site). Lokal (E2E_REAL_DATA=1) gegen importierte Altsite-Inhalte,
 * in der CI gegen künstliche Testseiten (`npm run e2e:fixtures`).
 */
const real = process.env.E2E_REAL_DATA === '1'
const article = real
  ? { path: '/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/learning_outcomes', title: 'Learning Outcomes' }
  : { path: '/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/testartikel', title: 'Testartikel' }
const method = real ? { path: '/methodenkompass/think_pair_share', title: 'Think-Pair-Share' } : { path: '/methodenkompass/testmethode', title: 'Testmethode' }
const query = real ? 'Feedback' : 'Testartikel'

const axe = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()

test('Artikel: Abschnitte der Vorlage, Tabelle, barrierefrei', async ({ page }) => {
  await page.goto(`/de${article.path}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title)
  await expect(page.getByRole('heading', { level: 2, name: 'Stolperfrei durchstarten' })).toBeVisible()
  await expect(page.locator('.rich-text table').first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Sie sind hier' })).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
})

test('Methode: Kategorien und alternative Methoden', async ({ page }) => {
  await page.goto(`/de${method.path}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(method.title)
  await expect(page.locator('.method-facts dt').first()).toHaveText('Zweck')
  await expect(page.locator('#alternative-methoden .card').first()).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
})

test('Methodenkompass: Filter reduzieren die Liste', async ({ page }) => {
  await page.goto('/de/methodenkompass')
  await page.waitForLoadState('networkidle') // Filter sind clientseitig – erst nach dem Laden aktiv
  const rows = page.locator('.compass-table tbody tr')
  const before = await rows.count()
  expect(before).toBeGreaterThan(1)
  await page.locator('#compass-effort').selectOption({ index: 1 })
  await expect.poll(async () => rows.count()).toBeLessThan(before)
  expect((await axe(page)).violations).toEqual([])
})

test('Suche findet Inhalte und funktioniert ohne JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`/de/suche?q=${encodeURIComponent(query)}`)
  await expect(page.locator('.card-list .card').first()).toBeVisible()
  await context.close()
})

test('Suche ist barrierefrei', async ({ page }) => {
  await page.goto(`/de/suche?q=${encodeURIComponent(query)}`)
  expect((await axe(page)).violations).toEqual([])
})

test('Alte URLs leiten dauerhaft um', async ({ request }) => {
  const response = await request.get(`${article.path}/index_ger.html`, { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(new URL(response.headers().location, 'http://x').pathname).toBe(`/de${article.path}`)
})

test('Ohne Übersetzung: deutsche Fassung mit Hinweis', async ({ page }) => {
  await page.goto(`/en${article.path}`)
  await expect(page.locator('.translation-notice')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title)
})
