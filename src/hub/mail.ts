/**
 * Benachrichtigungen an Mitglieder (Phase 5) in DE/EN/FR. Reine Funktionen: Betreff, Text und HTML.
 * Inhalte von Mitgliedern werden immer maskiert.
 */
export type MailLocale = 'de' | 'en' | 'fr'

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const paragraphs = (s: string) => escape(s).replace(/\n/g, '<br>')
const button = (url: string, label: string) =>
  `<p><a href="${escape(url)}" style="background:#d6002b;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block">${escape(label)}</a></p>`
const footer = {
  de: 'Diese Nachricht stammt vom Prototyp des Teaching Hub. Benachrichtigungen schalten Sie in „Mein Hub“ ab.',
  en: 'This message comes from the Teaching Hub prototype. You can turn off notifications in “My Hub”.',
  fr: 'Ce message provient du prototype du Teaching Hub. Vous pouvez désactiver les notifications dans « Mon Hub ».',
}

const SHARE = {
  de: {
    subject: (from: string) => `${from} hat etwas mit Ihnen geteilt`,
    intro: (from: string, title: string) => `${from} hat «${title}» mit Ihnen geteilt.`,
    message: 'Nachricht',
    open: 'In „Mein Hub“ ansehen',
  },
  en: {
    subject: (from: string) => `${from} shared something with you`,
    intro: (from: string, title: string) => `${from} shared “${title}” with you.`,
    message: 'Message',
    open: 'View in “My Hub”',
  },
  fr: {
    subject: (from: string) => `${from} a partagé quelque chose avec vous`,
    intro: (from: string, title: string) => `${from} a partagé « ${title} » avec vous.`,
    message: 'Message',
    open: 'Voir dans « Mon Hub »',
  },
}

const oneLine = (value: string, max: number) =>
  value.replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)

export function shareEmail(
  locale: MailLocale,
  input: { from: string; title: string; message: string; url: string },
) {
  const t = SHARE[locale]
  // Name und Titel stehen im Betreff: einzeilig und begrenzt (Schutz vor Header-Manipulation)
  input = { ...input, from: oneLine(input.from, 100), title: oneLine(input.title, 200) }
  const message = input.message ? `\n\n${t.message}:\n${input.message}` : ''
  return {
    subject: t.subject(input.from),
    text: `${t.intro(input.from, input.title)}${message}\n\n${t.open}: ${input.url}\n\n${footer[locale]}`,
    html: `<p>${escape(t.intro(input.from, input.title))}</p>${input.message ? `<p><strong>${t.message}:</strong><br>${paragraphs(input.message)}</p>` : ''}${button(input.url, t.open)}<p style="font-size:13px;color:#666">${escape(footer[locale])}</p>`,
  }
}

const REPLY = {
  de: {
    subject: 'Antwort auf Ihr Feedback zum Teaching Hub',
    intro: (place: string) => `Die Redaktion hat auf Ihr Feedback zu «${place}» geantwortet:`,
    yours: 'Ihr Feedback',
    open: 'In „Mein Hub“ ansehen',
  },
  en: {
    subject: 'Reply to your feedback on the Teaching Hub',
    intro: (place: string) => `The editorial team replied to your feedback on “${place}”:`,
    yours: 'Your feedback',
    open: 'View in “My Hub”',
  },
  fr: {
    subject: 'Réponse à votre feedback sur le Teaching Hub',
    intro: (place: string) => `La rédaction a répondu à votre feedback sur « ${place} » :`,
    yours: 'Votre feedback',
    open: 'Voir dans « Mon Hub »',
  },
}

export function feedbackReplyEmail(
  locale: MailLocale,
  input: { place: string; reply: string; message: string; url: string },
) {
  const t = REPLY[locale]
  return {
    subject: t.subject,
    text: `${t.intro(input.place)}\n\n${input.reply}\n\n${t.yours}:\n${input.message}\n\n${t.open}: ${input.url}`,
    html: `<p>${escape(t.intro(input.place))}</p><blockquote>${paragraphs(input.reply)}</blockquote><p style="color:#666"><strong>${t.yours}:</strong><br>${paragraphs(input.message)}</p>${button(input.url, t.open)}`,
  }
}

const DECISION = {
  de: {
    subject: 'Ihr Vorschlag an die Redaktion des Teaching Hub',
    accepted: (title: string) => `Ihr Vorschlag «${title}» wurde angenommen. Vielen Dank!`,
    rejected: (title: string) =>
      `Ihr Vorschlag «${title}» wurde geprüft und wird nicht übernommen.`,
    note: 'Bemerkung der Redaktion',
    open: 'In „Mein Hub“ ansehen',
  },
  en: {
    subject: 'Your suggestion to the Teaching Hub editors',
    accepted: (title: string) => `Your suggestion “${title}” has been accepted. Thank you!`,
    rejected: (title: string) =>
      `Your suggestion “${title}” has been reviewed and will not be adopted.`,
    note: 'Note from the editors',
    open: 'View in “My Hub”',
  },
  fr: {
    subject: 'Votre proposition à la rédaction du Teaching Hub',
    accepted: (title: string) => `Votre proposition « ${title} » a été acceptée. Merci !`,
    rejected: (title: string) =>
      `Votre proposition « ${title} » a été examinée et ne sera pas reprise.`,
    note: 'Remarque de la rédaction',
    open: 'Voir dans « Mon Hub »',
  },
}

export function suggestionDecisionEmail(
  locale: MailLocale,
  input: { title: string; accepted: boolean; note: string; url: string },
) {
  const t = DECISION[locale]
  const lead = input.accepted ? t.accepted(input.title) : t.rejected(input.title)
  return {
    subject: t.subject,
    text: `${lead}${input.note ? `\n\n${t.note}:\n${input.note}` : ''}\n\n${t.open}: ${input.url}`,
    html: `<p>${escape(lead)}</p>${input.note ? `<p><strong>${t.note}:</strong><br>${paragraphs(input.note)}</p>` : ''}${button(input.url, t.open)}`,
  }
}

export const asMailLocale = (value: unknown): MailLocale =>
  value === 'en' || value === 'fr' ? value : 'de'

/** Absolute URL zu „Mein Hub“ für Mails. */
export const hubUrl = (locale: MailLocale, anchor = '') =>
  `${(process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/${locale}/mein-hub${anchor}`
