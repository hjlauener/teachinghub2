/** Läuft einmal beim Start des Next.js-Servers: Geheimnisse prüfen (Produktion: Abbruch bei schwachen Werten). */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { checkSecrets } = await import('./lib/secrets')
  checkSecrets()
}
