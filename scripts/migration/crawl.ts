/**
 * Altsite crawlen: `docker compose exec app npm run legacy:crawl`
 * Schreibt Rohdaten nach data/legacy/ (gitignored).
 */
import { crawl } from '../../src/migration/crawl'

const started = Date.now()
const manifest = await crawl({ log: (msg) => console.log(msg) })
console.log(
  `Fertig in ${Math.round((Date.now() - started) / 1000)} s: ${manifest.pages.length} Seiten, ` +
    `${manifest.assets.length} Dateien verlinkt, ${manifest.errors.length} Fehler.`,
)
for (const error of manifest.errors.slice(0, 20)) console.log(`  Fehler: ${error.url} – ${error.error}`)
