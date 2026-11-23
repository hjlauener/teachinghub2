import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/** Review Sicherheit: keine SVG-Dateien in der Mediathek (können Skripte enthalten). */
let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  await payload?.destroy()
})

describe('Mediathek', () => {
  it('lehnt SVG-Uploads ab', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'Test-SVG' },
        file: { data: svg, mimetype: 'image/svg+xml', name: 'test.svg', size: svg.length },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })
})
