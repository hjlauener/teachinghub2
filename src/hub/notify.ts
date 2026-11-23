import 'server-only'

import { getPayloadClient } from '@/lib/content'

import { hubDatabase } from './database'
import { hubUrl, shareEmail } from './mail'
import { getPreferences, type MemberInfo } from './repo-collections'
import type { Member } from './server'

/**
 * Mail „… hat etwas mit Ihnen geteilt“ – nur, wenn die Person Benachrichtigungen nicht abgeschaltet hat
 * (Entscheidung 8.3). Ein Mailfehler bricht das Teilen nicht ab; der Eintrag steht trotzdem in „Mein Hub“.
 */
export async function notifyShare(
  sender: Member,
  recipient: MemberInfo,
  input: { title: string; message: string },
): Promise<boolean> {
  const prefs = await getPreferences(hubDatabase(), recipient.id)
  if (!prefs.notifyShares) return false
  try {
    const payload = await getPayloadClient()
    await payload.sendEmail({
      to: recipient.email,
      ...shareEmail(prefs.locale, {
        from: sender.name || sender.email,
        title: input.title,
        message: input.message,
        url: hubUrl(prefs.locale, '#geteilt'),
      }),
    })
    return true
  } catch (error) {
    console.error('[Teilen] Mail nicht versendet', error)
    return false
  }
}
