import { getTranslations } from 'next-intl/server'

/** Pflichthinweis auf jeder Seite (Entscheidung 1.3a). */
export async function PrototypeNotice() {
  const t = await getTranslations('Site')

  return (
    <div className="prototype-notice" role="note" data-testid="prototype-notice">
      <strong>{t('prototypeNotice')}</strong>
    </div>
  )
}
