# Befehle – Spickzettel

Alle Befehle im Terminal im Ordner **TeachingHub2** ausführen (`cd ~/…/TeachingHub2`).
Node.js läuft nur im Container: npm-Befehle deshalb immer mit `docker compose exec app npm run …`.

## Adressen (wenn alles läuft)

| Was | Adresse |
|---|---|
| Website | http://localhost:3000/de |
| Admin (CMS) | http://localhost:3000/admin |
| Mailpit (Anmeldelinks, Mails) | http://localhost:8025 |
| Test-edu-ID (Keycloak, nur mit `--eduid`) | http://localhost:8080 |
| Datenbank (z. B. für psql) | localhost:5433, Benutzer/DB `teachinghub` / `teachinghub2` |

## Alltag

| Befehl | Wozu |
|---|---|
| `./scripts/start-local.sh` | Alles starten bzw. aktualisieren (wiederholbar; erkennt neue Pakete) |
| `./scripts/start-local.sh --eduid` | Zusätzlich Test-Anmeldung mit edu-ID (Keycloak) |
| `./scripts/start-local.sh --altsite` | Zusätzlich die Altsite crawlen und importieren (einmalig, dauert) |
| `git pull` | Neuesten Stand holen – danach `./scripts/start-local.sh` |
| `git branch --show-current` | Zeigt den Zweig (sollte `main` sein) |
| `git switch main` | Auf den Hauptzweig wechseln |
| `docker compose stop` | Alles anhalten (Daten bleiben erhalten) |
| `docker compose up -d` | Wieder starten (ohne Startdaten/Index) |
| `docker compose restart app` | Nur die App neu starten (installiert dabei Pakete) |
| `docker compose ps` | Welche Container laufen? |
| `docker compose logs -f app` | Protokoll der App mitlesen (Ende mit `Ctrl+C`) |

## Inhalte und Daten

| Befehl | Wozu |
|---|---|
| `docker compose exec app npm run seed` | Startdaten (Schlagwörter, Navigation) einspielen (wiederholbar) |
| `docker compose exec app npm run topics:import` | Themen der Lehre aus `docs/konzept-landingpages/` importieren |
| `docker compose exec app npm run search:reindex` | Suchtext aller Inhalte neu aufbauen |
| `docker compose exec app npm run ai:reindex` | KI-Index für „Fragen“ aufbauen/abgleichen (nach Importen) |

## Altsite (teachinghub.unibe.ch)

| Befehl | Wozu |
|---|---|
| `docker compose exec app npm run legacy:crawl` | Altsite herunterladen nach `data/legacy/` |
| `docker compose exec app npm run legacy:import` | Gecrawlte Seiten ins CMS importieren |
| `docker compose exec app npm run legacy:delta` | Altsite erneut abgleichen → Änderungen in die Migrations-Inbox |
| `docker compose exec app npm run legacy:changes` | Offene Änderungen auflisten (auch als Datei in `data/legacy/`) |
| `docker compose exec app npm run legacy:parity` | Prüfen: hat jede alte Seite ein Gegenstück und eine Umleitung? |
| `docker compose exec app npm run legacy:rehash` | Feld-Hashes neu berechnen (nur nach Code-Änderungen am Hashing) |

Änderungen übernehmen: Admin → Migration Altsite → Migrations-Inbox → „Übernehmen“.

## Konten und Sicherheit

| Befehl | Wozu |
|---|---|
| `docker compose exec app npm run auth:migrate` | Tabellen für Konten, Hub und KI anlegen/aktualisieren (läuft beim Start automatisch) |
| `docker compose exec app npm run ai:rotate-keys` | KI-Schlüssel nach Wechsel von `AI_KEY_SECRET` neu verschlüsseln (Ablauf siehe Skript) |

## Entwicklung und Prüfen

| Befehl | Wozu |
|---|---|
| `docker compose exec app npm run lint` | Code-Stil prüfen |
| `docker compose exec app npm run typecheck` | Typen prüfen |
| `docker compose exec app npm test` | Unit- und Integrationstests |
| `docker compose --profile e2e run --rm e2e` | Browser-Tests (End-to-End) |
| `docker compose exec app npm run generate:types` | Typen nach Änderungen an Collections erzeugen |
| `docker compose exec app npm run generate:importmap` | Import-Map des Admins erzeugen |
| `docker compose exec app npm run migrate:create -- <name>` | Datenbank-Migration für Payload anlegen |
| `docker compose exec app npm run migrate` | Payload-Migrationen ausführen (Produktion) |
| `docker compose exec app npm install <paket>` | Neues Paket hinzufügen |

## Wenn etwas klemmt

| Problem | Lösung |
|---|---|
| „Module not found“ nach `git pull` | `./scripts/start-local.sh` oder `docker compose restart app` |
| Website antwortet nicht | `docker compose logs app` ansehen; ggf. `docker compose restart app` |
| `no configuration file provided` | Nicht im Ordner TeachingHub2 – zuerst `cd` dorthin |
| `git pull` meldet „divergent branches“ | Nicht auf `main`: `git switch main`, dann `git pull --ff-only` |
| Ganz von vorne (löscht alle lokalen Daten!) | `docker compose down -v`, danach `./scripts/start-local.sh` |
