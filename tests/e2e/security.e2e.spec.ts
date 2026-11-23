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
