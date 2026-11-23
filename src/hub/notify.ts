import 'server-only'

import { getPayloadClient } from '@/lib/content'

import { hubDatabase } from './database'
import { hubUrl, type MailLocale, shareEmail } from './mail'
import { getPreferences, type MemberInfo } from './repo-collections'
import type { Member } from './server'

/**
 * Mail „… hat etwas mit Ihnen geteilt“ – nur, wenn die Person Benachrichtigungen nicht abgeschaltet hat
 * (Entscheidung 8.3). Ein Mailfehler bricht das Teilen nicht ab; der Eintrag steht trotzdem in „Mein Hub“.
 */
export async function notifyShare(
  sender: Member,
  recipient: MemberInfo,
  /** Titel fest (Sammlung) oder pro Sprache der Empfänger:in (öffentlicher Inhalt). */
  input: { title: string | ((locale: MailLocale) => Promise<string>); message: string },
): Promise<boolean> {
  const prefs = await getPreferences(hubDatabase(), recipient.id)
  if (!prefs.notifyShares) return false
  try {
    const payload = await getPayloadClient()
    const title = typeof input.title === 'string' ? input.title : await input.title(prefs.locale)
    await payload.sendEmail({
      to: recipient.email,
      ...shareEmail(prefs.locale, {
        from: sender.name || sender.email,
        title,
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
