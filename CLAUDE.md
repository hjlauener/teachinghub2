# TeachingHub2

Neubau von https://teachinghub.unibe.ch (heute ZMS-CMS der UniBE) als eigene Web-Applikation.

## Stand
- Plan: `docs/umsetzungsplan.md` v1.1. Phasen 0–7 gemergt; Online-Demo (Phase 8) zurückgestellt – vorerst lokaler Betrieb mit `./scripts/start-local.sh` (Entscheidung 1.2b).
- Jede Phase auf eigenem Branch, Abnahmekriterien aus Abschnitt 11 des Plans.

## Entwicklung
- **Kein Node.js auf dem Host.** Alle npm-Befehle im Container: `docker compose exec app npm …` (Stack mit `docker compose up -d`). Erststart/Aktualisierung: `./scripts/start-local.sh` (macOS-Bash 3.2-kompatibel halten, wiederholbar).
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
- `docs/befehle.md` – Spickzettel aller Befehle (bei neuen npm-Skripten nachführen)
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
- Entwürfe aller 14 Kernthemen in `docs/konzept-landingpages/Landingpages/<A|B|C …>/*.html` (Zuordnung über den Titel `h1#c1`); Unit-Test prüft die Kapitelregeln. Live = Entwurf + ≥ 5 Journey-Seiten (Matrix + „Entlang der Journey“). Kein „Siehe auch“ auf Kernthemen; „Hinweise anderer Hochschulen“ zeigt pro Aufruf 4 zufällige (`src/components/topics/pick.ts`, Entscheidung 7.8).

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
- Review Phase 4/5: Mitgliedersuche findet E-Mails nur ab Adressanfang (nie über die Domain) und ist pro Mitglied begrenzt (`hitRateLimit`, Tabelle `hub.rate_events`); Namen über `normalizeName` (einzeilig, ≤ 100) in Better-Auth-Hooks; Sprache der Anmeldemail über `localeFromMagicLink`.
- Mails in Payload-Hooks immer in try/catch (Mailfehler dürfen Speichern nicht verhindern); Felder `memberEmail/memberName/memberId/mailLocale` sind nach dem Anlegen nicht änderbar.
- Feedback-Upload verlangt Content-Length (411 ohne, 413 zu gross).

## Ask-a-question (Phase 6)
- Code in `src/ai/`: Regeln rein in `rules.ts`/`sections.ts`/`select.ts` (getestet), Verschlüsselung `crypto.ts`, Embeddings `embed.ts`, Index `index-repo.ts` + `indexer.ts`, Anbieter `providers.ts`, Ablauf `ask.ts`, Mitgliederdaten `repo.ts`.
- Index im Schema `ai` (pgvector); Aufbau/Abgleich `npm run ai:reindex` (nach Importen). CMS-Änderungen reihen per Hook einen Payload-Job `aiIndex` ein (Warteschlange `ai`, Runner jede Minute; `AI_INDEX_ON_SAVE=off` schaltet ab, in Vitest läuft kein Runner).
- Embeddings lokal über Ollama (`bge-m3`, Dienst `ollama`); Tests/CI mit `AI_EMBEDDER=fake`. Antworten nur mit eigenem Schlüssel (AES-GCM, `AI_KEY_SECRET` nie ändern); `AI_TEST_PROVIDER=1` aktiviert den Testanbieter (nur CI/lokal).
- Ohne passende Quelle wird der Anbieter nicht angefragt. Basis-URL „OpenAI-kompatibel“ nur öffentlich (https, keine IP/localhost, DNS-Prüfung gegen private Netze).
- Anthropic-Adapter über `@anthropic-ai/sdk` (Streaming, `effort: medium`, Refusal-Fallback `fallbacks: 'default'` für Modelle der 5er-Generation); Modellliste im Global `ai-settings` (Admin).
- Antworten von fetch immer vollständig lesen (`r.json()`), sonst bleibt die Anfrage offen und `networkidle` in E2E hängt.

## Sicherheit und Architektur (Review nach Phase 6)
- Schemas `hub` und `ai` nur über versionierte Migrationen in `src/db/sql-migrations.ts` ändern (neue Einträge anhängen, bestehende nie ändern; läuft mit `npm run auth:migrate`, Tabelle `app.sql_migrations`).
- Mehrstufige Schreibvorgänge in `inTransaction` (`src/hub/database.ts`); Limits in der DB (`hitRateLimit`), kein Zustand nur im Speicher.
- Content-Security-Policy mit Nonce pro Anfrage in `src/proxy.ts` (`src/lib/csp.ts`); Frontend-Seiten rendern deshalb immer dynamisch (Layout liest `headers()`). Keine Inline-Skripte ohne Nonce.
- Mediathek ohne SVG; ältere SVGs werden mit Sandbox-CSP ausgeliefert (`next.config.ts`). Videos nur von freigegebenen Plattformen (`src/lib/video.ts`, gleiche Liste in `frame-src`).
- Geheimnisse werden beim Start geprüft (`src/instrumentation.ts`, `src/lib/secrets.ts`): im Produktionsbetrieb Abbruch bei Platzhaltern oder < 32 Zeichen. KI-Schlüssel im Format `v2:<schlüssel-id>:…`; Rotation mit `AI_KEY_SECRET_PREVIOUS` + `npm run ai:rotate-keys`.
- Anmeldelinks: höchstens 5 pro Adresse in 15 Minuten (unabhängig von der IP); IP-Header für Better Auth über `AUTH_IP_HEADERS` (vom Proxy des Hosters gesetzt).
- „OpenAI-kompatible“ Anbieter nur über `providerFetch` (undici-Agent mit Namensauflösung, die interne Adressen sperrt).
- Uploads über `UPLOADS_DIR` (Docker: Volume `/app/uploads`); Mail-Sprache wird bei der Registrierung gesetzt, nicht beim Seitenaufruf.

## edu-ID (Phase 7)
- OIDC über Better Auths `genericOAuth` (Anbieter-ID `eduid`), Anmeldung mit `authClient.signIn.social({ provider: 'eduid' })`, Verknüpfung mit `authClient.linkSocial` (`src/auth/client.ts`); Rückkehr unter `/api/auth/callback/eduid`.
- Zulassung wie beim Anmeldelink (Entscheidung 6.3): nur Adressen der zugelassenen Domain (@unibe.ch, keine @students.unibe.ch), geprüft im `databaseHooks.user.create.before` für alle Anmeldewege; Affiliation wird nicht ausgewertet.
- Gleiche E-Mail → automatische Verknüpfung (`trustedProviders: ['eduid']`); bewusste Verknüpfung im Konto darf eine andere Adresse haben (`allowDifferentEmails`).
- Test-Anmeldedienst Keycloak: Realm `docker/keycloak/eduid-test-realm.json` (Testpersonen dozentin, privat, studentin, bestehend; Passwort „test“); lokal `docker compose --profile eduid up -d`, CI startet ihn per `docker run`; E2E nur mit `E2E_EDUID=1`.
