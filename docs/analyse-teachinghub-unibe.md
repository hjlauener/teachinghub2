# Analyse teachinghub.unibe.ch

**Stand:** 22.11.2026 · **Methode:** vollständiger Crawl aller internen Seiten (robots.txt beachtet, gedrosselt), Auswertung von HTML, Meta-Daten, Methodenkompass-CSV und Such-Facetten.  
**Anhänge:** [seiteninventar.csv](seiteninventar.csv) (257 Einträge) · [methodenkompass.csv](methodenkompass.csv) (67 Methoden)

---

## 1. Überblick

| Kennzahl | Wert |
|---|---|
| CMS | **ZMS** (Zope-basiert, UniBE-Portal-Theme 2022), Microsite unter `unibe/portal/microsites/micro_teachinghub` |
| Seiten (HTML, intern) | **257** (240 per Link erreichbar + 17 Methoden nur über die Methodenkompass-Tabelle) |
| Sprachen | **nur Deutsch** (`index_eng.html` leitet auf DE um, `index_fra.html` = 404) |
| Durchsuchbare Artikel (Suche) | **225** Treffer, verschlagwortet mit Rubrik + Thema |
| Methoden | **67** |
| Downloads (PDF/Office) | 65 verlinkte Dateien |
| Letzte Änderung (`DC.Date`) | Seiten von 05/2025 bis 17.11.2026 – Site wird aktiv gepflegt |
| Login | Heute nur für das Redaktions-Kontaktformular („Login erforderlich“); keine personalisierten Funktionen |

## 2. Navigation

### Hauptnavigation (Mega-Menü)
1. **Startseite**
2. **Journey der Lehre** – 8 Rubriken („Etappen“):
   1. Lehre konzipieren
   2. Lehre administrieren
   3. Lehre durchführen
   4. Prüfungen gestalten
   5. Lehre evaluieren
   6. Curriculum entwickeln
   7. Lehr|Impulse @ UniBE
   8. Tools
3. **Methodenkompass**
4. **Suche**
5. **Über uns**
6. Link „Portal UniBE“

### Weitere Navigationselemente
- **Breadcrumb** auf jeder Seite
- **Footer:** Portal Universität Bern, Sprachwahl (nur DE), Rechtliche Hinweise, Impressum, Logos (swissuniversities, Reakkreditierung 2028, Vision)
- **Kontaktbox** (schema.org Organization): Teaching Hub Redaktion | Vizerektorat Lehre, Hochschulstrasse 6, 3012 Bern, Lageplan (OpenStreetMap/Leaflet)
- **Teilen:** Facebook, LinkedIn, E-Mail (mailto) – auf jeder Seite
- **UniBE-weite Suche** (suche.unibe.ch) im Header, zusätzlich die eigene Facettensuche

## 3. Informationsarchitektur

```
/                                   Startseite
├─ journey_der_lehre/               Journey-Übersicht (nur Codeblock, Inhalt via Mega-Menü)
│  ├─ lehre_konzipieren/            Rubrik → Tabs je Thema → Artikel
│  │   Themen: Didaktische Grundlagen (4) · Lehr-/Lernszenarien (7) · Lehr- und Lernräume (2+2)
│  │           Lehrformate (8) · Unterrichtsformen (5+2)
│  ├─ lehre_administrieren/         Prüfungsadministration (4+1) · Veranstaltungsadministration (3+2)
│  ├─ lehre_durchfuehren/           Lehr- und Lernmaterialien (8+8 Videoformate) · Lehrmethoden (7)
│  ├─ pruefungen_gestalten/         Prüfungen entwickeln (6 + 19 Fragetypen + 2) · Prüfungen durchführen (1)
│  ├─ lehre_evaluieren/             Lehrbegleitendes Feedback (2) · Standardisierte Evaluationen (2)
│  ├─ curriculum_entwickeln/        3 Artikel (Studienprogramme neu konzipieren / weiterentwickeln / evaluieren)
│  ├─ lehrimpulse__unibe/           Beratung & Services (13) · Fachveranstaltungen (5 + 9 Tag der Lehre)
│  │                                Förderprogramme (5+1) · Kurse (6) · Praxisimpulse (1) · Preisgekrönte Lehre (3+4)
│  └─ tools/                        15 Tools (Camtasia, evaexam, ILIAS, iliasEXAM, iTools, KSL, Mentimeter,
│                                   MS Teams, Notenwizard, Opencast, PresenceAssist, SELEVOR, Tobira,
│                                   Turnitin, Zoom) + 14 Unterseiten (FAQ, Anträge, Anleitungen)
├─ methodenkompass/                 Filtertabelle + 67 Methodenseiten
├─ suche/                           Facettensuche
├─ ueber_uns/                       Kontakte der Fachstellen + Quellenverzeichnis
└─ ablage/news/                     News-Detailseiten (3)
```

Wichtig: Die **Themen-Ebene** (z. B. „Didaktische Grundlagen“) ist keine eigene Seite, sondern ein **Tab** auf der Rubrikseite. Die URL enthält sie trotzdem (`/lehre_konzipieren/didaktische_grundlagen/learning_outcomes/`).

### Seiten pro Bereich

| Bereich | Seiten |
|---|---|
| Methodenkompass | 68 |
| Lehr\|Impulse @ UniBE | 47 |
| Lehre konzipieren | 30 |
| Tools | 29 |
| Prüfungen gestalten | 28 |
| Lehre durchführen | 23 |
| Lehre administrieren | 10 |
| Rubrik-/Übersichtsseiten | 9 |
| Curriculum entwickeln | 3 |
| Lehre evaluieren | 4 |
| News, Suche, Über uns, Start | 6 |

## 4. Seitentypen

| Typ | Anzahl | Aufbau |
|---|---|---|
| **Startseite** | 1 | Intro „Ihr Hub für gute Lehre…“ mit CTAs *Journey starten* / *Inhalte suchen*; Teaser-Container „Aktuelles im Fokus“; „Kurse am VRL“ / „Fachveranstaltungen des VRL“; „Weitere News“ (≈ 13 Teaser, teils extern: uniAKTUELL, ILIAS-Blog); „Rahmenbedingungen“ (z. B. Leitlinien KI) |
| **Rubrikseite** | 8 | Intro-Text → Tabs „Etappen“ (ein Tab pro Thema) → je Tab: Themen-Beschreibung + gefilterte Artikelkarten (Titel, Lead, Tags Rubrik/Thema) |
| **Artikel** | ≈ 145 | Titel + Lead (Untertitel) → **Wegweiser** (Sprunglinks) → Tabs/Abschnitte: *Was steckt dahinter – und wofür ist es gut?* · *Einblicke* (Einblick 1, 2 = Praxisbeispiele) · *Stolperfrei durchstarten* · *Ressourcen* (Literatur, Anleitungen & Schulungsmaterial, Beratung & Service) · *Kontakt*; Bausteine: Infobox, Zweispalter, Video, Alertbox, Linkliste |
| **Methode** | 67 | Gleiches Schema wie Artikel; zusätzlich Kategorien (Zweck, Modalität, Sozialform, Aufwand) und *Alternative Methoden* |
| **Tool** | 15 (+14 Unterseiten) | Wie Artikel, mit Zugang/Login-Links (ILIAS, Turnitin, Zoom …), FAQ-Seiten, Antragsformulare |
| **Angebot** (Beratung, Kurs, Förderung, Veranstaltung) | ≈ 30 | Kürzer (1–2 k Zeichen): Beschreibung, Zielgruppe, Anmeldung, Kontakt |
| **Archiv-/Listenseite** | ≈ 15 | Tag der Lehre 2018–2026, Preisträger:innen, Auszeichnungen (lange Listen bis 60 k Zeichen) |
| **News** | 3 intern | Text + Bild; viele News verlinken extern |
| **Methodenkompass** | 1 | Sortier-/filterbare Tabelle (DataTables), Daten aus CSV |
| **Suche** | 1 | Facettensuche |
| **Über uns** | 1 | Kontaktkarten (LEAD, ILUB, VSL, Stab VRL, SAE, Redaktion) + Quellenverzeichnis (APA) |

## 5. Funktionen

### 5.1 Methodenkompass
- Datenquelle: `MethodenkompassV7_ger.csv` (Semikolon, mehrzeilige Mehrfachwerte)
- Spalten: **Methode, Link, Zweck, Modalität, Sozialform, Aufwand**
- Werte:
  - **Zweck** (Mehrfach): Einstieg · Vorwissen aktivieren · Verarbeiten · Formatives Prüfen · Summatives Prüfen · Zwischenfeedback · Begleiten
  - **Modalität** (Mehrfach): Schriftlich · Mündlich · Praktisch
  - **Sozialform** (Mehrfach): Einzeln · Partner · Gruppe · Plenum
  - **Aufwand** (Einfach, ordinal): Niedrig · Niedrig bis mittel · Mittel · Mittel bis hoch · Hoch
- Funktionen: Filter je Spalte, Volltextsuche, Sortierung, Alphabet-Suche, Klick → Detailseite
- 17 Methoden sind nur über die Tabelle erreichbar (nicht im Menü verlinkt)

### 5.2 Facettensuche (`/suche/`)
- Volltextfeld + zwei Mehrfach-Facetten:
  - **Rubrik (8):** Curriculum entwickeln · Lehre administrieren · Lehre durchführen · Lehre evaluieren · Lehre konzipieren · Lehrimpulse · Prüfungen gestalten · Tools
  - **Thema (25):** Admintools · Anlaufstellen · Beratung & Services · Didaktische Grundlagen · Fachveranstaltungen · Förderprogramme · Kurse · Lehr- und Lernmaterialien · Lehr- und Lernräume · Lehr- und Lernszenarien · Lehrbegleitendes Feedback · Lehrformate · Lehrmethoden · Lehrtools · Praxisimpulse · Preisgekrönte Lehre · Prüfungen durchführen · Prüfungen entwickeln · Prüfungsadministration · Prüfungstools · Qualitätssicherungstools · Standardisierte Evaluationen · Studienprogramme · Unterrichtsformen · Veranstaltungsadministration
- Ergebnis: Karten mit Titel, Lead, Rubrik-/Thema-Tags, Trefferzahl (225 ohne Filter); enthält auch die Methoden (Thema „Lehrmethoden“) – Korrektur 23.11.2026
- Alle 225 Einträge mit Schlagwörtern in einer Abfrage: `/e1701260/e1758441/collection_view?lang=ger&id=e1758441&q=&offset=0&size=500`
- Gleiche Komponente („ontology collection“) wird auf den Rubrikseiten je Tab vorgefiltert eingesetzt
- Ein Artikel kann **mehreren Rubriken und Themen** zugeordnet sein (z. B. ILIAS: 4 Rubriken, 3 Themen)

### 5.3 Weitere Funktionen
- Teilen (Facebook, LinkedIn, E-Mail)
- Formulare: Kontaktformular Redaktion (Login), Bestellformulare (Podcast/Livestream, Tobira-Organisationsseite), Anträge (VHO-Account, iTools Portal Point) – teils extern/SurveyJS
- Eingebettete Videos, Karte (Leaflet)
- Meta-Daten pro Seite: `DC.Date` (letzte Änderung), `description` (= Lead), `attr_dc_subject` (Schlagwort, z. B. „Künstliche Intelligenz“), Open-Graph-Tags

### 5.4 Externe Abhängigkeiten
Häufigste externe Ziele: unibe.ch (Portal, Reglemente), ILIAS, exam.unibe.ch, gutelehre.unibe.ch, uniAKTUELL, myvrl.me (Kursprogramm), ub.unibe.ch, Zoom, Turnitin, Mentimeter, doi.org (Literatur).

## 6. Befunde für den Neubau

1. **Stark strukturierte Inhalte.** Artikel und Methoden folgen einem festen Schema (Was steckt dahinter / Einblicke / Stolperfrei durchstarten / Ressourcen / Kontakt). → Eigene Inhaltstypen mit festen Abschnitten statt freier Seiten; erleichtert Übersetzung, KI-Index und einheitliche Darstellung.
2. **Taxonomie ist das Rückgrat.** Rubrik × Thema steuert Menü, Rubrik-Tabs und Suche. → Taxonomie als eigene, übersetzbare Collection; Artikel n:m zugeordnet.
3. **Methodenkompass liegt als CSV vor.** → Direkt importierbar; Kategorien als Felder statt Freitext.
4. **Delta-Abgleich ist machbar.** Jede Seite hat `DC.Date` und eine stabile URL → Änderungserkennung über Datum **und** Inhalts-Hash.
5. **Mehrsprachigkeit fehlt heute ganz.** → Neubau startet mit DE-Inhalten, EN/FR werden durch Übersetzer:innen ergänzt.
6. **Login existiert schon punktuell** (Redaktions-Kontaktformular). → Accounts im Neubau haben sofort einen Nutzen (Feedback/Kontakt ohne Formularumweg).
7. **Inline-CSS-Codeblöcke** (Journey-Übersicht blendet per CSS Elemente aus) → Journey-Übersicht im Neubau als echte Seite gestalten.
8. **Lange Archivseiten** (Auszeichnungen: 60 k Zeichen) → als strukturierte Listen (Jahr, Person, Fakultät) modellieren ⚠︎.
9. **Personalisierte Funktionen fehlen vollständig** (Like, Bookmark, Feedback, Sammlungen, KI-Fragen) – das ist der Mehrwert von TeachingHub2.

## 7. Nicht erfasst / offen

- Inhalte hinter Login (Redaktions-Kontaktformular) und interne SurveyJS-Formulare
- Bilder/Medien wurden nicht heruntergeladen (nur gezählt)
- Ob die Altsite ein Redaktionsteam mit Freigabeprozess hat → grill-me
- Herkunft/Rechte von Bildern und Videos → grill-me
