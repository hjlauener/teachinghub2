import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

/**
 * Abnahme Phase 7: Anmeldung über einen Test-Anmeldedienst (Keycloak), der die SWITCH edu-ID nachahmt
 * (docker/keycloak/eduid-test-realm.json). Regel 6.3: nur @unibe.ch-Adressen, keine Studierenden.
 * Läuft nur mit E2E_EDUID=1 (CI startet Keycloak; lokal: docker compose up keycloak).
 */
const mailpit = process.env.MAILPIT_URL ?? 'http://localhost:8025'
const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()

test.skip(process.env.E2E_EDUID !== '1', 'Nur mit Test-Anmeldedienst (E2E_EDUID=1)')

/** Über den edu-ID-Knopf zum Test-Anmeldedienst und mit Benutzername/Passwort zurück. */
async function loginAtIdp(page: Page, username: string) {
  await page.waitForURL(/\/realms\/eduid-test\//)
  await page.locator('#username').fill(username)
  await page.locator('#password').fill('test')
  await page.locator('#kc-login').click()
  await page.waitForURL(/localhost:3000/)
  await page.waitForLoadState('networkidle')
}

async function signInWithEduid(page: Page, username: string) {
  await page.goto('/de/anmelden')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Mit SWITCH edu-ID anmelden' }).click()
  await loginAtIdp(page, username)
}

async function signInWithMagicLink(page: Page, email: string) {
  await page.goto('/de/anmelden')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail-Adresse').fill(email)
  await page.getByRole('button', { name: 'Anmeldelink senden' }).click()
  await expect(page.getByRole('status')).toContainText(email)
  for (let i = 0; i < 20; i++) {
    const list = (await (await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)).json()) as { messages: { ID: string }[] }
    if (list.messages?.length) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${list.messages[0].ID}`)).json()) as { Text: string }
      const link = new URL(message.Text.match(/https?:\/\/\S+\/api\/auth\/magic-link\/verify\S+/)?.[0] ?? '')
      await page.goto(`${link.pathname}${link.search}`)
      return
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Keine Mail für ${email}`)
}

async function deleteAccount(page: Page) {
  await page.goto('/de/konto')
  page.once('dialog', (d) => d.accept())
  await page.getByRole('button', { name: 'Konto endgültig löschen' }).click()
  await expect(page.getByRole('link', { name: 'Anmelden', exact: true })).toBeVisible()
}

test('Mitarbeitende mit @unibe.ch: Konto über edu-ID, im Konto als verknüpft angezeigt', async ({ page }) => {
  await signInWithEduid(page, 'dozentin')
  await expect(page).toHaveURL(/\/de\/mein-hub$/)
  await expect(page.getByText('Dora Dozentin')).toBeVisible()
  await page.goto('/de/konto')
  await expect(page.getByText('Angemeldet als dora.dozentin@unibe.ch')).toBeVisible()
  await expect(page.getByText('Ihr Konto ist mit Ihrer edu-ID verknüpft.')).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
  await deleteAccount(page)
})

for (const [username, label] of [
  ['privat', 'private Adresse'],
  ['studentin', '@students.unibe.ch'],
] as const) {
  test(`Kein Konto über edu-ID mit ${label} (Entscheidung 6.3)`, async ({ page }) => {
    await signInWithEduid(page, username)
    await expect(page).toHaveURL(/\/de\/anmelden\?fehler=eduid/)
    await expect(page.locator('#signin-error')).toContainText('nur mit einer Adresse der Universität Bern (@unibe.ch) möglich')
    expect((await axe(page)).violations).toEqual([])
    // kein Konto angelegt: Mein Hub verlangt weiterhin die Anmeldung
    await page.goto('/de/mein-hub')
    await expect(page).toHaveURL(/\/de\/anmelden/)
  })
}

test('Bestehendes Konto mit gleicher Adresse wird automatisch verknüpft', async ({ page, browser }) => {
  await signInWithMagicLink(page, 'bea.bestehend@unibe.ch')
  await page.goto('/de/konto')
  await page.getByLabel('Name').fill('Bea vom Anmeldelink')
  await page.getByRole('button', { name: 'Speichern', exact: true }).click()
  await expect(page.getByText('Gespeichert.')).toBeVisible()
  await expect(page.getByText('Verknüpfen Sie Ihr Konto mit Ihrer edu-ID')).toBeVisible()

  const other = await (await browser.newContext()).newPage()
  await signInWithEduid(other, 'bestehend')
  await expect(other).toHaveURL(/\/de\/mein-hub$/)
  // dasselbe Konto: Name aus dem Anmeldelink-Konto, jetzt mit edu-ID verknüpft
  await expect(other.getByText('Bea vom Anmeldelink')).toBeVisible()
  await other.goto('/de/konto')
  await expect(other.getByText('Ihr Konto ist mit Ihrer edu-ID verknüpft.')).toBeVisible()
  await deleteAccount(other)
})

test('Konto bewusst mit einer edu-ID verknüpfen, die eine andere Adresse hat', async ({ page, browser }) => {
  const email = `e2e-link-${Date.now()}@unibe.ch`
  await signInWithMagicLink(page, email)
  await page.goto('/de/konto')
  await page.getByRole('button', { name: 'Mit edu-ID verknüpfen' }).click()
  await loginAtIdp(page, 'privat')
  await expect(page).toHaveURL(/\/de\/konto/)
  await expect(page.getByText('Ihr Konto ist mit Ihrer edu-ID verknüpft.')).toBeVisible()

  // Danach führt die edu-ID mit privater Adresse in dieses Konto
  const other = await (await browser.newContext()).newPage()
  await signInWithEduid(other, 'privat')
  await expect(other).toHaveURL(/\/de\/mein-hub$/)
  await other.goto('/de/konto')
  await expect(other.getByText(`Angemeldet als ${email}`)).toBeVisible()
  await deleteAccount(other)
})
