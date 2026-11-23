import type { Queryable } from './database'
import { HUB_SCHEMA } from './database'

/**
 * Rate-Limit pro Mitglied und Aktion in der Datenbank (Review Architektur): gilt über Neustarts und mehrere
 * Server-Instanzen hinweg. Liefert false, wenn das Limit im Zeitfenster erreicht ist (dann wird nichts gezählt).
 */
export async function hitRateLimit(db: Queryable, memberId: string, action: string, max: number, windowSeconds: number): Promise<boolean> {
  const { rows } = await db.query<{ n: string }>(
    `select count(*) as n from ${HUB_SCHEMA}.rate_events where member_id = $1 and action = $2 and created_at > now() - make_interval(secs => $3)`,
    [memberId, action, windowSeconds],
  )
  if (Number(rows[0]?.n ?? 0) >= max) return false
  await db.query(`insert into ${HUB_SCHEMA}.rate_events (member_id, action) values ($1, $2)`, [memberId, action])
  // Alte Einträge gelegentlich aufräumen
  if (Math.random() < 0.02) await db.query(`delete from ${HUB_SCHEMA}.rate_events where created_at < now() - interval '1 day'`)
  return true
}
