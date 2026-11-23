// Legt eine zusätzliche PostgreSQL-Datenbank an (CI: eigene DB für Integrationstests).
// Aufruf: node scripts/ci/create-db.mjs <DATABASE_URL>
import pg from 'pg'

const target = new URL(process.argv[2])
const name = target.pathname.slice(1)
const admin = new URL(target)
admin.pathname = '/postgres'
const client = new pg.Client({ connectionString: admin.toString() })
await client.connect()
const exists = await client.query('select 1 from pg_database where datname = $1', [name])
if (exists.rowCount === 0) await client.query(`create database "${name.replace(/"/g, '')}"`)
await client.end()
console.log(`Datenbank ${name} bereit.`)
