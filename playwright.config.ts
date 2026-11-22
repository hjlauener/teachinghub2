import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

/**
 * E2E-Tests (Entscheidung 9.1). Ohne E2E_BASE_URL startet Playwright die gebaute App selbst
 * (`npm run start`, vorher `npm run build`). Mit E2E_BASE_URL wird eine laufende Instanz getestet,
 * z. B. der Docker-Stack: E2E_BASE_URL=http://app:3000.
 */
const externalBaseURL = process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseURL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000/de',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
