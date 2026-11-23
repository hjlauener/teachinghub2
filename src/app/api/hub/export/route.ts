import { exportMemberData } from '@/hub/export'
import { currentMember, json } from '@/hub/server'

/** Konto-Export als Datei: GET → teachinghub-daten-JJJJ-MM-TT.json */
export async function GET(request: Request) {
  const member = await currentMember(request.headers)
  if (!member) return json({ error: 'unauthenticated' }, 401)
  const data = await exportMemberData(member)
  const date = data.exportedAt.slice(0, 10)
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="teachinghub-daten-${date}.json"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
