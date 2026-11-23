import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

/**
 * Abnahme Phase 4: Konto per Magic Link (Mailpit fängt die Mail ab), Zulassung @unibe.ch, Abmelden, Löschen.
 * MAILPIT_URL: lokal http://mailpit:8025, in der CI http://localhost:8025.
 */
const mailpit = process.env.MAILPIT_URL ?? 'http://localhost:8025'
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

test('Konto ist ohne Anmeldung nicht erreichbar', async ({ page }) => {
  await page.goto('/de/konto')
  await expect(page).toHaveURL(/\/de\/anmelden$/)
  expect((await axe(page)).violations).toEqual([])
})

test('Adressen ausserhalb von unibe.ch werden abgelehnt', async ({ page }) => {
  await page.goto('/de/anmelden')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail-Adresse').fill('jemand@students.unibe.ch')
  await page.getByRole('button', { name: 'Anmeldelink senden' }).click()
  await expect(page.locator('#signin-error')).toContainText('@unibe.ch')
})

test('Magic Link: anmelden, abmelden, Konto löschen', async ({ page }) => {
  const email = `e2e-${Date.now()}@unibe.ch`
  await page.goto('/de/anmelden')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail-Adresse').fill(email)
  await page.getByRole('button', { name: 'Anmeldelink senden' }).click()
  await expect(page.getByRole('status')).toContainText(email)

  const link = new URL(await magicLinkFor(email))
  await page.goto(`${link.pathname}${link.search}`) // gleicher Host wie die Tests
  await expect(page).toHaveURL(/\/de\/konto$/)
  await expect(page.getByText(`Angemeldet als ${email}`)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Mein Konto' })).toBeVisible()
  expect((await axe(page)).violations).toEqual([])

  // Link funktioniert nur einmal
  await page.goto(`${link.pathname}${link.search}`)
  await page.goto('/de/konto')
  await expect(page.getByText(`Angemeldet als ${email}`)).toBeVisible()

  await page.getByRole('button', { name: 'Abmelden' }).click()
  await expect(page.getByRole('link', { name: 'Anmelden' })).toBeVisible()

  // Erneut anmelden und Konto löschen
  await page.goto('/de/anmelden')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail-Adresse').fill(email)
  await page.getByRole('button', { name: 'Anmeldelink senden' }).click()
  await expect(page.getByRole('status')).toBeVisible()
  await new Promise((r) => setTimeout(r, 1000))
  const list = (await (await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)).json()) as { messages: { ID: string }[] }
  const latest = (await (await fetch(`${mailpit}/api/v1/message/${list.messages[0].ID}`)).json()) as { Text: string }
  const second = new URL(latest.Text.match(/https?:\/\/\S+\/api\/auth\/magic-link\/verify\S+/)![0])
  await page.goto(`${second.pathname}${second.search}`)
  await expect(page).toHaveURL(/\/de\/konto$/)
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Konto endgültig löschen' }).click()
  await expect(page.getByRole('link', { name: 'Anmelden' })).toBeVisible()
})
