#!/usr/bin/env bash
# Teaching Hub 2 lokal starten (Mac, nur Docker Desktop nötig): ./scripts/start-local.sh
#
#   ./scripts/start-local.sh            Stack starten, Startdaten, Themen, Altsite (falls gecrawlt), KI-Index
#   ./scripts/start-local.sh --altsite  zusätzlich die Altsite neu crawlen und importieren (dauert ca. 15–30 Min.)
#   ./scripts/start-local.sh --eduid    zusätzlich den Test-Anmeldedienst für edu-ID (Keycloak) starten
#
# Das Skript ist wiederholbar: Es legt nur fehlende Einstellungen an und überspringt bereits Importiertes.
set -euo pipefail
cd "$(dirname "$0")/.."

ALTSITE=0
EDUID=0
for arg in "$@"; do
  case "$arg" in
    --altsite) ALTSITE=1 ;;
    --eduid) EDUID=1 ;;
    -h | --help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "Unbekannte Option: $arg (siehe --help)"; exit 1 ;;
  esac
done

step() { printf '\n\033[1m▶ %s\033[0m\n' "$1"; }

step "Docker prüfen"
if ! docker info >/dev/null 2>&1; then
  echo "Docker läuft nicht. Bitte Docker Desktop starten und das Skript erneut ausführen."
  exit 1
fi

step "Einstellungen (.env)"
[ -f .env ] || { cp .env.example .env; echo "Neue .env aus .env.example angelegt."; }
# Fehlende Einträge aus .env.example ergänzen; Geheimnisse (Platzhalter „bitte-ersetzen“) zufällig erzeugen
added=0
while IFS= read -r line; do
  case "$line" in '' | '#'*) continue ;; esac
  key="${line%%=*}"
  value="${line#*=}"
  if ! grep -q "^${key}=" .env; then
    printf '%s=%s\n' "$key" "$value" >> .env
    added=$((added + 1))
  fi
done < .env.example
# Platzhalter durch zufällige Werte ersetzen (portabel, ohne sed -i)
tmp="$(mktemp)"
while IFS= read -r line; do
  case "$line" in
    '#'*) printf '%s\n' "$line" ;;
    *=bitte-ersetzen*) printf '%s=%s\n' "${line%%=*}" "$(openssl rand -hex 32)" ;;
    *) printf '%s\n' "$line" ;;
  esac
done < .env > "$tmp"
mv "$tmp" .env
[ "$added" -gt 0 ] && echo "$added fehlende Einträge ergänzt."
if [ "$EDUID" = 1 ]; then
  # Test-Anmeldedienst nur eintragen, wenn noch keine edu-ID konfiguriert ist
  if grep -q '^EDUID_DISCOVERY_URL=$' .env; then
    tmp="$(mktemp)"
    while IFS= read -r line; do
      case "$line" in
        EDUID_DISCOVERY_URL=) echo 'EDUID_DISCOVERY_URL=http://keycloak:8080/realms/eduid-test/.well-known/openid-configuration' ;;
        EDUID_CLIENT_ID=) echo 'EDUID_CLIENT_ID=teachinghub2' ;;
        EDUID_CLIENT_SECRET=) echo 'EDUID_CLIENT_SECRET=teachinghub2-test-secret' ;;
        *) printf '%s\n' "$line" ;;
      esac
    done < .env > "$tmp"
    mv "$tmp" .env
    echo "edu-ID-Test eingetragen (Keycloak)."
  fi
fi
echo "Einstellungen bereit."

step "Container starten (beim ersten Mal einige Minuten)"
profiles=()
[ "$EDUID" = 1 ] && profiles=(--profile eduid)
# ${arr[@]+…}: leere Liste auch mit der alten Bash 3.2 von macOS und set -u
docker compose ${profiles[@]+"${profiles[@]}"} up -d

step "Auf die Website warten"
for i in $(seq 1 120); do
  if curl -sf -o /dev/null http://localhost:3000/de; then echo "Website erreichbar."; break; fi
  [ "$i" = 120 ] && { echo "Die Website antwortet nicht. Protokoll: docker compose logs app"; exit 1; }
  sleep 5
done

run() { docker compose exec -T app npm run "$@"; }

step "Startdaten (Schlagwörter, Navigation)"
run seed

step "Themen der Lehre (Landingpages)"
run topics:import

if [ "$ALTSITE" = 1 ]; then
  step "Altsite crawlen (höflich, mit Pausen – das dauert)"
  run legacy:crawl
fi
if [ -f data/legacy/manifest.json ]; then
  step "Inhalte der Altsite importieren (bereits Importiertes wird übersprungen)"
  run legacy:import
else
  echo
  echo "Hinweis: Noch keine Altsite-Daten in data/legacy/. Für echte Inhalte: ./scripts/start-local.sh --altsite"
fi

step "KI-Index für „Fragen“ aufbauen (lädt beim ersten Mal das Modell bge-m3, ca. 1,2 GB)"
run ai:reindex

cat <<'EOF'

✔ Fertig. Teaching Hub 2 läuft lokal:

  Website ........ http://localhost:3000
  CMS (Admin) .... http://localhost:3000/admin   (beim ersten Aufruf Admin-Konto anlegen)
  Mails .......... http://localhost:8025         (Anmeldelinks landen hier)
EOF
[ "$EDUID" = 1 ] && echo "  edu-ID-Test .... http://localhost:8080         (Testpersonen z. B. „dozentin“, Passwort „test“)"
cat <<'EOF'

Anmelden: http://localhost:3000/de/anmelden mit einer @unibe.ch-Adresse, dann den Link in Mailpit öffnen.
Stoppen: docker compose stop   ·   Neu starten: dieses Skript erneut ausführen.
EOF
