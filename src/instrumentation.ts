/**
 * Läuft einmal beim Start des Next.js-Servers: Geheimnisse prüfen. Im Produktionsbetrieb beendet sich der Server
 * bei schwachen Werten sofort (statt nur Fehler 500 zu liefern), damit ein Fehlstart beim Deployment auffällt.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { checkSecrets } = await import('./lib/secrets')
  try {
    checkSecrets()
  } catch (error) {
    console.error(`[Start abgebrochen] ${(error as Error).message}`)
    process.exit(1)
  }
}
