# TeachingHub2

Prototyp-Neubau von [teachinghub.unibe.ch](https://teachinghub.unibe.ch) – **keine offizielle Seite der Universität Bern**.

- Planung: [docs/umsetzungsplan.md](docs/umsetzungsplan.md) · Entscheidungen: [docs/entscheidungen.md](docs/entscheidungen.md)
- Stack: Next.js 16 · Payload CMS 3 · PostgreSQL 17 (pgvector) · next-intl (DE/EN/FR)

## Lokal starten

Voraussetzung: nur **Docker Desktop**. Node.js wird auf dem Mac nicht benötigt.

```bash
cp .env.example .env          # einmalig; PAYLOAD_SECRET setzen (openssl rand -hex 32)
docker compose up             # App, Datenbank, Mailpit
```

| Dienst | Adresse |
|---|---|
| Website | http://localhost:3000 (→ `/de`, `/en`, `/fr`) |
| CMS (Payload Admin) | http://localhost:3000/admin – beim ersten Aufruf Admin-Konto anlegen |
| Mailpit (abgefangene Mails) | http://localhost:8025 |
| PostgreSQL | `localhost:5433`, Benutzer/Passwort `teachinghub` |

## Befehle (im Container)

```bash
docker compose exec app npm run lint
docker compose exec app npm run typecheck
docker compose exec app npm test                 # Unit- und Integrationstests
docker compose --profile e2e run --rm e2e        # Playwright + axe gegen die laufende App
docker compose exec app npm run seed             # Schlagwörter + Navigation einspielen (idempotent)
docker compose exec app npm run generate:types   # nach Änderungen an Collections
docker compose exec app npm run migrate:create -- <name>  # Migration für Produktion erzeugen
docker compose exec app npm run generate:importmap
docker build -t teachinghub2 .                   # Produktions-Image
```

Neue Pakete: `docker compose exec app npm install <paket>` – `package.json` und `package-lock.json` werden im Projektordner aktualisiert.

## Migration der Altsite (Phase 2)

```bash
docker compose exec app npm run legacy:crawl     # Altsite crawlen → data/legacy/ (nicht im Repo)
docker compose exec app npm run legacy:import    # Erstimport (überspringt bereits Importiertes)
docker compose exec app npm run legacy:delta     # Abgleich → Migrations-Inbox (LEGACY_NO_CRAWL=1: ohne neuen Crawl)
```

Im Admin unter **Migration Altsite → Migrations-Inbox**: Abgleich starten, Änderungen ansehen (Basis → neu, bei Konflikt zusätzlich die lokale Fassung) und **übernehmen · später · ignorieren**. Nichts wird automatisch überschrieben. `LEGACY_RECONVERT=1 npm run legacy:import` wandelt Importiertes nach Konverter-Verbesserungen neu um (lokal Geändertes bleibt).

> Bei knappem Docker-Speicher den Import ohne laufenden Dev-Server ausführen: `docker compose stop app` und `docker compose run --rm --no-deps app npm run legacy:import`.

## Struktur

```
src/app/(frontend)/[locale]/   Website (Sprachpräfix /de, /en, /fr)
src/app/(payload)/             Payload-Admin und API
src/collections/               CMS-Collections (Artikel, Methoden, Tools, Seiten, Kernthemen, Unterthemen, News, …)
src/access/roles.ts            Rollen Admin · Redaktion · Übersetzer:in
src/fields/, src/blocks/       Gemeinsame Felder, Abschnitte und Bausteine
src/migrations/                Datenbank-Migrationen
src/seed/                      Startdaten
src/migration/                 Crawler, Extraktion, Import, Delta-Abgleich
scripts/migration/             CLI für Crawl, Import, Delta
src/components/                Layout-Komponenten (Header, Navigation, Footer, Prototyp-Hinweis)
src/config/navigation.ts       Hauptnavigation (alte Pfade, Entscheidung 7.2)
src/design/tokens.css          UniBE-CD als Design-Tokens
src/i18n/                      Sprach-Routing (next-intl)
messages/                      UI-Texte DE/EN/FR
tests/unit|int|e2e/            Vitest (Unit/Integration), Playwright + axe
```
