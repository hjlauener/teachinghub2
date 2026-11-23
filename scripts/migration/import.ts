/**
 * Erstimport der gecrawlten Altsite: `docker compose exec app npm run legacy:import`
 * Voraussetzung: `npm run seed` (Schlagwörter) und `npm run legacy:crawl` (Rohdaten).
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { emptyReport, loadSources, prepareContext, reconvertImported, runInitialImport } from '../../src/migration/run'

const payload = await getPayload({ config })

// LEGACY_RECONVERT=1: bereits importierte Seiten mit dem aktuellen Konverter neu umwandeln
if (process.env.LEGACY_RECONVERT === '1') {
  const sources = await loadSources()
  const report = emptyReport()
  const ctx = await prepareContext(payload, sources, report, (msg) => payload.logger.info(msg), { downloadAssets: false })
  const updated = await reconvertImported(payload, sources, ctx, report)
  payload.logger.info(`Neu umgewandelt: ${updated} Seiten, Fehler: ${report.errors.length}`)
  for (const e of report.errors.slice(0, 20)) payload.logger.warn(`Fehler ${e.path}: ${e.error}`)
  process.exit(report.errors.length > 0 ? 1 : 0)
}

const started = Date.now()
const report = await runInitialImport(payload, (msg) => payload.logger.info(msg))

payload.logger.info(
  `Import fertig in ${Math.round((Date.now() - started) / 1000)} s – angelegt: ${JSON.stringify(report.created)}, ` +
    `übersprungen (bereits importiert): ${report.skipped}, Teaser-News: ${report.teaserNews}, ` +
    `Warnungen: ${report.warnings.length}, Fehler: ${report.errors.length}, Dateien fehlgeschlagen: ${report.failedAssets.length}`,
)
for (const e of report.errors.slice(0, 30)) payload.logger.warn(`Fehler ${e.path}: ${e.error}`)
for (const w of report.warnings.slice(0, 30)) payload.logger.info(`Hinweis ${w.path}: ${w.message}`)
for (const f of report.failedAssets.slice(0, 15)) payload.logger.warn(`Datei ${f.url}: ${f.error}`)
process.exit(report.errors.length > 0 ? 1 : 0)
