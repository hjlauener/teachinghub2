/** Hinweise anderer Hochschulen: bei jedem Aufruf 4 zufällig gewählte (Entscheidung 7.8). */
export const EXTERNAL_SHOWN = 4

/** Zufällige Auswahl von höchstens `count` Einträgen, gemischt (Fisher-Yates); das Original bleibt unverändert. */
export function pickRandom<T>(items: T[], count: number, random: () => number = Math.random): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}
