# TeachingHub2 – Umsetzungsplan

**Version:** 1.0 (nach grill-me)  
**Stand:** 22.11.2026  
**Grundlagen:** [analyse-teachinghub-unibe.md](analyse-teachinghub-unibe.md) · [entscheidungen.md](entscheidungen.md) (IDs in Klammern) · [konzept-landingpages/](konzept-landingpages/) · [referenz/feedback-dialog.png](referenz/feedback-dialog.png)

---

## 1. Ziel und Rahmen

Neubau von teachinghub.unibe.ch als **Prototyp, der übergabefähig gebaut wird** (1.1). Du baust ihn allein mit Claude (1.4), lokal per Docker (1.2), im **vollen UniBE-CD** mit Prototyp-Hinweis (1.3, 1.3a). Die Redaktion bzw. das Vizerektorat Lehre wird **jetzt schon** informiert (3.3).

1. **Parität:** gleiche Navigation, Seitentypen und Funktionen wie die heutige ZMS-Site, ergänzt um den Menüpunkt „Themen“ (7.5).
2. **Landingpages „Themen der Lehre“** mit Kategorien A/B/C, Kapitel-Labels und Matrix Themen × Journey (7.4, 7.6).
3. **Inhalte vollständig migriert** mit Delta-Abgleich; die Altsite bleibt bis zur Umschaltung Quelle (3.1, 3.2).
4. **Dreisprachig** DE/EN/FR, maschinelle Übersetzung beim Aufruf, menschliche Übersetzung hat Vorrang (4.1–4.3).
5. **Accounts** mit `@unibe.ch` per Magic Link, später SWITCH edu-ID (2.1, 2.2, 6.1, 6.2).
6. **Personalisierung:** Like, Bookmark, Feedback-Dialog, Meine Methoden/Tools, Teilen, Ask-a-question mit eigenem API-Key (2.3, 8.1–8.7).

## 2. Architektur (5.1, 5.2, 8.6)

| Bereich | Entscheidung |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| CMS | Payload CMS 3 (in Next.js), Feld-Lokalisierung, Entwürfe/Versionen, Rollen, eigene Admin-Views |
| Datenbank | PostgreSQL + `pgvector` |
| Auth | Better Auth: Magic Link + Passkey, Domain-Regel, generischer OIDC-Provider |
| Suche | Postgres-Volltext + Facetten (gemeinsamer Index aller Inhaltstypen) |
| Embeddings | Lokales Open-Source-Modell (z. B. `bge-m3`) via Ollama-Container |
| KI-Antworten | Adapter: Anthropic · OpenAI · „OpenAI-kompatibel“ (Base-URL frei), Key des Mitglieds |
| Maschinelle Übersetzung | Google Cloud Translation über austauschbaren Adapter, Cache pro Abschnitt + DE-Hash |
| Styling | UniBE-CD als Design-Tokens, Komponenten nach Portal-Theme 2022 |
| Container lokal | App · Postgres · Mailpit · Ollama (+ Keycloak ab Phase 7) |
| Code | Git + öffentliches GitHub-Repo `hjlauener/teachinghub2` (5.2b), GitHub Actions, Branch + PR pro Feature; Secrets nur in `.env`/GitHub Secrets |

## 3. Inhaltsmodell

| Collection | Zweck | Wichtige Felder |
|---|---|---|
| `articles` | Journey-Artikel (≈ 145) und Angebote (≈ 30) | Titel, Lead, Pfad, Rubriken[] + Themen[] (n:m), feste Abschnitte (*Was steckt dahinter* · *Einblicke* 1..n · *Stolperfrei durchstarten* · *Ressourcen* · *Kontakt*), freie Blöcke (Infobox, Zweispalter, Video, Alertbox, Linkliste), SEO, `legacyUrl`, `legacyDate`, `legacyHash`, Feld-Flag „lokal geändert“ |
| `pages` | Start, Journey-Übersicht, Rubrikseiten, Über uns, Archivlisten, Themenübersicht | Blöcke, Rubrik-Tabs (je Thema: Beschreibung + automatische Artikelliste) |
| `methods` | Methodenkompass (67) | Zweck[], Modalität[], Sozialform[], Aufwand (ordinal), Abschnitte wie Artikel + *Alternative Methoden*, „Kommt vor in“ (Kern-/Unterthemen) |
| `tools` | 15 Tools + 14 Unterseiten | wie Artikel + Zugang/Login-Link, FAQ, Antrag |
| `topics` | Kernthemen, Landingpage Ebene 1 (14) | **Kategorie A/B/C**, Kurzbeschreibung, Journey-Bezug[], Status *folgt / Themenseite*, 9 Kapitel: Einstieg · Auf einen Blick · Passend zum Thema · Tools · Entlang der Journey · Aus der Praxis · Angebote · Hinweise anderer Hochschulen · Siehe auch |
| `subtopics` | Unterthemen, Ebene 2 (59) | genau ein Kernthema, Journey-Phase, Methoden[] mit „wofür hier“, 9 Kapitel: Worum geht es? · Wann lohnt es sich? · So gehen Sie vor · Passende Methoden · Tools an der UniBE · Aus der Praxis · Stolpersteine · Unterstützung und Weiterlesen · Siehe auch |
| Block `annotatedLink` | Kommentierter Link | Ziel (Relation/URL), Titel, genau ein Satz, **Label** (Taxonomie), Stand-Datum |
| `taxonomies` | Rubrik (8), Thema (25), Methoden-Kategorien, **Landingpage-Labels** (Aktuell · Veranstaltung · Community · Beratung · Förderung · Für Studierende · Journey-Phase · Hochschule) | Typ, Name, Reihenfolge |
| `news` | Teaser Startseite | Titel, Lead, Bild, Link, Datum, sichtbar bis |
| `media` | Bilder, PDFs, Office | Alt-Text (Pflicht, lokalisiert), `legacyUrl`, Hash, privat/öffentlich |
| `contacts` | Kontaktboxen | Name, Funktion, E-Mail, Telefon |
| `navigation` (Global) | Hauptmenü, Footer | lokalisiert |
| `translationCache` | Maschinelle Übersetzungen | Ziel, Abschnitt, Sprache, DE-Hash, Text, Datum |

**Nutzerdaten:** `users`, `likes`, `bookmarks`, `collections` (+ Einträge, Notizen), `shares`, `feedback`, `suggestions` (Vorschläge an Redaktion), `ai_keys` (verschlüsselt), `ai_questions`, `notifications`.

## 4. Öffentliche Site (Parität + Erweiterungen)

- **Navigation (7.5):** Startseite · Journey der Lehre · **Themen** · Methodenkompass · Suche · Über uns; Mega-Menü, Breadcrumb, Footer, Kontaktbox.
- **Startseite:** Intro mit CTAs *Journey starten* · *Themen entdecken* · *Inhalte suchen*; Fokus-Teaser, Kurse/Fachveranstaltungen, News, Rahmenbedingungen.
- **Journey der Lehre (7.1):** wie heute – Titel + aufgeklapptes Journey-Menü, als native Komponente.
- **Rubrikseiten (7.6a):** Intro + Tabs „Etappen“ je Thema mit automatisch gefilterten Artikelkarten (Rubrik-/Thema-Tags).
- **Artikel/Methoden/Tools:** Vorlage mit Wegweiser, festen Abschnitten, Teilen (Link, E-Mail, LinkedIn).
- **Methodenkompass:** Tabelle mit 4 Filtern, Volltext, Sortierung (inkl. „Beliebt“).
- **Suche (7.3):** gemeinsamer Index, Facetten Typ · Rubrik · Thema, bei Methoden zusätzlich Zweck/Modalität/Sozialform/Aufwand.
- **URLs (7.2):** `/de|en|fr/<alter Pfad>`; Regel-Redirect `…/index_ger.html` → `/de/…` usw.

## 5. Landingpages „Themen der Lehre“ (7.4, 7.6)

- **Themenübersicht** mit zwei Ansichten (per Hash verlinkbar):
  - *Nach Thema:* gruppiert nach **Kategorie A Kernthemen · B Ergänzende Themen** (C nur intern), je ein Satz, „folgt“ ohne Seite.
  - *Themen × Journey:* Matrix Kernthemen × 6 Phasen, Kreisgrösse = Anzahl Seiten, Detailband; **automatisch aus Relationen berechnet**.
- **Kernthema- und Unterthema-Seiten** nach den Kapitel-Vorlagen; kommentierte Links mit **Kategorie-Labels** (z. B. Angebote: Veranstaltung · Community · Beratung · Förderung · Für Studierende; Entlang der Journey: Phase); „Siehe auch“ als Chips.
- **Redaktionsprüfungen:** Kernthema < 5 Seiten → „zu dünn“; Unterthema genau ein Kernthema; 3–8 Unterthemen pro Kernthema; kommentierter Link = genau ein Satz.
- **Import:** Themenstruktur (14/59), `Methoden_Zuordnung.csv`, Entwürfe *KI in Lehre und Studium* und *Digitale und hybride Lehre*.
- Eigene Inhalte von TeachingHub2 → nicht im Delta-Abgleich.

## 6. Migration & Delta-Abgleich (3.1–3.3)

1. **Importer** (CLI): Crawl der Altsite (robots.txt, gedrosselt) oder ZMS-Export, falls die Redaktion ihn liefert (3.3b); Methodenkompass-CSV; Such-Facetten; HTML → Payload-Blöcke; Bilder und Dokumente des Hubs in die Mediathek; Videos bleiben Tobira-/Opencast-Einbettungen; externe Dokumente bleiben Links.
2. Pro Eintrag `legacyUrl`, `legacyDate` (`DC.Date`), `legacyHash`.
3. **Delta-Lauf** per Admin-Button und wöchentlich: `DC.Date` → Hash → **Migrations-Inbox** *neu / geändert / entfernt* mit Diff; lokal geänderte Felder → **Konflikt mit 3-Wege-Ansicht** (Basis / Altsite neu / lokal). Nie automatisches Überschreiben.
4. Übernommene DE-Änderungen invalidieren den Übersetzungs-Cache und markieren menschliche Übersetzungen als *veraltet*.
5. Gecrawlte Rohdaten liegen nicht im Repo.

## 7. Mehrsprachigkeit (4.1–4.3)

- DE Quelle, EN und FR aktiv; UI-Texte via `next-intl` immer übersetzt.
- Ohne menschliche Übersetzung: **Live-Übersetzung beim Aufruf** (gecacht pro Abschnitt), Banner „Maschinell übersetzt“, `noindex`; `hreflang` nur für geprüfte Übersetzungen; bei Ausfall DE mit Hinweis.
- Nur öffentliche Inhalte gehen an den Übersetzungsdienst.
- Rolle **Übersetzer:in:** Übersetzungsansicht DE ↔ Ziel, Status *fehlt / maschinell / übersetzt / veraltet*, Dashboard je Sprache; „Maschinelle Fassung übernehmen“ (4.3a, Vorschlag).

## 8. Accounts & Rollen (2.1–2.3, 6.1, 6.2)

| Rolle | Rechte |
|---|---|
| Gast | lesen, suchen, filtern, öffentlich teilen |
| Mitglied | + Like, Bookmark, Feedback, Meine Methoden/Tools, Vorschlag an Redaktion, Teilen an Mitglieder, Ask-a-question |
| Übersetzer:in | + Übersetzungen |
| Redaktion | + Inhalte, Migrations-Inbox, Feedback-/Vorschlags-Inbox, Statistiken |
| Admin | + Benutzer, Rollen, Einstellungen (Registrierungsmodus, Domain-Liste, KI-Modellliste) |

- Registrierung: Selbstregistrierung nur `@unibe.ch`, Modus *Einladung / Domains / offen* umschaltbar.
- Login: **Magic Link** (15 Min., einmalig) + optional Passkey; keine Passwörter.
- edu-ID: generischer OIDC ab Phase 4; Phase 7 Test mit Keycloak (Claims: ID, E-Mail, Name, Affiliation); Kontoverknüpfung über E-Mail; echte Anbindung = Konfigurationswechsel nach Registrierung über UniBE (6.2a).

## 9. Personalisierte Funktionen (8.1–8.7)

| Funktion | Umsetzung |
|---|---|
| **Like** | Herz; Zahl öffentlich ab 3; anonym (nur Zähler + eigene Likes); Sortierung „Beliebt“; Redaktions-Statistik |
| **Bookmark** | Merken mit optionaler Notiz, Liste in „Mein Hub“ |
| **Feedback** | Dialog nach Vorlage: annotierbarer Screenshot (Zeichnen, Rückgängig, Löschen, 3 Strichstärken, „Bild mitsenden“), Stelle, Art *Fehler · Verbesserung · Idee · Frage*, Freitext, eigenes Bild/Ctrl+V; **nur mit Login** (Gäste → Magic Link → zurück zur Stelle); Inbox *neu / in Arbeit / erledigt*, Antwort per Mail, eigenes Feedback löschbar; Alternative ohne Zeichnen (a11y) |
| **Meine Methoden / Meine Tools** | private Sammlungen mit Notizen/Varianten; „Der Redaktion vorschlagen“ → Vorschlags-Inbox |
| **Teilen** | öffentlich: Link, E-Mail, LinkedIn; „an Kolleg:in“ **nur an Mitglieder** (Inbox + Mail); Sammlungen lesen/bearbeiten, widerrufbar, Kopie übernehmen; keine geheimen Links |
| **Ask-a-question** | eigener API-Key (verschlüsselt, AES-GCM, nur serverseitig, löschbar), Anbieter-Adapter, Retrieval über lokalen Index, **Antworten nur aus Hub-Inhalten** mit Quellenlinks; ohne Quelle: Hinweis + Suchvorschläge + „Inhalt fehlt melden“; Token-Anzeige, optionales Monatslimit; Verlauf in „Mein Hub“ |
| **Mein Hub** | Dashboard: Likes, Bookmarks, Sammlungen, Geteiltes (Inbox), Feedback-Status, KI-Verlauf, KI-Einstellungen, Konto-Export/-Löschung |

## 10. Qualität (9.1)

WCAG 2.1 AA · CI bei jedem PR: Unit-Tests, Playwright-E2E der Kernflüsse, axe auf allen Seitentypen · Paritätscheck gegen `seiteninventar.csv` (257 Seiten + Redirects) · Lighthouse mobil ≥ 90 · Schweizer DSG, keine Tracking-Cookies · Dependabot, Rate-Limits, Security-Header, tägliches Backup ab Online-Demo.

## 11. Meilensteine und Phasen (10.1)

| Meilenstein | Phase | Inhalt | Abnahme |
|---|---|---|---|
| **M1 Inhalte & Parität** | 0 Setup ✅ (22.11.2026) | Git/GitHub, Docker (App, Postgres, Mailpit), CI, UniBE-CD-Tokens, i18n-Gerüst, Prototyp-Hinweis | `docker compose up` → leere Site DE/EN/FR, CI grün |
| | 1 Inhaltsmodell ✅ (22.11.2026) | Collections, Taxonomien, Rollen, Admin-Views | Redaktion legt Artikel/Methode/Thema an |
| | 2 Migration ✅ (23.11.2026) | Importer, Medien, Migrations-Inbox, 3-Wege-Konflikt, Redirect-Regel | alle 257 Seiten + 67 Methoden importiert, Delta-Lauf erkennt Teständerung |
| | 3 Öffentliche Site | Navigation, Start, Journey, Rubrikseiten, Vorlagen, Methodenkompass, Suche, Über uns, Live-Übersetzung | Paritätscheck 100 %, axe grün, Lighthouse ≥ 90 |
| | 3b Landingpages | Topics/Subtopics, Kategorien A/B/C, Labels, Übersicht + Matrix, Prüfungen, Importe | Übersicht + 2 Kernthemen online (lokal), Matrix = Relationen |
| → | | **Folgetermin mit der Redaktion: Demo M1** | |
| **M2 Mitglieder** | 4 Accounts | Magic Link, Passkey, Domain-Regel, Profil, Rollen, OIDC-Vorbereitung | E2E Auth grün |
| | 5 Personalisierung | Like, Bookmark, Feedback-Dialog, Sammlungen, Vorschläge, Teilen, Mein Hub | E2E aller Flüsse grün |
| **M3 KI** | 6 Ask-a-question | Ollama-Embeddings, Index, Adapter, BYOK, Quellenpflicht | Antworten nur mit Quellen; Key nie im Browser |
| **M4 Login & Demo** | 7 edu-ID-Test | Keycloak, Kontoverknüpfung, Affiliation | Login via Test-IdP |
| | 8 Online-Demo | Schweizer Hoster (1.2a), Zugangsschutz, `noindex`, Backup, Testpersonen | 3–5 Dozierende testen |

## 12. Projektstruktur

```
TeachingHub2/
├─ .claude/skills/grill-me-teachinghub/SKILL.md
├─ docs/                     Analyse, Plan, Entscheidungen, Konzept Landingpages, Referenzen
├─ src/app/                  Next.js (Site + Payload Admin)
├─ src/collections/          Payload-Collections
├─ src/features/             like, bookmark, feedback, collections, share, ask, translate
├─ src/design/               UniBE-CD-Tokens und Komponenten
├─ scripts/migration/        Crawler/Importer, Delta, Paritätscheck
├─ tests/                    Vitest, Playwright, axe
└─ docker-compose.yml
```

## 13. Offene Punkte

| ID | Punkt | Wann nötig |
|---|---|---|
| 1.2a | Schweizer Hoster für Demo | vor Phase 8 |
| 1.3a | Auflagen CD (Prototyp-Hinweis, Schriftlizenz) | Phase 0 |
| 3.3a | Briefing/One-Pager für das Gespräch mit der Redaktion | jetzt |
| 3.3b | Importquelle ZMS-Export oder Crawl | Phase 2 |
| 4.3a | „Maschinelle Fassung übernehmen“ für Übersetzer:in | Phase 3 |
| 5.2a | Umzug ins UniBE-GitLab | bei Übergabe |
| 6.2a | Registrierung bei SWITCH über UniBE | vor echter edu-ID |
| 8.2b | Bestimmung der „Stelle“ im Feedback | Phase 5 |

## 14. Risiken

- **Freigabe** von Inhalten und CD durch die UniBE → Gespräch jetzt (3.3).
- **ZMS-HTML uneinheitlich** → manuelle Nacharbeit im Importer einplanen.
- **Kosten/Datenschutz der Live-Übersetzung** → Cache, nur öffentliche Inhalte, Anbieter austauschbar.
- **KI-Antwortqualität** bei Lücken im Inhalt → strikte Quellenpflicht, Lücken an Redaktion melden.
- **Ein-Personen-Projekt** → strikte Automatisierung (CI, Paritätscheck), kleine PRs.

## 15. Nächster Schritt

Phasen 0–2 sind umgesetzt (Phase 2 auf Branch `phase-2-migration`). Nächster Schritt: Phase 3 Öffentliche Site (Parität) – Briefing für die Redaktion (3.3a) bleibt offen.

**Hinweise aus Phase 2:** Erstimport 257/257 Seiten, 382 Dateien, 17 News; Tabellen (Lexical-Tabellen) und Videos (Video-Baustein im Text) bleiben erhalten. 5 Seiten sind reine Formulare der Altsite (SurveyJS) und enthalten nur Titel/Lead – Formulare folgen separat. Übersetzungen als „veraltet“ markieren folgt mit dem Übersetzungsmodell in Phase 3. Wöchentlicher Abgleich über Payload-Jobs mit `LEGACY_DELTA_WEEKLY=true`.

**Hinweise aus Phase 0:** `/` leitet immer auf `/de` (keine Browsersprachen-Erkennung, wie Altsite). Hausschrift Frutiger Neue nicht eingebunden (Lizenz, 1.3a) → Arial/Helvetica. Payload-Migrationen werden ab Phase 1 nötig (bisher Schema-Push im Dev-Modus).
