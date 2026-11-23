/**
 * Maschinelle Übersetzung (Entscheidung 4.3): Google Cloud Translation v2 über einen austauschbaren Adapter.
 * Ohne `GOOGLE_TRANSLATE_API_KEY` ist die Übersetzung aus – die Website zeigt dann DE mit Hinweis.
 * Nur öffentliche Inhalte werden übersetzt (nie private Notizen o. ä.).
 */
export type TranslationProvider = {
  name: string
  translate: (texts: string[], target: 'en' | 'fr', source?: 'de') => Promise<string[]>
}

const BATCH = 100

export function googleProvider(apiKey: string, fetchImpl: typeof fetch = fetch): TranslationProvider {
  return {
    name: 'google',
    async translate(texts, target, source = 'de') {
      const out: string[] = []
      for (let i = 0; i < texts.length; i += BATCH) {
        const chunk = texts.slice(i, i + BATCH)
        const response = await fetchImpl(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: chunk, source, target, format: 'text' }),
        })
        if (!response.ok) throw new Error(`Übersetzung fehlgeschlagen: HTTP ${response.status}`)
        const json = (await response.json()) as { data: { translations: { translatedText: string }[] } }
        out.push(...json.data.translations.map((t) => t.translatedText))
      }
      return out
    },
  }
}

export function configuredProvider(): TranslationProvider | null {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY
  return key ? googleProvider(key) : null
}
