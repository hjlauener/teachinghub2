import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

/**
 * Abnahme Phase 5, Teil 1: Like („Hilfreich“), Bookmark mit Notiz, „Mein Hub“, Export, Sortierung „Beliebt“.
 * Gäste werden zur Anmeldung geführt und kehren danach auf dieselbe Seite zurück.
 */
const mailpit = process.env.MAILPIT_URL ?? 'http://localhost:8025'
const real = process.env.E2E_REAL_DATA === '1'
const method = real ? { path: '/methodenkompass/think_pair_share', title: 'Think-Pair-Share' } : { path: '/methodenkompass/testmethode', title: 'Testmethode' }
const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()

async function magicLinkFor(email: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const list = (await (await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)).json()) as { messages: { ID: string }[] }
    if (list.messages?.length) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${list.messages[0].ID}`)).json()) as { Text: string }
      const link = message.Text.match(/https?:\/\/\S+\/api\/auth\/magic-link\/verify\S+/)?.[0]
      if (link) return link
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Keine Mail für ${email}`)
}

test('Schreibende Hub-Anfragen brauchen Anmeldung und dieselbe Herkunft', async ({ request }) => {
  const body = { collection: 'methods', id: 1, liked: true }
  expect((await request.post('/api/hub/likes', { data: body, headers: { Origin: 'https://evil.example' } })).status()).toBe(403)
  expect((await request.post('/api/hub/likes', { data: body })).status()).toBe(401)
  expect((await request.get('/api/hub/export')).status()).toBe(401)
})

test('Mein Hub ist ohne Anmeldung nicht erreichbar', async ({ page }) => {
  await page.goto('/de/mein-hub')
  await expect(page).toHaveURL(/\/de\/anmelden\?zurueck=%2Fde%2Fmein-hub$/)
})

test('Gast → Anmeldung → zurück, liken, merken, Notiz, Export, Beliebt, Konto löschen', async ({ page }) => {
  const email = `e2e-hub-${Date.now()}@unibe.ch`

  // Als Gast: Hinweis statt Knöpfe, Anmeldung mit Rücksprung
  await page.goto(`/de${method.path}`)
  const signIn = page.getByRole('link', { name: /Anmelden, um Inhalte zu merken/ })
  await expect(signIn).toBeVisible()
  await signIn.click()
  await expect(page).toHaveURL(/\/de\/anmelden\?zurueck=/)
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail-Adresse').fill(email)
  await page.getByRole('button', { name: 'Anmeldelink senden' }).click()
  await expect(page.getByRole('status')).toContainText(email)
  const link = new URL(await magicLinkFor(email))
  await page.goto(`${link.pathname}${link.search}`)
  await expect(page).toHaveURL(new RegExp(`/de${method.path}$`))

  // Liken und merken; Zustand bleibt nach dem Neuladen
  const like = page.getByRole('button', { name: 'Hilfreich' })
  await expect(like).toHaveAttribute('aria-pressed', 'false')
  await like.click()
  await expect(like).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Merken' }).click()
  await expect(page.getByRole('button', { name: 'Gemerkt' })).toHaveAttribute('aria-pressed', 'true')
  expect((await axe(page)).violations).toEqual([])
  await page.reload()
  await expect(page.getByRole('button', { name: 'Hilfreich' })).toHaveAttribute('aria-pressed', 'true')
  // Ein einzelnes Like bleibt unsichtbar (erst ab 3 öffentlich)
  await expect(page.getByText(/Kolleg:innen finden das hilfreich/)).toHaveCount(0)

  // Mein Hub: Bookmark mit Notiz, eigene Likes
  await page.getByRole('link', { name: 'Mein Hub' }).click()
  await expect(page).toHaveURL(/\/de\/mein-hub$/)
  const saved = page.locator('#gemerkt')
  await expect(saved.getByRole('link', { name: method.title })).toBeVisible()
  await saved.getByLabel(`Notiz zu «${method.title}»`).fill('Für das Seminar im Frühling')
  await saved.getByRole('button', { name: 'Notiz speichern' }).click()
  await expect(saved.getByRole('status')).toHaveText('Notiz gespeichert.')
  await expect(page.locator('#hilfreich').getByRole('link', { name: method.title })).toBeVisible()
  expect((await axe(page)).violations).toEqual([])

  // Export enthält Konto, Like und Bookmark mit Notiz
  const response = await page.request.get('/api/hub/export')
  expect(response.headers()['content-disposition']).toMatch(/attachment; filename="teachinghub-daten-/)
  const data = (await response.json()) as { account: { email: string }; likes: { title: string }[]; bookmarks: { title: string; note: string }[] }
  expect(data.account.email).toBe(email)
  expect(data.likes.map((l) => l.title)).toContain(method.title)
  expect(data.bookmarks).toContainEqual(expect.objectContaining({ title: method.title, note: 'Für das Seminar im Frühling' }))

  // Methodenkompass: „Beliebt“ stellt die gelikte Methode nach vorne
  await page.goto('/de/methodenkompass')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Sortieren nach').selectOption('popular')
  await expect(page.locator('.compass-table tbody tr').first().getByRole('link').first()).toHaveText(method.title)

  // Like in Mein Hub entfernen, dann Konto löschen (löscht alle persönlichen Daten)
  await page.goto('/de/mein-hub')
  await page.getByRole('button', { name: `Markierung entfernen: ${method.title}` }).click()
  await expect(page.locator('#hilfreich').getByRole('link', { name: method.title })).toHaveCount(0)
  await page.getByRole('link', { name: 'Konto und Passkeys verwalten' }).click()
  await expect(page).toHaveURL(/\/de\/konto$/)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Konto endgültig löschen' }).click()
  await expect(page.getByRole('link', { name: 'Anmelden', exact: true })).toBeVisible()
})
