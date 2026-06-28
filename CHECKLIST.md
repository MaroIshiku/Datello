# Abnahme-Check

Stand: 2026-06-28

## Architektur

- Python-Server liefert die Meiku PWA und speichert nur den verschluesselten Token.
- Clientseitige Verschluesselung bleibt vollstaendig im Browser.
- Dockerfile und `docker-compose.yml` fuer ZimaOS/Reverse-Proxy-Betrieb vorhanden.
- ZimaOS-Compose nutzt GHCR-Image `ghcr.io/maroishiku/meiku:latest` statt lokalem Build.
- Persistenz erfolgt ueber Bind-Mount `/DATA/AppData/meiku/data:/data`.
- `x-casaos`-Metadaten fuer ZimaOS/CasaOS-App-Import vorhanden.
- App-Logo und PWA-Icons sind aus dem Meiku-Logo abgeleitet.

## Designsystem

- Aktive Oberflaeche nutzt `design-system/tokens.css` aus dem Pixel Soft Utility Codex Pack v4.
- Gemeinsame Zip-Artefakte liegen im Repo: `design-system/`, `icons/`, `contracts/`, `checklists/`.
- `app.manifest.json` beschreibt Meiku nach dem Pixel Soft Utility App-Manifest-Schema.
- App-Name ist `Meiku - Profile Share`.
- Header nutzt gemeinsames AppLogo/AppName/AppSubtitle-Muster.
- Theme-Attribute liegen auf `document.documentElement`: `data-theme`, `data-mode`, `data-resolved-mode`.
- Theme- und Mode-Persistenz nutzt `meiku-theme` und `meiku-mode`.
- Sechs Themes sind verfuegbar: Lavender, Mint, Sky, Amber, Rose, Graphite.
- Modi sind verfuegbar: System, Hell, Dunkel.
- Technische Build-Informationen liegen nur im Debug-/Settings-Sheet.

## Sicherheit

- `POST /api/token` und Legacy `POST /save.php` benoetigen `X-Auth-Token`.
- Ohne `ISHIKU_SETUP_SECRET`, `ISHIKU_SETUP_SECRET_FILE` oder Legacy `DV2_SHARED_SECRET` startet der Container nicht.
- Der Server liest bevorzugt `ISHIKU_SETUP_SECRET_FILE`, dann `ISHIKU_SETUP_SECRET`, dann `DV2_SHARED_SECRET`.
- Token-Write ist atomar und auf 1 MB Request-Groesse begrenzt.
- Token wird auf Mindestlaenge und erlaubte Zeichen geprueft.
- Server setzt grundlegende Security-Header.
- Service Worker cached keine Token-/Save-Endpunkte.
- Container laeuft als non-root User.
- Container laeuft read-only mit `/data`-Bind-Mount und `/tmp`-Tmpfs; der Entrypoint korrigiert den Datenordner-Besitzer und droppt danach auf UID/GID `10001:10001`.
- Capabilities werden gedroppt und `no-new-privileges` ist gesetzt.
- Ressourcenlimits fuer CPU, RAM und Prozesse sind gesetzt.
- Log-Rotation ist gesetzt, damit ZimaOS-Speicher nicht durch Logs volllaeuft.

## Funktionen

- Setup speichert verschluesselte Daten ueber die Python-API.
- Ersteinrichtung fragt vollen Namen, Master-Passwort und Server-Secret ab.
- Nach Ersteinrichtung oeffnet sich ein gefuehrter Profil-Fortschritt.
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
- Readiness prueft `GET /readyz`.
- Reverse Proxy muss HTTPS terminieren.
- `.env` enthaelt `WEBUI_PORT`, `TZ`, `ISHIKU_LOG_LEVEL`, `ISHIKU_SETUP_SECRET`, `DV2_ACCESS_LOG` und `MEIKU_DATA_PATH`; `.env` wird nicht versioniert.
- Host-Datenordner wird beim Start auf UID/GID `10001:10001` gesetzt, sofern Docker `CHOWN` erlaubt; andernfalls muss der Host-Ordner manuell passend gesetzt werden.
