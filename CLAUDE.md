# TeachingHub2

Neubau von https://teachinghub.unibe.ch (heute ZMS-CMS der UniBE) als eigene Web-Applikation.

## Stand
- Plan: `docs/umsetzungsplan.md` v1.0. Phasen 0–1 gemergt; **Phase 2 (Migration)** auf Branch `phase-2-migration`; nächste Phase: 3 Öffentliche Site.
- Jede Phase auf eigenem Branch, Abnahmekriterien aus Abschnitt 11 des Plans.

## Entwicklung
- **Kein Node.js auf dem Host.** Alle npm-Befehle im Container: `docker compose exec app npm …` (Stack mit `docker compose up -d`).
- Prüfen vor jedem Commit: `npm run lint`, `npm run typecheck`, `npm test` (im Container); E2E: `docker compose --profile e2e run --rm e2e`.
- Nach Änderungen an Collections: `npm run generate:types`, `npm run generate:importmap` und eine Migration `npm run migrate:create -- <name>` (lokal Schema-Push, Produktion Migrationen).
- Startdaten (Schlagwörter, Navigation): `npm run seed` (idempotent).
- Rollen/Rechte zentral in `src/access/roles.ts`; Übersetzer:innen nur EN/FR. Collection-Slugs in `src/lib/slugs.ts`.
- Feldname `status` vermeiden (kollidiert mit Payload-`_status`-Enum).
- Sprachen: DE/EN/FR über `src/i18n/routing.ts`; UI-Texte in `messages/*.json` (alle drei Dateien gleiche Schlüssel – Unit-Test prüft das).
- Design: nur Tokens aus `src/design/tokens.css` verwenden (UniBE-CD). Prototyp-Hinweis und `noindex` nie entfernen (Entscheidung 1.3a).
- URLs der Altsite-Pfade beibehalten (Entscheidung 7.2); Navigation in `src/config/navigation.ts`.

## Dokumente
- `docs/analyse-teachinghub-unibe.md` – Analyse der heutigen Site (Navigation, Seitentypen, Funktionen)
- `docs/seiteninventar.csv` – alle gecrawlten Seiten
- `docs/methodenkompass.csv` – Methodenkompass-Daten (Quelle: Altsite)
- `docs/umsetzungsplan.md` – Umsetzungsplan (versioniert)
- `docs/entscheidungen.md` – Entscheidungsprotokoll aus grill-me
- `docs/konzept-landingpages/` – Konzept der Landingpages „Themen der Lehre“ (Kopie aus dem Ordner „Teaching Hub“)

## Arbeitsweise
- Offene Fragen mit dem Skill `grill-me-teachinghub` klären: eine Frage pro Nachricht, immer mit Empfehlung, Antworten in `docs/entscheidungen.md` protokollieren.
- Sprache der Dokumente: Deutsch (Schweizer Schreibweise, kein ß).

## Migration
- Rohdaten der Altsite nur in `data/legacy/` (gitignored), nie committen. Tests nutzen künstliche Seiten in `tests/fixtures/legacy/`.
- Importer verantwortet nur die Felder in `src/migration/fields.ts` (`importedFields`); alles andere pflegt die Redaktion.
- Konverter muss dieselben Editor-Features nutzen wie die Website (`src/lib/editor.ts`), sonst gehen Tabellen verloren.
- Hashes immer über `hashValue` (normalisiert null/fehlend, IDs, Schlüsselreihenfolge).
