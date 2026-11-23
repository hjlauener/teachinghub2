import { expect, test } from '@playwright/test'

/**
 * Review Sicherheit: Content-Security-Policy mit Nonce auf allen Seiten, ohne dass sie die Website blockiert.
 */
const real = process.env.E2E_REAL_DATA === '1'
const pages = ['/de', '/de/methodenkompass', '/de/suche', '/de/themen', '/de/anmelden', real ? '/de/methodenkompass/think_pair_share' : '/de/methodenkompass/testmethode']

for (const path of pages) {
  test(`CSP aktiv und ohne Verstösse: ${path}`, async ({ page }) => {
    const violations: string[] = []
    page.on('console', (msg) => {
      if (/Content[- ]Security[- ]Policy|Refused to (load|execute|apply)/i.test(msg.text())) violations.push(msg.text())
    })
    const response = await page.goto(path)
    const csp = response?.headers()['content-security-policy'] ?? ''
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/)
    expect(csp).toContain("object-src 'none'")
    await page.waitForLoadState('networkidle')
    // Hydration funktioniert: der Feedback-Knopf (Client-Komponente) reagiert
    await expect(page.getByRole('button', { name: 'Feedback' })).toBeEnabled()
    expect(violations).toEqual([])
  })
}

test('Nonce ist pro Anfrage neu', async ({ request }) => {
  const nonce = async () => (await request.get('/de')).headers()['content-security-policy']?.match(/'nonce-([^']+)'/)?.[1]
  const a = await nonce()
  expect(a).toBeTruthy()
  expect(await nonce()).not.toBe(a)
})

test('Mail-Sprache wird bei der Registrierung gesetzt und ist in Mein Hub änderbar', async ({ page }) => {
  const mailpit = process.env.MAILPIT_URL ?? 'http://localhost:8025'
  const email = `e2e-lang-${Date.now()}@unibe.ch`
  await page.goto('/en/anmelden')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Email address').fill(email)
  await page.getByRole('button', { name: 'Send sign-in link' }).click()
  await expect(page.getByRole('status')).toContainText(email)
  let link = ''
  for (let i = 0; i < 20 && !link; i++) {
    const list = (await (await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)).json()) as { messages: { ID: string }[] }
    if (list.messages?.length) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${list.messages[0].ID}`)).json()) as { Text: string; Subject: string }
      expect(message.Subject).toMatch(/sign-in link/)
      link = message.Text.match(/https?:\/\/\S+\/api\/auth\/magic-link\/verify\S+/)?.[0] ?? ''
    } else await new Promise((r) => setTimeout(r, 500))
  }
  const url = new URL(link)
  await page.goto(`${url.pathname}${url.search}`)
  await page.goto('/de/mein-hub#einstellungen')
  const select = page.getByLabel('Sprache der E-Mails')
  await expect(select).toHaveValue('en')
  await select.selectOption('fr')
  await expect(page.locator('#einstellungen').getByText('Einstellung gespeichert.')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Sprache der E-Mails')).toHaveValue('fr')
})
