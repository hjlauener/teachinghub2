import AxeBuilder from '@axe-core/playwright'
import { type Browser, expect, type Page, test } from '@playwright/test'

/**
 * Abnahme Phase 5, Teil 2: Feedback-Dialog (inkl. Gast → Anmeldung → Dialog), Meine Methoden mit eigenem Eintrag
 * und Vorschlag, Teilen an Mitglieder (Inhalt und Sammlung), Kopie, Widerruf, öffentliches Teilen.
 */
const mailpit = process.env.MAILPIT_URL ?? 'http://localhost:8025'
const real = process.env.E2E_REAL_DATA === '1'
const method = real
  ? { path: '/methodenkompass/think_pair_share', title: 'Think-Pair-Share' }
  : { path: '/methodenkompass/testmethode', title: 'Testmethode' }
const axe = (page: Page, include?: string) => {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  return (include ? builder.include(include) : builder).analyze()
}

type MailSummary = { ID: string; Subject: string }
async function mailsFor(email: string, subject?: RegExp): Promise<MailSummary[]> {
  const list = (await (
    await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
  ).json()) as { messages: MailSummary[] }
  return (list.messages ?? []).filter((m) => !subject || subject.test(m.Subject))
}

async function magicLinkFor(email: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const [first] = await mailsFor(email, /Anmeldelink|sign-in link|lien de connexion/)
    if (first) {
      const message = (await (await fetch(`${mailpit}/api/v1/message/${first.ID}`)).json()) as {
        Text: string
      }
      const link = message.Text.match(/https?:\/\/\S+\/api\/auth\/magic-link\/verify\S+/)?.[0]
      if (link) return link
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Keine Mail für ${email}`)
}

/** Auf der Anmeldeseite (bereits geöffnet) Magic Link anfordern und einlösen. */
async function completeSignIn(page: Page, email: string) {
  await page.waitForLoadState('networkidle')
  await page.getByLabel('E-Mail-Adresse').fill(email)
  await page.getByRole('button', { name: 'Anmeldelink senden' }).click()
  await expect(page.getByRole('status')).toContainText(email)
  const link = new URL(await magicLinkFor(email))
  await page.goto(`${link.pathname}${link.search}`)
}

async function newMember(browser: Browser, email: string, name: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage()
  await page.goto('/de/anmelden')
  await completeSignIn(page, email)
  await page.goto('/de/konto')
  await page.waitForLoadState('networkidle')
  await page.getByLabel('Name').fill(name)
  await page.getByRole('button', { name: 'Speichern', exact: true }).first().click()
  await expect(page.getByText('Gespeichert.')).toBeVisible()
  return page
}

test('Hub-API für Feedback, Sammlungen und Teilen braucht Anmeldung und dieselbe Herkunft', async ({
  request,
}) => {
  expect(
    (
      await request.post('/api/hub/feedback', {
        multipart: { kind: 'idee', place: 'x', message: 'y' },
        headers: { Origin: 'https://evil.example' },
      })
    ).status(),
  ).toBe(403)
  expect(
    (
      await request.post('/api/hub/feedback', {
        multipart: { kind: 'idee', place: 'x', message: 'y' },
      })
    ).status(),
  ).toBe(401)
  expect(
    (
      await request.post('/api/hub/collections', { data: { kind: 'methods', title: 'x' } })
    ).status(),
  ).toBe(401)
  expect((await request.get('/api/hub/members?q=test')).status()).toBe(401)
  expect(
    (
      await request.post('/api/hub/share', {
        data: { collection: 'methods', id: 1, memberIds: ['x'] },
      })
    ).status(),
  ).toBe(401)
})

test('Öffentliches Teilen für Gäste: Link kopieren, E-Mail, LinkedIn (ohne Facebook)', async ({
  page,
}) => {
  await page.goto(`/de${method.path}`)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Teilen' }).click()
  await expect(page.getByRole('button', { name: 'Link kopieren' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Per E-Mail' })).toHaveAttribute(
    'href',
    /^mailto:\?subject=/,
  )
  await expect(page.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute(
    'href',
    /linkedin\.com\/sharing\/share-offsite\/\?url=http/,
  )
  await expect(page.getByText('Facebook')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'An Kolleg:innen senden' })).toHaveCount(0)
})

test('Feedback: Gast → Anmeldung → Dialog mit Stelle, senden, in Mein Hub sehen und löschen', async ({
  page,
}) => {
  const email = `e2e-fb-${Date.now()}@unibe.ch`
  await page.goto(`/de${method.path}`)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Feedback' }).click()
  await expect(page).toHaveURL(/\/de\/anmelden\?zurueck=.*feedback/)
  await completeSignIn(page, email)

  // Zurück auf der Seite: Dialog öffnet sich mit der ursprünglichen Stelle
  const dialog = page.getByRole('dialog', { name: 'Feedback' })
  await expect(dialog).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`/de${method.path}$`))
  await expect(dialog.getByText(`Stelle: «${method.title}`)).toBeVisible()
  await expect(dialog.getByRole('img', { name: /Bildschirmfoto/ })).toBeVisible()
  await expect(dialog.getByLabel('Bild mitsenden')).toBeChecked()

  // Zeichnen (optional) und rückgängig machen
  const canvas = dialog.getByRole('img', { name: /Bildschirmfoto/ })
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 20, box.y + 20)
    await page.mouse.down()
    await page.mouse.move(box.x + 120, box.y + 60, { steps: 5 })
    await page.mouse.up()
  }
  await expect(dialog.getByRole('button', { name: /Rückgängig/ })).toBeEnabled()

  // Art wählen: Fragetext passt sich an
  await expect(dialog.getByLabel('Was soll besser werden?')).toBeVisible()
  await dialog.locator('label', { hasText: 'Fehler' }).click()
  await expect(dialog.getByRole('radio', { name: 'Fehler' })).toBeChecked()
  await dialog.getByLabel('Was funktioniert nicht?').fill('Der zweite Absatz endet mitten im Satz.')
  expect((await axe(page, '.feedback-dialog')).violations).toEqual([])
  await dialog.getByRole('button', { name: /Senden/ }).click()
  await expect(page.getByRole('heading', { name: 'Danke für Ihr Feedback' })).toBeVisible()
  await page.getByRole('button', { name: 'Schliessen' }).click()

  // Mein Hub: Status „neu“, mit Bild; löschen
  await page.goto('/de/mein-hub#feedback')
  const section = page.locator('#feedback')
  await expect(section.getByRole('link', { name: new RegExp(method.title) })).toBeVisible()
  await expect(section.getByText('neu', { exact: true })).toBeVisible()
  await expect(section.getByText(/Fehler · .* · mit Bild/)).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
  await section.getByRole('button', { name: /Feedback löschen/ }).click()
  await expect(section.getByRole('link', { name: new RegExp(method.title) })).toHaveCount(0)
  await page.reload()
  await expect(
    page.locator('#feedback').getByText('Noch kein Feedback gesendet.', { exact: false }),
  ).toBeVisible()
})

test('Meine Methoden: hinzufügen, eigener Eintrag, vorschlagen, teilen, Kopie, widerrufen', async ({
  browser,
}) => {
  const stamp = Date.now()
  const olga = { email: `e2e-olga-${stamp}@unibe.ch`, name: `Olga ${stamp}` }
  const rita = { email: `e2e-rita-${stamp}@unibe.ch`, name: `Rita ${stamp}` }
  const ritaPage = await newMember(browser, rita.email, rita.name)
  const page = await newMember(browser, olga.email, olga.name)

  // Name wird serverseitig geprüft (Review Phase 4/5): zu lang → 400, Zeilenumbrüche werden entfernt
  const tooLong = await page.request.post('/api/auth/update-user', { data: { name: 'x'.repeat(101) }, headers: { Origin: 'http://localhost:3000' } })
  expect(tooLong.status()).toBe(400)

  // Methode zu einer neuen Sammlung hinzufügen
  await page.goto(`/de${method.path}`)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Zu Meine Methoden' }).click()
  await expect(page.getByLabel('Sammlung', { exact: true })).toHaveValue('__new__')
  await page.getByLabel('Titel der neuen Sammlung').fill('Seminar Frühling')
  await page.getByLabel('Notiz oder eigene Variante (optional)').fill('Mit 3 Minuten Denkzeit')
  await page.getByRole('button', { name: 'Hinzufügen' }).click()
  await expect(page.getByText('Hinzugefügt.')).toBeVisible()

  // Inhalt an Rita senden
  await page.getByRole('button', { name: 'Teilen' }).click()
  await page.getByRole('button', { name: 'An Kolleg:innen senden' }).click()
  await page.getByRole('combobox', { name: /Mitglieder/ }).fill(rita.name)
  await page.getByRole('option', { name: new RegExp(rita.name) }).click()
  await page.getByLabel('Nachricht (optional)').fill('Für unser Modul')
  await page.getByRole('button', { name: 'Senden', exact: true }).click()
  await expect(page.getByText('Geteilt mit einem Mitglied.')).toBeVisible()
  expect((await axe(page)).violations).toEqual([])

  // Sammlung öffnen: eigener Eintrag, vorschlagen
  await page.getByRole('link', { name: 'Sammlung öffnen' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Seminar Frühling' })).toBeVisible()
  await expect(page.getByLabel(`Notiz/Variante zu «${method.title}»`)).toHaveValue(
    'Mit 3 Minuten Denkzeit',
  )
  await page.getByRole('textbox', { name: 'Titel', exact: true }).last().fill('Kugellager XL')
  await page.getByLabel('Beschreibung, Ablauf, Erfahrungen').fill('Zwei Kreise, 60 Personen')
  await page.getByRole('button', { name: 'Hinzufügen' }).click()
  await expect(page.getByRole('heading', { level: 3, name: 'Kugellager XL' })).toBeVisible()
  await page.getByRole('button', { name: 'Der Redaktion vorschlagen: Kugellager XL' }).click()
  await expect(page.getByText('Vorgeschlagen: eingereicht')).toBeVisible()

  // Sammlung lesend mit Rita teilen
  await page.getByRole('combobox', { name: /Mitglieder/ }).fill(rita.email.slice(0, 12))
  await page.getByRole('option', { name: new RegExp(rita.name) }).click()
  await page.getByRole('button', { name: 'Teilen', exact: true }).click()
  await expect(page.getByText(`${rita.name} (${rita.email}) · darf lesen`)).toBeVisible()
  expect((await axe(page)).violations).toEqual([])
  const collectionUrl = page.url()

  // Rita: Mit mir geteilt (Inhalt + Sammlung) und Mail-Benachrichtigung
  await ritaPage.goto('/de/mein-hub#geteilt')
  const inbox = ritaPage.locator('#geteilt')
  await expect(inbox.getByRole('link', { name: method.title })).toBeVisible()
  await expect(inbox.getByText('Für unser Modul')).toBeVisible()
  await expect(inbox.getByRole('link', { name: 'Seminar Frühling' })).toBeVisible()
  await expect
    .poll(async () => (await mailsFor(rita.email, /hat etwas mit Ihnen geteilt/)).length)
    .toBe(2)
  expect((await axe(ritaPage)).violations).toEqual([])

  // Rita sieht die Sammlung nur lesend und übernimmt eine Kopie
  await inbox.getByRole('link', { name: 'Seminar Frühling' }).click()
  await expect(ritaPage.getByText(`Geteilt von ${olga.name}`).first()).toBeVisible()
  await expect(ritaPage.getByText('Zwei Kreise, 60 Personen')).toBeVisible()
  await expect(ritaPage.getByRole('textbox')).toHaveCount(0)
  await ritaPage.getByRole('button', { name: 'Kopie übernehmen' }).click()
  await expect(ritaPage.getByRole('heading', { level: 1, name: 'Seminar Frühling' })).toBeVisible()
  await expect(ritaPage.getByText(/Privat – sichtbar nur für Sie/)).toBeVisible()
  await expect(ritaPage.getByRole('textbox', { name: 'Titel', exact: true }).first()).toBeVisible()

  // Olga widerruft: Rita hat keinen Zugriff mehr auf das Original, ihre Kopie bleibt
  await page.getByRole('button', { name: `Widerrufen: ${rita.name}` }).click()
  await expect(page.getByText(`${rita.name} (${rita.email}) · darf lesen`)).toHaveCount(0)
  const response = await ritaPage.goto(collectionUrl)
  expect(response?.status()).toBe(404)
  await ritaPage.goto('/de/mein-hub#methoden')
  await expect(
    ritaPage.locator('#methoden').getByRole('link', { name: 'Seminar Frühling' }),
  ).toBeVisible()

  // Olga: Vorschlag in „Meine Vorschläge“, Export enthält Sammlung
  await page.goto('/de/mein-hub#vorschlaege')
  await expect(page.locator('#vorschlaege').getByText('Kugellager XL')).toBeVisible()
  const data = (await (await page.request.get('/api/hub/export')).json()) as {
    collections: { title: string; items: { title: string }[] }[]
    suggestions: { title: string }[]
  }
  expect(data.collections.map((c) => c.title)).toContain('Seminar Frühling')
  expect(data.suggestions.map((s) => s.title)).toContain('Kugellager XL')
})
