/**
 * Paritätscheck (Entscheidung 9.1): Hat jede gecrawlte Altsite-Seite ein Gegenstück (HTTP 200)
 * und leitet ihre alte URL dorthin um (301)? `npm run legacy:parity` (Server muss laufen).
 */
import { readManifest } from '../../src/migration/crawl'

const base = process.env.PARITY_BASE_URL ?? 'http://localhost:3000'
const manifest = await readManifest()
const problems: string[] = []
let ok = 0
for (const page of manifest.pages) {
  const target = page.path === '/' ? '/de' : `/de${page.path}`
  const response = await fetch(`${base}${target}`, { redirect: 'manual' })
  const legacy = await fetch(`${base}${page.path === '/' ? '' : page.path}/index_ger.html`, { redirect: 'manual' })
  const location = legacy.headers.get('location') ?? ''
  const redirectOk = legacy.status === 301 && new URL(location, base).pathname === target
  if (response.status === 200 && redirectOk) ok++
  else problems.push(`${page.path}: Seite ${response.status}, alte URL ${legacy.status} → ${location || '–'}`)
}
console.log(`Parität: ${ok}/${manifest.pages.length} Seiten erreichbar und umgeleitet.`)
for (const p of problems) console.log(`  ✗ ${p}`)
process.exit(problems.length ? 1 : 0)
