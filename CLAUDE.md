# TeachingHub2

Neubau von https://teachinghub.unibe.ch (heute ZMS-CMS der UniBE) als eigene Web-Applikation.

## Stand
- Plan: `docs/umsetzungsplan.md` v1.0. Phase 0 (Setup) gemergt; **Phase 1 (Inhaltsmodell)** auf Branch `phase-1-inhaltsmodell`; nächste Phase: 2 Migration.
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
