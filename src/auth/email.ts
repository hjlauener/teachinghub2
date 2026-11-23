/** Mail mit dem Anmeldelink, in der Sprache der Seite, von der aus angefordert wurde. */
const TEXT = {
  de: {
    subject: 'Ihr Anmeldelink für den Teaching Hub (Prototyp)',
    intro: 'Mit diesem Link melden Sie sich beim Teaching Hub an. Er ist 15 Minuten gültig und funktioniert nur einmal.',
    button: 'Jetzt anmelden',
    ignore: 'Sie haben keinen Link angefordert? Dann können Sie diese Mail ignorieren.',
  },
  en: {
    subject: 'Your sign-in link for the Teaching Hub (prototype)',
    intro: 'Use this link to sign in to the Teaching Hub. It is valid for 15 minutes and works only once.',
    button: 'Sign in now',
    ignore: 'Did not request a link? You can ignore this email.',
  },
  fr: {
    subject: 'Votre lien de connexion au Teaching Hub (prototype)',
    intro: 'Ce lien vous permet de vous connecter au Teaching Hub. Il est valable 15 minutes et ne fonctionne qu’une fois.',
    button: 'Se connecter',
    ignore: 'Vous n’avez pas demandé de lien ? Ignorez simplement cet e-mail.',
  },
} as const

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function magicLinkEmail(url: string, locale: 'de' | 'en' | 'fr') {
  const t = TEXT[locale]
  return {
    subject: t.subject,
    text: `${t.intro}\n\n${url}\n\n${t.ignore}`,
    html: `<p>${t.intro}</p><p><a href="${escape(url)}" style="background:#d6002b;color:#fff;padding:12px 24px;text-decoration:none;display:inline-block">${t.button}</a></p><p style="font-size:13px;color:#666">${escape(url)}</p><p style="font-size:13px;color:#666">${t.ignore}</p>`,
  }
}
