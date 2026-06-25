# Datello

Profile Share

Mobile-first PWA fuer private und geschaeftliche Kontaktdaten mit PayPal- und SEPA/EPC-Zahlungs-QRs. Die App laeuft als schlanker Python-Webserver im Docker-Container, ist fuer ZimaOS geeignet und bleibt sicherheitsseitig clientseitig verschluesselt: Der Server speichert nur den AES-GCM-Token und sieht nie Klartextdaten.

## Funktionen

- Setup, Login und Bearbeitung direkt in der PWA
- Web Crypto API: AES-GCM-256 plus PBKDF2-SHA-256
- PIN-Schnelllogin mit lokal verschluesseltem Master-Passwort
- optionaler Passkey-/Biometrie-Schnelllogin via WebAuthn-PRF
- Reiter: Privat, Firma, PayPal, Bank
- minimale Ersteinrichtung: voller Name, Master-Passwort und Server-Secret
- geführter Profil-Fortschritt für Privat, Geschäftlich, PayPal und Bank
- getrennte private und geschäftliche Adresse
- lokale QR-Erzeugung ohne Drittanbieter-API
- getrennte vCard-QRs fuer Privat und Firma
- PayPal-QR und GiroCode/EPC-QR mit synchronisiertem Betrag
- Export/Import des verschluesselten Tokens
- PWA-Manifest, Service Worker und mobile-only Layout
- Python-API fuer Token-I/O mit `X-Auth-Token`

## Docker auf ZimaOS

1. Repository klonen:

```bash
git clone git@github.com:MaroIshiku/ish-contact.git
cd ish-contact
```

2. `.env` anlegen:

```bash
cp .env.example .env
```

3. In `.env` ein langes Secret setzen:

```env
WEBUI_PORT=8080
TZ=Europe/Berlin
DV2_ACCESS_LOG=false
ISH_CONTACT_DATA_PATH=/DATA/AppData/ish-contact/data
DV2_SHARED_SECRET=ein-langes-zufaelliges-secret
```

4. Datenordner auf dem ZimaOS-Host anlegen:

```bash
mkdir -p /DATA/AppData/ish-contact/data
chown -R 10001:10001 /DATA/AppData/ish-contact/data
```

5. Fertiges GHCR-Image ziehen und Container starten:

```bash
docker compose pull
docker compose up -d
```

6. In ZimaOS/Reverse Proxy die App per HTTPS veroeffentlichen. HTTPS ist wichtig fuer Web Crypto, Service Worker, Wake Lock und Passkeys.

7. Beim ersten Setup in der App dasselbe `DV2_SHARED_SECRET` als Server-Secret eintragen. Danach wird der verschluesselte Token auf dem Host unter `/DATA/AppData/ish-contact/data/data.json` gespeichert.

## ZimaOS Compose-Hinweise

- `docker-compose.yml` nutzt direkt `ghcr.io/maroishiku/ish-contact:latest`; ZimaOS muss nicht lokal bauen.
- `WEBUI_PORT` steuert den veroeffentlichten WebUI-Port und ist auf `8080` voreingestellt.
- Der Container laeuft read-only. Schreibbar sind nur `/data` und ein kleines `/tmp`-Tmpfs.
- Persistente Daten liegen bewusst als Bind-Mount unter `/DATA/AppData/ish-contact/data`, passend zur ZimaOS-AppData-Struktur.
- Fuer lokale Windows-Docker-Desktop-Tests kann `ISH_CONTACT_DATA_PATH=./data` gesetzt werden.
- Der Datenordner muss fuer UID/GID `10001:10001` schreibbar sein, weil der Container nicht als root laeuft.
- `DV2_SHARED_SECRET` ist Pflicht. Ohne diesen Wert startet Compose nicht.

## Endpunkte

- `GET /` statische PWA
- `GET /healthz` Healthcheck
- `GET /api/data` verschluesselten Token laden
- `POST /api/token` verschluesselten Token speichern, benoetigt Header `X-Auth-Token`

Legacy-Endpunkte bleiben kompatibel:

- `GET /data.json`
- `POST /save.php`

## Sicherheit

- Klartextdaten verlassen den Browser nicht.
- Das Master-Passwort wird nicht an den Server gesendet.
- `DV2_SHARED_SECRET` schuetzt Schreibzugriffe gegen fremde POSTs.
- `data.json`/`api/data` und `save.php`/`api/token` werden vom Service Worker nicht gecacht.
- Der Container laeuft ohne Root-User.

## Lokaler Test

```bash
DV2_SHARED_SECRET=dev-secret DV2_DATA_FILE=./data/data.json python server.py --host 127.0.0.1 --port 8080
```

Dann `http://127.0.0.1:8080` oeffnen. Fuer echte Nutzung bitte HTTPS verwenden.

## Image

Das Docker-Image wird per GitHub Actions nach GHCR veroeffentlicht:

```text
ghcr.io/maroishiku/ish-contact:latest
```

`docker-compose.yml` nutzt dieses Image direkt. Ein lokaler Build auf ZimaOS ist nicht noetig.
