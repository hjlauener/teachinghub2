/**
 * Künstliche Testseiten für die E2E-Tests der CI einspielen (keine Altsite-Daten):
 * `npm run e2e:fixtures` – Artikel, zwei Methoden, Rubrikseite „Lehre konzipieren“, Themen aus dem Konzept.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { getPayload } from 'payload'

import config from '@payload-config'

import { extractPage, parseMethodsCsv } from '../../src/migration/extract'
import { emptyReport, importDocs, prepareContext } from '../../src/migration/run'
import { seed } from '../../src/seed/seed'
import { importTopics } from '../../src/topics/import'

const BASE = 'https://teachinghub.unibe.ch'
const dir = path.resolve(process.cwd(), 'tests/fixtures/legacy')
const read = (name: string) => readFileSync(path.join(dir, name), 'utf-8')

const payload = await getPayload({ config })
await seed(payload)
const docs = [
  extractPage(read('article.html'), `${BASE}/journey_der_lehre/lehre_konzipieren/didaktische_grundlagen/testartikel/index_ger.html`),
  extractPage(read('method.html'), `${BASE}/methodenkompass/testmethode/index_ger.html`),
  extractPage(read('method.html').replace(/Testmethode/g, 'Andere Methode'), `${BASE}/methodenkompass/andere_methode/index_ger.html`),
  extractPage(read('rubric.html'), `${BASE}/journey_der_lehre/lehre_konzipieren/index_ger.html`),
]
const sources = { docs, teasers: [], search: new Map(), csv: parseMethodsCsv(read('methods.csv')) }
const report = emptyReport()
const ctx = await prepareContext(payload, sources, report, undefined, { downloadAssets: false })
await importDocs(payload, sources, ctx, report)
payload.logger.info(`E2E-Testinhalte: ${JSON.stringify(report.created)}, übersprungen ${report.skipped}, Fehler ${report.errors.length}`)
for (const e of report.errors) payload.logger.error(`${e.path}: ${e.error}`)
// Landingpage-Konzept (im Repository): ohne Altsite-Seiten bleiben alle Themen „folgt“
const topics = await importTopics(payload, path.resolve(process.cwd(), 'docs/konzept-landingpages'))
payload.logger.info(`E2E-Themen: ${topics.topics} Kernthemen, ${topics.subtopics} Unterthemen`)
process.exit(report.errors.length ? 1 : 0)
