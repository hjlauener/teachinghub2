/**
 * KI-Index aufbauen bzw. abgleichen (Phase 6): `npm run ai:reindex`
 * Lädt beim ersten Mal das Embedding-Modell in Ollama (bge-m3, ca. 1,2 GB) und bettet danach nur
 * geänderte Abschnitte neu ein. Idempotent; nach Importen (legacy:import, topics:import) ausführen.
 */
import { getPayload } from 'payload'

import config from '@payload-config'

import { configuredEmbedder } from '../../src/ai/embed'
import { reindexAll } from '../../src/ai/indexer'
import { indexStats } from '../../src/ai/index-repo'
import { hubDatabase } from '../../src/hub/database'

const embedder = configuredEmbedder()
if (process.env.AI_EMBEDDER !== 'fake') {
  const base = (process.env.OLLAMA_URL ?? 'http://ollama:11434').replace(/\/$/, '')
  const model = process.env.EMBEDDING_MODEL ?? 'bge-m3'
  console.log(`Embedding-Modell ${model} in Ollama bereitstellen …`)
  const response = await fetch(`${base}/api/pull`, { method: 'POST', body: JSON.stringify({ model, stream: false }) })
  if (!response.ok) throw new Error(`Ollama (${base}) antwortet mit ${response.status} – läuft der Dienst „ollama“?`)
}

const payload = await getPayload({ config })
const result = await reindexAll(payload, (msg) => payload.logger.info(msg))
const stats = await indexStats(hubDatabase())
payload.logger.info(`KI-Index (${embedder.name}): ${result.documents} Dokumente geprüft, ${result.embedded} Abschnitte neu eingebettet; total ${stats.chunks} Abschnitte aus ${stats.documents} Dokumenten.`)
process.exit(0)
