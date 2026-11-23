/**
 * Prüfung der Geheimnisse beim Start (Review Sicherheit): Im Produktionsbetrieb verweigert die App den Start,
 * wenn ein Geheimnis fehlt, zu kurz ist oder noch der Platzhalter aus `.env.example` ist.
 * Rein (ohne Seiteneffekte), damit testbar.
 */
export const REQUIRED_SECRETS = ['PAYLOAD_SECRET', 'BETTER_AUTH_SECRET', 'AI_KEY_SECRET'] as const
export const SECRET_MIN_LENGTH = 32
const PLACEHOLDER = /bitte-ersetzen|change-?me|replace-?me|example|placeholder/i

export function secretProblems(env: Record<string, string | undefined>): string[] {
  const problems: string[] = []
  for (const name of REQUIRED_SECRETS) {
    const value = env[name]?.trim()
    if (!value) problems.push(`${name} fehlt`)
    else if (PLACEHOLDER.test(value)) problems.push(`${name} ist noch der Platzhalter`)
    else if (value.length < SECRET_MIN_LENGTH) problems.push(`${name} ist kürzer als ${SECRET_MIN_LENGTH} Zeichen`)
  }
  if (env.AI_KEY_SECRET && env.AI_KEY_SECRET === env.AI_KEY_SECRET_PREVIOUS) problems.push('AI_KEY_SECRET_PREVIOUS entspricht AI_KEY_SECRET')
  return problems
}

/** Im Produktionsbetrieb abbrechen, sonst nur warnen. */
export function checkSecrets(env: Record<string, string | undefined> = process.env, log: (msg: string) => void = console.warn): void {
  const problems = secretProblems(env)
  if (!problems.length) return
  const message = `Unsichere Konfiguration: ${problems.join('; ')}. Werte z. B. mit „openssl rand -hex 32“ erzeugen.`
  if (env.NODE_ENV === 'production') throw new Error(message)
  log(`[Konfiguration] ${message}`)
}
