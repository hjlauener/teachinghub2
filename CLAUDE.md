# TeachingHub2

Neubau von https://teachinghub.unibe.ch (heute ZMS-CMS der UniBE) als eigene Web-Applikation.

## Stand
- Plan: `docs/umsetzungsplan.md` v1.0. Phasen 0–4 und Phase 5 Teil 1 gemergt; **Phase 5 Teil 2** (Feedback-Dialog, Sammlungen, Vorschläge, Teilen) auf `phase-5-teil-2`. Nächste Phase: 6 (Ask-a-question).
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

## Website (Phase 3)
- Inhalte per Pfad über `src/lib/content.ts` (`findByPath`, nur Publiziertes, DE-Fallback). Vorlagen in `src/components/content/views/`.
- Rich Text immer über `src/components/content/RichText.tsx` (Tabellen, Bilder, Video-Blöcke, interne Links mit Sprachpräfix).
- Keine Block-Elemente (`figure`, `div`) innerhalb von Absätzen rendern – Altsite-Bilder stehen oft in `<p>` (Hydration-Fehler).
- Links auf grauen Flächen in `--color-blue-dark` (UniBE-Blau erreicht dort nur 4,48:1).
- Clientseitige Filter: E2E muss auf `networkidle` warten; Dev-Server erlaubt den E2E-Host `app` (`allowedDevOrigins`).

## Themen der Lehre (Phase 3b)
- Quelle: `docs/konzept-landingpages/` (Eigentum des Users, im Repo); Import `npm run topics:import`, Parser in `src/topics/parse.ts`.
- Status `pageStatus` (folgt/live): Pflichtangaben nur für live (`validateRequiredWhenLive`, `validateCountWhenLive`); Feldname nie `status`.
- Matrix aus `journeyPages` über `src/topics/matrix.ts` (rein, testbar) – Phase aus dem Pfad.

## Mitgliederkonten (Phase 4)
- Better Auth: Konfiguration `src/auth/options.ts` (ohne `server-only`, auch für CLI), Instanz `src/auth/server.ts`, Client `src/auth/client.ts`.
- Tabellen nur im Schema `auth` (nie `public`, sonst Konflikt mit Payloads Schema-Push); nach Änderungen `npm run auth:migrate`.
- Zulassung in `src/auth/rules.ts` (rein, getestet); Einstellungen im Payload-Global `member-settings`, Einladungen `member-invites`.
- E2E-Container teilt das Netzwerk mit der App (`network_mode: service:app`), weil die Anmeldung auf BETTER_AUTH_URL (localhost) zurückleitet. Mailpit-API für Anmeldelinks.
- Produktions-DB darf nie per Dev-Push verändert werden (sonst hängt der Start an einer Rückfrage) – Integrationstests in der CI auf eigener DB.

## Persönliche Funktionen (Phase 5)
- Daten der Mitglieder im Schema `hub` (`src/hub/database.ts`, DDL läuft mit `npm run auth:migrate`), Fremdschlüssel auf `auth.member` mit `on delete cascade` – Konto löschen löscht alles.
- Regeln rein in `src/hub/rules.ts` (getestet), SQL in `src/hub/repo.ts`, serverseitige Helfer in `src/hub/server.ts`; API unter `/api/hub/*` (schreibend nur same-origin + Session).
- Like-Zähler erst ab 3 öffentlich; Rohzahlen unter 3 nie an den Browser geben (Kompass bekommt nur einen Rang). Wer geliked hat, zeigt keine Ansicht, auch nicht die Redaktion (`/admin/like-statistik` zeigt nur Zähler).
- Persönlicher Zustand wird clientseitig geladen (`/api/hub/state`), Seiten bleiben für alle gleich gerendert.
- Teil 2: Sammlungen/Teilen/Inbox/Einstellungen in `hub.collections`, `collection_items`, `collection_shares`, `inbox`, `preferences` (SQL in `src/hub/repo-collections.ts`, Rechte über `collectionAccess` + `src/hub/collection-access.ts`, ohne Lesezugriff 404 statt 403).
- Feedback und Vorschläge sind Payload-Collections (`feedback`, `feedback-images`, `suggestions`, Admin-Gruppe „Rückmeldungen“), nur Redaktion lesbar; Mitglieder nur über `src/hub/payload-data.ts` (immer nach `memberId` gefiltert). Feldnamen `feedbackStatus`/`suggestionStatus` (nie `status`).
- Feedback-Bilder nur PNG/JPEG/WebP ≤ 5 MB, Typ per `detectImageType` (Bytes), Ordner `feedback-images/` ist gitignored. Konto löschen → `deleteMemberData` (Better Auth `afterDelete`).
- Mails an Mitglieder nur über `src/hub/mail.ts` (maskiert); Teilen-Mail nur bei `notify_shares`, Sprache aus `hub.preferences.locale` (wird beim Besuch von „Mein Hub“ gesetzt).
- Feedback-Dialog: `src/components/hub/FeedbackDialog.tsx`, im Layout eingebunden; Elemente mit `data-feedback-ignore` erscheinen nicht im Screenshot.
