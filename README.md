# Meiku - Profile Share

Self-hosted profile and contact card app for private and business QR cards.

## Short Description

Meiku is a mobile-first PWA for encrypted private and business profile cards with local contact, PayPal and SEPA/EPC QR codes. The Python server serves the app and stores only an encrypted token; plaintext data stays in the browser.

## Part of the ishiku Family

Meiku follows the shared Pixel Soft Utility design system for calm, rounded and self-hosted utility interfaces. The app uses the same six themes as the other ishiku apps: Lavender, Mint, Sky, Amber, Rose and Graphite. System, light and dark modes are implemented through shared theme tokens.

The interface uses the shared AppHeader, local logo assets, shared design tokens and technical information only in the settings/debug area. Meiku is not a server admin system with a user database; first run creates a client-side encrypted profile vault instead.

## Features

- Setup, login and editing directly in the PWA
- Web Crypto API: AES-GCM-256 plus PBKDF2-SHA-256
- PIN quick login with locally encrypted master password
- Optional passkey/biometric quick login through WebAuthn PRF
- Tabs: Private, Company, PayPal, Bank
- Guided profile progress for Private, Business, PayPal and Bank
- Separate private and business addresses
- Local QR generation without a third-party API
- Separate vCard QRs for Private and Company
- PayPal QR and GiroCode/EPC QR with synchronized amount
- Export/import for the encrypted token
- PWA manifest, service worker and Meiku PWA icons
- Python API for token I/O with `X-Auth-Token`

## Tech Stack

- Vanilla HTML, CSS and JavaScript as a PWA
- Web Crypto API for client-side encryption
- Custom local QR renderer without an external QR API
- Python `http.server`-based runtime server
- Docker/Compose for ZimaOS, CasaOS and other self-hosted setups
- Pixel Soft Utility Codex Pack v4 for design tokens, contracts and checklists

## Installation

### Docker Compose

```bash
git clone git@github.com:MaroIshiku/meiku.git
cd meiku
cp .env.example .env
```

Set at least one long secret in `.env`:

```env
WEBUI_PORT=8080
TZ=Europe/Berlin
ISHIKU_SETUP_SECRET=a-long-random-secret
MEIKU_DATA_PATH=/DATA/AppData/meiku/data
```

Prepare the data folder on the host:

```bash
mkdir -p /DATA/AppData/meiku/data
```

On container startup, the Meiku entrypoint sets the data folder owner to `10001:10001` when Docker permits `CHOWN` for the bind mount. If your host does not allow this, run once:

```bash
chown -R 10001:10001 /DATA/AppData/meiku/data
```

Start the container:

```bash
docker compose pull
docker compose up -d
```

### First Start

On first start, Meiku shows the vault setup. Enter the profile name, a master password and the same secret configured server-side as `ISHIKU_SETUP_SECRET`, `ISHIKU_SETUP_SECRET_FILE` or the legacy variable `DV2_SHARED_SECRET`.

### Admin Account

Meiku does not create a server admin account and does not store user password hashes because the app is a client-side encrypted profile vault. The setup secret mechanism protects write access to the encrypted token. The master password is never sent to the server.

## Configuration

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `WEBUI_PORT` | Host port for the web interface, default `8080`. |
| `TZ` | Time zone, default `Europe/Berlin`. |
| `ISHIKU_DATA_DIR` | Persistent data folder in the container, default `/data`. |
| `ISHIKU_LOG_LEVEL` | Shared runtime log level, default `info`. |
| `ISHIKU_SETUP_SECRET` | Preferred secret for setup and token write access. |
| `ISHIKU_SETUP_SECRET_FILE` | Optional path to a secret file, preferred over environment secrets. |
| `DV2_SHARED_SECRET` | Legacy alias for existing installations. |
| `DV2_ACCESS_LOG` | Enables simple access logs with `true`, `1` or `yes`. |
| `MEIKU_DATA_PATH` | Host bind mount for persistent data. |

### Docker Secrets

When a secret file is used, the server reads `ISHIKU_SETUP_SECRET_FILE` first. Without an explicit variable, it checks `/run/secrets/ishiku_setup_secret`. If no file exists, it falls back to `ISHIKU_SETUP_SECRET` and then `DV2_SHARED_SECRET`.

Secret values are not logged and are not delivered to client-side JavaScript.

### Persistent Data

Inside the container, the encrypted token is stored at `/data/data.json` by default. On ZimaOS, this path is recommended:

```text
/DATA/AppData/meiku/data
```

## Security

- Plaintext data never leaves the browser.
- The master password is never sent to the server.
- The server stores only the AES-GCM token.
- The setup/shared secret is only intended for write access to the encrypted token.
- Meiku stores no plaintext passwords and no reversibly encrypted server passwords.
- There is no public server registration.
- `data.json`, `/api/data`, `/api/token` and `save.php` are not cached by the service worker.
- The container starts briefly with root privileges, fixes the `/data` bind mount when needed and then runs as UID/GID `10001:10001`, read-only, with a `/data` bind mount and `/tmp` tmpfs.

## Updates and Backup

Updates:

```bash
docker compose pull
docker compose up -d
```

Backup:

- Back up the host folder configured through `MEIKU_DATA_PATH`.
- Optionally export the encrypted token in the app.
- Store the master password and server-side secret separately and securely.

## Development

Local start:

```bash
ISHIKU_SETUP_SECRET=dev-secret DV2_DATA_FILE=./data/data.json python server.py --host 127.0.0.1 --port 8080
```

Health checks:

```text
GET /healthz
GET /readyz
```

Token endpoints:

```text
GET /api/data
POST /api/token
```

Legacy endpoints remain compatible:

```text
GET /data.json
POST /save.php
```

## Created with ChatGPT Codex

This project was implemented and refined with support from ChatGPT Codex. Codex is a development tool; maintenance, operation and responsibility remain with the repository owner.

## Status and License

Status: actively in development.

License: not specified yet.
