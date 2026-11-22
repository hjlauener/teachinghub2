import { getTranslations } from 'next-intl/server'

import { externalLinks } from '@/config/navigation'

export async function SiteFooter() {
  const t = await getTranslations('Footer')
  const site = await getTranslations('Site')

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact">{t('contactHeading')}</h2>
          <address id="address">
            {site('university')}
            <br />
            {t('contactName')}
            <br />
            {t('contactStreet')}
            <br />
            {t('contactCity')}
          </address>
        </section>
        <nav aria-label={site('title')} id="nav-service">
          <ul>
            <li>
              <a href={externalLinks.portal}>{t('portal')}</a>
            </li>
            <li>
              <a href={externalLinks.legal}>{t('legal')}</a>
            </li>
            <li>
              <a href={externalLinks.imprint}>{t('imprint')}</a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
