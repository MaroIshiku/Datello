# Abnahme-Check

Stand: 2026-06-20

## Architektur

- Python-Server liefert die PWA und speichert nur den verschluesselten Token.
- Clientseitige Verschluesselung bleibt vollstaendig im Browser.
- Dockerfile und `docker-compose.yml` fuer ZimaOS/Reverse-Proxy-Betrieb vorhanden.
- ZimaOS-Compose nutzt GHCR-Image statt lokalem Build.
- Persistenz erfolgt ueber Bind-Mount `/DATA/AppData/datello/data:/data`.
- `x-casaos`-Metadaten fuer ZimaOS/CasaOS-App-Import vorhanden.
- App-Icon/Logo ist als SVG und PNG-Favicon eingebunden.

## Sicherheit

- `POST /api/token` und Legacy `POST /save.php` benoetigen `X-Auth-Token`.
- Ohne `DV2_SHARED_SECRET` startet der Container nicht.
- Token-Write ist atomar und auf 1 MB Request-Groesse begrenzt.
- Token wird auf Mindestlaenge und erlaubte Zeichen geprueft.
- Server setzt grundlegende Security-Header.
- Service Worker cached keine Token-/Save-Endpunkte.
- Container laeuft als non-root User.
- Container laeuft read-only mit `/data`-Bind-Mount und `/tmp`-Tmpfs.
- Capabilities werden gedroppt und `no-new-privileges` ist gesetzt.
- Ressourcenlimits fuer CPU, RAM und Prozesse sind gesetzt.
- Log-Rotation ist gesetzt, damit ZimaOS-Speicher nicht durch Logs volllaeuft.

## Funktionen

- Setup speichert verschluesselte Daten ueber die Python-API.
- Ersteinrichtung fragt nur vollen Namen, Master-Passwort und Server-Secret ab.
- Nach Ersteinrichtung oeffnet sich ein gefuehrter Profil-Fortschritt statt einer grossen Gesamtmaske.
- Private und geschaeftliche Adresse sind getrennte Felder.
- Login per Master-Passwort bleibt erhalten.
- PIN speichert nur einen lokal verschluesselten Passwort-Blob.
- Passkey/WebAuthn-PRF bleibt optional erhalten.
- Privat-, Firma-, PayPal- und Bank-Reiter bleiben erhalten.
- QR-Codes werden lokal erzeugt.
- vCard enthaelt nur private Felder.
- PayPal-Link enthaelt keinen Verwendungszweck.
- GiroCode enthaelt optionalen Verwendungszweck.
- Betrag synchronisiert zwischen PayPal und Bank.
- Export/Import des Tokens bleibt erhalten.

## Deployment

- `docker compose pull && docker compose up -d` startet ohne lokalen Build.
- Healthcheck prueft `GET /healthz`.
- Reverse Proxy muss HTTPS terminieren.
- `.env` enthaelt `WEBUI_PORT`, `TZ`, `DV2_ACCESS_LOG` und `DV2_SHARED_SECRET`; `.env` wird nicht versioniert.
- Host-Datenordner muss fuer UID/GID `10001:10001` schreibbar sein.
