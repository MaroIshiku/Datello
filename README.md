# Meiku - Profile Share

Self-hosted Profil- und Kontaktkarten-App fuer private und geschaeftliche QR-Karten.

## Kurzbeschreibung

Meiku ist eine mobile-first PWA fuer verschluesselte private und geschaeftliche Profilkarten mit lokalen Kontakt-, PayPal- und SEPA/EPC-QR-Codes. Der Python-Server liefert die App aus und speichert nur einen verschluesselten Token; Klartextdaten bleiben im Browser.

## Teil der ishiku-Familie

Meiku folgt dem gemeinsamen Pixel Soft Utility Designsystem fuer ruhige, abgerundete und self-hosted Utility-Oberflaechen. Die App nutzt dieselben sechs Themes wie die anderen ishiku Apps: Lavender, Mint, Sky, Amber, Rose und Graphite. System-, Hell- und Dunkelmodus werden ueber gemeinsame Theme-Tokens umgesetzt.

Die Oberflaeche verwendet den gemeinsamen AppHeader, lokale Logo-Assets, shared Design Tokens und technische Informationen nur im Settings-/Debug-Bereich. Meiku ist kein Server-Admin-System mit Benutzer-Datenbank; die Ersteinrichtung erstellt stattdessen einen clientseitig verschluesselten Profil-Tresor.

## Funktionen

- Setup, Login und Bearbeitung direkt in der PWA
- Web Crypto API: AES-GCM-256 plus PBKDF2-SHA-256
- PIN-Schnelllogin mit lokal verschluesseltem Master-Passwort
- optionaler Passkey-/Biometrie-Schnelllogin via WebAuthn-PRF
- Reiter: Privat, Firma, PayPal, Bank
- gefuehrter Profil-Fortschritt fuer Privat, Geschaeftlich, PayPal und Bank
- getrennte private und geschaeftliche Adresse
- lokale QR-Erzeugung ohne Drittanbieter-API
- getrennte vCard-QRs fuer Privat und Firma
- PayPal-QR und GiroCode/EPC-QR mit synchronisiertem Betrag
- Export/Import des verschluesselten Tokens
- PWA-Manifest, Service Worker und Meiku-PWA-Icons
- Python-API fuer Token-I/O mit `X-Auth-Token`

## Tech Stack

- Vanilla HTML, CSS und JavaScript als PWA
- Web Crypto API fuer clientseitige Verschluesselung
- eigener lokaler QR-Renderer ohne externe QR-API
- Python `http.server`-basierter Runtime-Server
- Docker/Compose fuer ZimaOS, CasaOS und andere self-hosted Setups
- Pixel Soft Utility Codex Pack v4 fuer Design Tokens, Contracts und Checklisten

## Installation

### Docker Compose

```bash
git clone git@github.com:MaroIshiku/meiku.git
cd meiku
cp .env.example .env
```

In `.env` mindestens ein langes Secret setzen:

```env
WEBUI_PORT=8080
TZ=Europe/Berlin
ISHIKU_SETUP_SECRET=ein-langes-zufaelliges-secret
MEIKU_DATA_PATH=/DATA/AppData/meiku/data
```

Datenordner auf dem Host vorbereiten:

```bash
mkdir -p /DATA/AppData/meiku/data
```

Beim Containerstart setzt der Meiku-Entrypoint den Besitzer des Datenordners auf `10001:10001`, sofern Docker `CHOWN` fuer den Bind-Mount erlaubt. Falls dein Host das nicht erlaubt, fuehre einmalig aus:

```bash
chown -R 10001:10001 /DATA/AppData/meiku/data
```

Container starten:

```bash
docker compose pull
docker compose up -d
```

### Erstes Starten

Beim ersten Start zeigt Meiku die Tresor-Ersteinrichtung. Gib den Profilnamen, ein Master-Passwort und dasselbe Secret ein, das serverseitig als `ISHIKU_SETUP_SECRET`, `ISHIKU_SETUP_SECRET_FILE` oder Legacy-Variable `DV2_SHARED_SECRET` konfiguriert ist.

### Adminaccount erstellen

Meiku erstellt keinen Server-Adminaccount und speichert keine Benutzerpasswort-Hashes, weil die App ein clientseitig verschluesselter Profil-Tresor ist. Der Setup-Secret-Mechanismus schuetzt Schreibzugriffe auf den verschluesselten Token. Das Master-Passwort wird nicht an den Server gesendet.

## Konfiguration

### Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `WEBUI_PORT` | Host-Port fuer die Weboberflaeche, Standard `8080`. |
| `TZ` | Zeitzone, Standard `Europe/Berlin`. |
| `ISHIKU_DATA_DIR` | Persistenter Datenordner im Container, Standard `/data`. |
| `ISHIKU_LOG_LEVEL` | Gemeinsamer Runtime-Loglevel, Standard `info`. |
| `ISHIKU_SETUP_SECRET` | Bevorzugtes Secret fuer Setup und Token-Schreibzugriffe. |
| `ISHIKU_SETUP_SECRET_FILE` | Optionaler Pfad zu einer Secret-Datei, bevorzugt vor Env-Secrets. |
| `DV2_SHARED_SECRET` | Legacy-Alias fuer bestehende Installationen. |
| `DV2_ACCESS_LOG` | Aktiviert einfache Access Logs mit `true`, `1` oder `yes`. |
| `MEIKU_DATA_PATH` | Host-Bind-Mount fuer persistente Daten. |

### Docker Secrets

Wenn eine Secret-Datei genutzt wird, liest der Server zuerst `ISHIKU_SETUP_SECRET_FILE`. Ohne explizite Variable prueft er `/run/secrets/ishiku_setup_secret`. Wenn keine Datei vorhanden ist, faellt er auf `ISHIKU_SETUP_SECRET` und danach auf `DV2_SHARED_SECRET` zurueck.

Secret-Werte werden nicht geloggt und nicht an Client-JavaScript ausgeliefert.

### Persistente Daten

Im Container liegt der verschluesselte Token standardmaessig unter `/data/data.json`. Auf ZimaOS empfiehlt sich:

```text
/DATA/AppData/meiku/data
```

## Sicherheit

- Klartextdaten verlassen den Browser nicht.
- Das Master-Passwort wird nicht an den Server gesendet.
- Der Server speichert nur den AES-GCM-Token.
- Setup-/Shared Secret ist nur fuer Schreibzugriffe auf den verschluesselten Token gedacht.
- Meiku speichert keine Plaintext-Passwoerter und keine reversibel verschluesselten Server-Passwoerter.
- Eine oeffentliche Server-Registrierung existiert nicht.
- `data.json`, `/api/data`, `/api/token` und `save.php` werden vom Service Worker nicht gecacht.
- Der Container startet kurz mit Root-Rechten, korrigiert bei Bedarf den `/data`-Bind-Mount und laeuft danach als UID/GID `10001:10001`, read-only, mit `/data`-Bind-Mount und `/tmp`-Tmpfs.

## Updates und Backup

Updates:

```bash
docker compose pull
docker compose up -d
```

Backup:

- Host-Ordner `MEIKU_DATA_PATH` sichern.
- Optional in der App den verschluesselten Token exportieren.
- Master-Passwort und serverseitiges Secret getrennt und sicher aufbewahren.

## Entwicklung

Lokaler Start:

```bash
ISHIKU_SETUP_SECRET=dev-secret DV2_DATA_FILE=./data/data.json python server.py --host 127.0.0.1 --port 8080
```

Healthchecks:

```text
GET /healthz
GET /readyz
```

Token-Endpunkte:

```text
GET /api/data
POST /api/token
```

Legacy-Endpunkte bleiben kompatibel:

```text
GET /data.json
POST /save.php
```

## Erstellt mit ChatGPT Codex

Dieses Projekt wurde mit Unterstuetzung von ChatGPT Codex umgesetzt und ueberarbeitet. Codex ist ein Entwicklungswerkzeug; Wartung, Betrieb und Verantwortung liegen beim Repository-Eigentuemer.

## Status und Lizenz

Status: aktiv in Entwicklung.

Lizenz: noch nicht angegeben.
