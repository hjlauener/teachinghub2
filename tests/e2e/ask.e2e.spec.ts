import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

/**
 * Abnahme Phase 6 (Ask-a-question): Fragen auf der Suchseite, eigener Schlüssel, Antwort nur mit Quellen,
 * „nichts gefunden“ mit Meldung an die Redaktion, Verlauf, gemerkter Modus.
 * Läuft mit Testanbieter und Ersatz-Embeddings (CI: AI_TEST_PROVIDER=1, AI_EMBEDDER=fake, `npm run ai:reindex`).
 */
const mailpit = process.env.MAILPIT_URL ?? 'http://localhost:8025'
const axe = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()

test.skip(process.env.AI_TEST_PROVIDER !== '1', 'Nur mit Testanbieter (AI_TEST_PROVIDER=1)')

async function signIn(page: Page, email: string) {
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

test('Ask-API braucht Anmeldung, dieselbe Herkunft und einen Schlüssel', async ({ request }) => {
  expect((await request.post('/api/hub/ai/ask', { data: { question: 'Was ist das?' }, headers: { Origin: 'https://evil.example' } })).status()).toBe(403)
  expect((await request.post('/api/hub/ai/ask', { data: { question: 'Was ist das?' } })).status()).toBe(401)
  expect((await request.get('/api/hub/ai/key')).status()).toBe(401)
})

test('Gäste sehen im Fragemodus einen Anmeldehinweis', async ({ page }) => {
  await page.goto('/de/suche?modus=fragen')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('tab', { name: 'Fragen' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('link', { name: 'Anmelden, um Fragen zu stellen' })).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
})

test('Schlüssel hinterlegen, Frage mit Quellen, nichts gefunden, Verlauf, Modus gemerkt', async ({ page }) => {
  const email = `e2e-ask-${Date.now()}@unibe.ch`
  await signIn(page, email)

  // Ohne Schlüssel: Anleitung statt Fragefeld
  await page.goto('/de/suche?modus=fragen')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('link', { name: 'Zu den KI-Einstellungen' })).toBeVisible()
  await page.getByRole('link', { name: 'Zu den KI-Einstellungen' }).click()

  // KI-Einstellungen: Schlüssel prüfen und speichern; er wird nie mehr angezeigt
  const settings = page.locator('#ki')
  await settings.getByLabel('Anbieter').selectOption('test')
  await settings.getByLabel('Modell').fill('test-modell')
  await settings.getByLabel('API-Schlüssel').fill('test-key-0123456789-abcd')
  await settings.getByRole('button', { name: 'Prüfen und speichern' }).click()
  await expect(settings.getByText('Hinterlegt: Testanbieter (nur Entwicklung) · test-modell · Schlüssel …abcd')).toBeVisible()
  await expect(settings.getByLabel(/API-Schlüssel/)).toHaveValue('')
  expect(JSON.stringify(await (await page.request.get('/api/hub/ai/key')).json())).not.toContain('test-key-0123456789')
  expect((await axe(page)).violations).toEqual([])

  // Frage mit passender Quelle: Antwort mit Verweis [1] und Quellenlink auf den Abschnitt
  await page.goto('/de/suche')
  await page.waitForLoadState('networkidle')
  await page.getByRole('tab', { name: 'Fragen' }).click()
  await page.getByLabel('Ihre Frage an den Teaching Hub').fill('Was steht in der Methodenbeschreibung der Testmethode?')
  await page.getByRole('button', { name: 'Frage stellen' }).click()
  const answer = page.getByRole('region', { name: 'Antwort' })
  await expect(answer.getByText(/Laut «Testmethode»/)).toBeVisible()
  await expect(answer.getByRole('link', { name: 'Quelle 1' })).toBeVisible()
  await expect(answer.getByRole('link', { name: 'Testmethode' }).first()).toHaveAttribute('href', /^\/de\/methodenkompass\/testmethode/)
  await expect(answer.getByText(/Verbrauch: \d+ Eingabe- und \d+ Ausgabe-Tokens/)).toBeVisible()
  expect((await axe(page)).violations).toEqual([])

  // Modus bleibt gemerkt: Suchseite ohne Parameter öffnet „Fragen“
  await page.goto('/de/suche')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('tab', { name: 'Fragen' })).toHaveAttribute('aria-selected', 'true')

  // Nichts Passendes im Hub: Hinweis, kein Aufruf beim Anbieter, Meldung an die Redaktion vorausgefüllt
  await page.getByLabel('Ihre Frage an den Teaching Hub').fill('Quantenchromodynamik Gluonen Hadronisierung')
  await page.getByRole('button', { name: 'Frage stellen' }).click()
  await expect(page.getByText('Im Teaching Hub habe ich dazu nichts gefunden.')).toBeVisible()
  await page.getByRole('button', { name: 'Inhalt fehlt – der Redaktion melden' }).click()
  const dialog = page.getByRole('dialog', { name: 'Feedback' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('radio', { name: 'Idee' })).toBeChecked()
  await expect(dialog.getByLabel('Welche Idee haben Sie?')).toHaveValue(/Quantenchromodynamik/)
  await dialog.getByRole('button', { name: 'Abbrechen' }).click()

  // Verlauf in Mein Hub: beide Fragen, Detailseite mit Quellen, alles löschen
  await page.goto('/de/mein-hub#fragen')
  const history = page.locator('#fragen')
  await expect(history.getByRole('link', { name: 'Was steht in der Methodenbeschreibung der Testmethode?' })).toBeVisible()
  await expect(history.getByText(/nichts gefunden/)).toBeVisible()
  await history.getByRole('link', { name: 'Was steht in der Methodenbeschreibung der Testmethode?' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Was steht in der Methodenbeschreibung der Testmethode?' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Quellen im Teaching Hub' })).toBeVisible()
  expect((await axe(page)).violations).toEqual([])

  const exported = (await (await page.request.get('/api/hub/export')).json()) as { questions: { question: string }[]; aiSettings: Record<string, unknown> }
  expect(exported.questions).toHaveLength(2)
  expect(JSON.stringify(exported.aiSettings)).not.toContain('test-key-0123456789')

  await page.goto('/de/mein-hub#fragen')
  page.once('dialog', (d) => d.accept())
  await page.locator('#fragen').getByRole('button', { name: 'Ganzen Verlauf löschen' }).click()
  await expect(page.locator('#fragen').getByText('Noch keine Fragen gestellt.')).toBeVisible()

  // Schlüssel löschen
  page.once('dialog', (d) => d.accept())
  await page.locator('#ki').getByRole('button', { name: 'Schlüssel löschen' }).click()
  await expect(page.locator('#ki').getByText('Schlüssel gelöscht.')).toBeVisible()
})
