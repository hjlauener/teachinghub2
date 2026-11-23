import path from 'path'

/**
 * Einstellungen des Importers (Plan Abschnitt 6, Entscheidungen 3.1–3.3).
 * Rohdaten der Altsite landen in `data/legacy/` – gitignored, nie im Repository (Entscheidung 5.2b).
 */
export const LEGACY_ORIGIN = 'https://teachinghub.unibe.ch'
export const LEGACY_START = `${LEGACY_ORIGIN}/index_ger.html`
export const SEARCH_INDEX_URL = `${LEGACY_ORIGIN}/e1701260/e1758441/collection_view?lang=ger&id=e1758441&q=&offset=0&size=500&`
/** ZMS liefert Inhalte der Microsite auch unter diesem internen Pfad aus. */
export const LEGACY_INTERNAL_PREFIX = '/unibe/portal/microsites/micro_teachinghub/content'

export const DATA_DIR = path.resolve(process.cwd(), 'data/legacy')
export const PAGES_DIR = path.join(DATA_DIR, 'pages')
export const ASSETS_DIR = path.join(DATA_DIR, 'assets')
export const MANIFEST_FILE = path.join(DATA_DIR, 'manifest.json')
export const SEARCH_FILE = path.join(DATA_DIR, 'search.html')
export const METHODS_CSV_FILE = path.join(DATA_DIR, 'methodenkompass.csv')

/** Neutraler User-Agent ohne Personendaten. */
export const USER_AGENT = 'TeachingHub2-Importer/0.1 (Prototyp)'
export const REQUEST_DELAY_MS = 300

/** Aus robots.txt der Altsite (Stand 22.11.2026) plus technische Seiten. */
export const DISALLOWED_PATH_PARTS = [
  '/error',
  '/icons',
  '/ajax_',
  '/getJSON',
  'manage',
  'preview',
  'sitemap_',
  'index_print',
  'search_',
  'nav_portal',
  'nav_uniintern',
  'catalog_',
  'index_access',
  'f_zoomImage',
]

/** Dateien, die als Kopie in die Mediathek übernommen werden (Entscheidung 3.1). */
export const ASSET_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
