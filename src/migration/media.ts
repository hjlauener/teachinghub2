import { createHash } from 'crypto'
import path from 'path'
import type { Payload } from 'payload'

import { REQUEST_DELAY_MS, USER_AGENT } from './config'
import type { MediaRef } from './lexical'

/** Übernommene Dateitypen; SVG bewusst nicht (können Skripte enthalten). */
const MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function fileNameFor(url: string): string {
  const base = decodeURIComponent(new URL(url).pathname.split('/').pop() || 'datei')
  return base.replace(/[^\w.\-äöüÄÖÜ]+/g, '_')
}

/**
 * Bilder und Dokumente der Altsite in die Mediathek kopieren (Entscheidung 3.1).
 * Bereits übernommene Dateien (gleiche Altsite-URL) werden wiederverwendet.
 */
export async function importAssets(
  payload: Payload,
  assets: { url: string; alt: string }[],
  log: (msg: string) => void = () => undefined,
): Promise<{ media: Map<string, MediaRef>; failed: { url: string; error: string }[] }> {
  const media = new Map<string, MediaRef>()
  const failed: { url: string; error: string }[] = []

  const existing = await payload.find({ collection: 'media', limit: 0, pagination: false, depth: 0, overrideAccess: true })
  for (const doc of existing.docs) {
    if (doc.legacy?.url && doc.url) media.set(doc.legacy.url, { id: doc.id, url: doc.url })
  }

  const unique = [...new Map(assets.map((a) => [a.url, a])).values()].filter((a) => !media.has(a.url))
  let done = 0
  for (const asset of unique) {
    const ext = path.extname(new URL(asset.url).pathname).slice(1).toLowerCase()
    const mimetype = MIME[ext]
    if (!mimetype) continue
    try {
      const response = await fetch(asset.url, { headers: { 'User-Agent': USER_AGENT } })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = Buffer.from(await response.arrayBuffer())
      const name = fileNameFor(asset.url)
      const doc = await payload.create({
        collection: 'media',
        locale: 'de',
        overrideAccess: true,
        data: {
          alt: asset.alt || name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
          credit: 'Teaching Hub, Universität Bern (Altsite)',
          legacy: { url: asset.url, hash: createHash('sha256').update(data).digest('hex') },
        },
        file: { data, mimetype, name, size: data.length },
      })
      if (doc.url) media.set(asset.url, { id: doc.id, url: doc.url })
    } catch (error) {
      failed.push({ url: asset.url, error: String(error) })
    }
    if (++done % 25 === 0) log(`${done}/${unique.length} Dateien …`)
    await sleep(REQUEST_DELAY_MS)
  }
  return { media, failed }
}
