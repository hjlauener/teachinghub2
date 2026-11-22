import { createHash } from 'crypto'
import { JSDOM } from 'jsdom'

import { legacyUrlToPath, normalizeLegacyUrl } from './urls'

/**
 * HTML der Altsite → strukturierte Felder (Plan Abschnitt 6).
 * Rich-Text-Abschnitte bleiben hier HTML; die Umwandlung in Lexical passiert beim Import.
 */

export type TargetCollection = 'articles' | 'methods' | 'tools' | 'pages' | 'news'

export type Sections = {
  whatIsBehind: string
  insights: { title: string; html: string }[]
  gettingStarted: string
  literature: string
  guides: string
  support: string
  /** „Alternative Methoden“ (nur Methoden): Pfad + Vergleichsnotiz */
  alternatives: { path: string; note: string }[]
}

export type ExtractedDoc = {
  collection: TargetCollection
  path: string
  legacyUrl: string
  legacyDate: string | null
  title: string
  lead: string
  /** Seiten: Einleitung (HTML) und Art der Seite */
  intro: string
  pageKind?: 'home' | 'journey' | 'rubric' | 'methods' | 'search' | 'about' | 'generic'
  sections: Sections
  parentPath: string | null
  kind?: 'article' | 'offer' | 'archive'
  /** Bilder und Dokumente im Inhalt (normalisierte Altsite-URLs, Alt-Text bzw. Linktext) */
  assets: { url: string; alt: string }[]
  /** Inhalts-Hash für den Delta-Abgleich – nur über inhaltliche Teile */
  hash: string
}

const emptySections = (): Sections => ({
  whatIsBehind: '',
  insights: [],
  gettingStarted: '',
  literature: '',
  guides: '',
  support: '',
  alternatives: [],
})

type SectionKey = 'whatIsBehind' | 'insights' | 'gettingStarted' | 'resources' | 'alternatives' | 'contact'

const text = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

export function sectionForHeading(heading: string): SectionKey | null {
  const h = text(heading).toLowerCase()
  if (h.startsWith('was steckt dahinter')) return 'whatIsBehind'
  if (h === 'einblicke') return 'insights'
  if (h.startsWith('stolperfrei durchstarten')) return 'gettingStarted'
  if (h === 'ressourcen') return 'resources'
  if (h.startsWith('alternative methoden')) return 'alternatives'
  if (h === 'kontakt') return 'contact'
  return null
}

export function resourceForLabel(label: string): 'literature' | 'guides' | 'support' | null {
  const l = text(label).toLowerCase()
  if (l.startsWith('literatur')) return 'literature'
  if (l.startsWith('anleitungen')) return 'guides'
  if (l.startsWith('beratung')) return 'support'
  return null
}

/** Zielsammlung und Seitenart aus dem Pfad (Analyse 3/4). */
export function classify(path: string): Pick<ExtractedDoc, 'collection' | 'pageKind' | 'kind' | 'parentPath'> {
  const parts = path.split('/').filter(Boolean)
  if (path === '/') return { collection: 'pages', pageKind: 'home', parentPath: null }
  if (path === '/journey_der_lehre') return { collection: 'pages', pageKind: 'journey', parentPath: null }
  if (path === '/methodenkompass') return { collection: 'pages', pageKind: 'methods', parentPath: null }
  if (path === '/suche') return { collection: 'pages', pageKind: 'search', parentPath: null }
  if (path === '/ueber_uns') return { collection: 'pages', pageKind: 'about', parentPath: null }
  if (parts[0] === 'ablage' && parts[1] === 'news') return { collection: 'news', parentPath: null }
  if (parts[0] === 'methodenkompass') return { collection: 'methods', parentPath: null }
  if (parts[0] === 'journey_der_lehre') {
    if (parts.length === 2) return { collection: 'pages', pageKind: 'rubric', parentPath: null }
    if (parts[1] === 'tools') {
      return { collection: 'tools', parentPath: parts.length > 3 ? `/${parts.slice(0, 3).join('/')}` : null }
    }
    const kind = parts[1] === 'lehrimpulse__unibe' ? 'offer' : 'article'
    // Unterseiten: Elternseite ist der Artikel eine Ebene höher, sofern dieser kein Themen-Ordner ist
    const parentPath = parts.length >= 5 ? `/${parts.slice(0, -1).join('/')}` : null
    return { collection: 'articles', kind, parentPath }
  }
  return { collection: 'pages', pageKind: 'generic', parentPath: null }
}

function cleanHtml(el: Element, baseUrl: string, assets: Map<string, string>): string {
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll('script, style, noscript, .visible-print, button, .sr-only').forEach((n) => n.remove())
  clone.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'))
  clone.querySelectorAll('img').forEach((img) => {
    const src = normalizeLegacyUrl(img.getAttribute('src') ?? '', baseUrl)
    if (src) {
      img.setAttribute('src', src)
      if (!assets.get(src)) assets.set(src, text(img.getAttribute('alt')) || text(img.getAttribute('title')))
    } else img.remove()
  })
  clone.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    const normalized = normalizeLegacyUrl(href, baseUrl)
    if (!normalized) return
    if (/\.(pdf|docx?|pptx?|xlsx?)$/i.test(new URL(normalized).pathname)) {
      a.setAttribute('href', normalized)
      if (!assets.get(normalized)) assets.set(normalized, text(a.textContent))
    } else if (/\/index_ger\.html$/.test(new URL(normalized).pathname)) {
      // Interne Links ohne Sprachpräfix speichern; die Website ergänzt die Sprache (Entscheidung 7.2)
      a.setAttribute('href', legacyUrlToPath(normalized))
    }
  })
  clone.querySelectorAll('iframe').forEach((iframe) => {
    const marker = clone.ownerDocument.createElement('p')
    marker.textContent = `§§VIDEO§§${iframe.getAttribute('src') ?? ''}§§${iframe.getAttribute('title') ?? ''}§§`
    iframe.replaceWith(marker)
  })
  return clone.innerHTML.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
}

/** Zeilen-Container der ZMS-Seite (direkte Inhaltsblöcke, nicht verschachtelt). */
function contentRows(main: Element): Element[] {
  return [...main.querySelectorAll('[class*="zmsrow-"]')].filter(
    (row) => !row.parentElement?.closest('[class*="zmsrow-"]'),
  )
}

const rowType = (row: Element) => [...row.classList].find((c) => c.startsWith('zmsrow-'))?.slice(7) ?? ''

export function extractPage(html: string, url: string): ExtractedDoc {
  const dom = new JSDOM(html)
  const doc = dom.window.document
  const path = legacyUrlToPath(url)
  const meta = (name: string) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? ''
  const main = doc.querySelector('main') ?? doc.body
  const title = text(main.querySelector('h1')?.textContent) || text(doc.title)
  const lead = text(meta('description') || meta('DC.Description'))
  const dcDate = meta('DC.Date')
  const legacyDate = /^\d{2}\.\d{2}\.\d{4}$/.test(dcDate)
    ? `${dcDate.slice(6)}-${dcDate.slice(3, 5)}-${dcDate.slice(0, 2)}`
    : null

  const classified = classify(path)
  const assets = new Map<string, string>()
  const sections = emptySections()
  const introParts: string[] = []
  let current: SectionKey | 'intro' = 'intro'

  const append = (key: SectionKey | 'intro', htmlPart: string) => {
    if (!htmlPart) return
    switch (key) {
      case 'intro':
        introParts.push(htmlPart)
        sections.whatIsBehind += htmlPart
        break
      case 'whatIsBehind':
        sections.whatIsBehind += htmlPart
        break
      case 'gettingStarted':
        sections.gettingStarted += htmlPart
        break
      case 'insights':
        if (sections.insights.length === 0) sections.insights.push({ title: 'Einblick', html: '' })
        sections.insights[sections.insights.length - 1].html += htmlPart
        break
      case 'resources':
      case 'contact':
        sections.support += htmlPart
        break
      case 'alternatives':
        break
    }
  }

  for (const row of contentRows(main)) {
    const type = rowType(row)
    const col = (row.querySelector('[class*="col-"]') ?? row) as Element

    if (['ontology_collection', 'newscontainer', 'codeblock', 'ZMSDataTable', 'linkcontainer'].includes(type)) continue

    if (type === 'infobox') {
      const heading = text(col.querySelector('.title-main')?.textContent)
      const sub = text(col.querySelector('.title-sub')?.textContent)
      col.querySelectorAll('.title-main, .title-sub').forEach((n) => n.remove())
      if (current === 'alternatives') {
        const target = linkedPaths(col, url).find((p) => p.startsWith('/methodenkompass/'))
        const note = text([...col.querySelectorAll('p')].map((p) => p.textContent).join(' '))
        if (target) sections.alternatives.push({ path: target, note })
        continue
      }
      const body = cleanHtml(col, url, assets)
      if (current === 'insights') sections.insights.push({ title: sub || heading || 'Einblick', html: body })
      else append(current, `${heading || sub ? `<h3>${heading || sub}</h3>` : ''}${body}`)
      continue
    }

    if (type === 'contenttabs') {
      // Rubrikseiten: Themen-Tabs werden in Phase 3 aus den Zuordnungen erzeugt, nicht kopiert
      if (classified.pageKind === 'rubric') continue
      for (const pane of col.querySelectorAll('.panel')) {
        const label = text(pane.querySelector('.panel-body h2.visible-print, .panel-title')?.textContent)
        const body = pane.querySelector('.panel-body')
        if (!body) continue
        const htmlPart = cleanHtml(body, url, assets)
        const resource = resourceForLabel(label)
        if ((current === 'resources' || current === 'intro' || current === 'contact') && resource) sections[resource] += htmlPart
        else if (current === 'alternatives') {
          for (const p of linkedPaths(body, url)) sections.alternatives.push({ path: p, note: '' })
        }
        else append(current, `${label ? `<h3>${label}</h3>` : ''}${htmlPart}`)
      }
      continue
    }

    // Textblöcke können mehrere H2 enthalten → an den Überschriften aufteilen
    const wrapper = col.cloneNode(true) as Element
    if (/^\s*Wegweiser:/.test(wrapper.textContent ?? '')) continue
    let buffer = doc.createElement('div')
    const flush = () => {
      append(current, cleanHtml(buffer, url, assets))
      buffer = doc.createElement('div')
    }
    // H2 können in Hilfs-Containern stecken: Container mit H2 werden aufgelöst, alles andere bleibt Einheit
    const units = (el: Element): ChildNode[] =>
      [...el.childNodes].flatMap((node) =>
        node.nodeType === 1 && (node as Element).tagName !== 'H2' && (node as Element).querySelector('h2')
          ? units(node as Element)
          : [node],
      )
    for (const node of units(wrapper)) {
      if (node.nodeType === 1 && (node as Element).tagName === 'H2') {
        flush()
        const heading = text(node.textContent)
        const section = sectionForHeading(heading)
        if (section) current = section
        else if (heading) buffer.appendChild(node.cloneNode(true))
        continue
      }
      if (current === 'alternatives' && node.nodeType === 1) {
        for (const p of linkedPaths(node as Element, url)) sections.alternatives.push({ path: p, note: '' })
        continue
      }
      buffer.appendChild(node.cloneNode(true))
    }
    flush()
  }

  const seenAlternatives = new Set<string>()
  sections.alternatives = sections.alternatives.filter(
    (a) => a.path.startsWith('/methodenkompass/') && a.path !== path && !seenAlternatives.has(a.path) && seenAlternatives.add(a.path),
  )
  const intro = introParts.join('')
  const hash = contentHash({ title, lead, sections, intro })

  return {
    ...classified,
    path,
    legacyUrl: url,
    legacyDate,
    title,
    lead,
    intro,
    sections,
    assets: [...assets].map(([assetUrl, alt]) => ({ url: assetUrl, alt })),
    hash,
  }
}

function linkedPaths(el: Element, baseUrl: string): string[] {
  return [...el.querySelectorAll('a[href]')]
    .map((a) => normalizeLegacyUrl(a.getAttribute('href') ?? '', baseUrl))
    .filter((u): u is string => Boolean(u))
    .map(legacyUrlToPath)
}

/** Stabiler Hash über die inhaltlichen Teile (Plan 6: Delta-Abgleich). */
export function contentHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

// ---- Such-Index: Rubrik-/Thema-Schlüssel je Pfad (Analyse 5.2) --------------------------------

export type SearchTag = { key: string; name: string }

export function parseSearchIndex(html: string): Map<string, SearchTag[]> {
  const dom = new JSDOM(html)
  const result = new Map<string, SearchTag[]>()
  for (const article of dom.window.document.querySelectorAll('article.mdl-article_filter')) {
    const href = article.querySelector('a[href]')?.getAttribute('href') ?? ''
    const url = normalizeLegacyUrl(href)
    if (!url) continue
    const tags = [...article.querySelectorAll('a.atm-tag[title]')]
      .map((a) => ({ key: a.getAttribute('title') ?? '', name: text(a.textContent) }))
      .filter((t) => t.key)
    result.set(legacyUrlToPath(url), tags)
  }
  return result
}

// ---- Methodenkompass-CSV (Analyse 5.1) ------------------------------------------------------

export type MethodCsvRow = { name: string; path: string; purposes: string[]; modalities: string[]; socialForms: string[]; effort: string }

/** Semikolon-CSV mit mehrzeiligen Mehrfachwerten in Anführungszeichen. */
export function parseMethodsCsv(csv: string): MethodCsvRow[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let quoted = false
  const input = csv.replace(/^﻿/, '')
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ';') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...data] = rows.filter((r) => r.some((c) => c.trim()))
  const idx = (name: string) => header.findIndex((h) => h.trim() === name)
  const multi = (v: string) => v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  return data.map((r) => {
    const link = normalizeLegacyUrl(r[idx('Link')] ?? '')
    return {
      name: (r[idx('Methode')] ?? '').trim(),
      path: link ? legacyUrlToPath(link) : '',
      purposes: multi(r[idx('Zweck')] ?? ''),
      modalities: multi(r[idx('Modalität')] ?? ''),
      socialForms: multi(r[idx('Sozialform')] ?? ''),
      effort: (r[idx('Aufwand')] ?? '').trim(),
    }
  })
}

// ---- Teaser der Startseite → News (Analyse 4) ------------------------------------------------

export type HomeTeaser = {
  title: string
  topic: string
  lead: string
  href: string
  image: string | null
  placement: 'focus' | 'news' | 'framework'
  section: string
}

export function extractHomeTeasers(html: string, baseUrl: string): HomeTeaser[] {
  const doc = new JSDOM(html).window.document
  const teasers: HomeTeaser[] = []
  let section = ''
  for (const el of doc.querySelectorAll('h2.mdl-teaser_container_head__title, .mdl-teaser_element')) {
    if (el.tagName === 'H2') {
      section = text(el.textContent)
      continue
    }
    const title = text(el.querySelector('h3')?.textContent)
    const rawHref = el.querySelector('a[href]')?.getAttribute('href') ?? ''
    if (!title || !rawHref) continue
    let href: string
    try {
      href = new URL(rawHref.replace(/&amp;/g, '&'), baseUrl).toString()
    } catch {
      continue
    }
    const internal = normalizeLegacyUrl(href)
    if (internal && /\/index_ger\.html$/.test(new URL(internal).pathname)) href = legacyUrlToPath(internal)
    const imgSrc = el.querySelector('img')?.getAttribute('src')
    const s = section.toLowerCase()
    teasers.push({
      title,
      topic: text(el.querySelector('.mdl-teaser_element__topic')?.textContent),
      lead: text(el.querySelector('.mdl-teaser_element__lead')?.textContent),
      href,
      image: imgSrc ? normalizeLegacyUrl(imgSrc, baseUrl) : null,
      placement: s.includes('fokus') ? 'focus' : s.includes('rahmen') ? 'framework' : 'news',
      section,
    })
  }
  const seen = new Set<string>()
  return teasers.filter((t) => !seen.has(t.title) && seen.add(t.title))
}
