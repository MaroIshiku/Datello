#!/usr/bin/env python3
"""Small production-minded server for the encrypted Datello PWA.

The browser still performs all encryption and decryption. This server only
serves static files and stores the encrypted token atomically.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hmac
import json
import mimetypes
import os
import re
import tempfile
from http import HTTPStatus
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parent
DEFAULT_STATIC_DIR = ROOT
DEFAULT_DATA_FILE = Path(os.environ.get("DV2_DATA_FILE", "/data/data.json"))
MAX_BODY_BYTES = 1024 * 1024
MIN_TOKEN_LENGTH = 64
TOKEN_RE = re.compile(r"^[A-Za-z0-9+/=._:-]+$")
NETWORK_ONLY_PATHS = {"/api/data", "/api/token", "/data.json", "/save.php"}
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "X-Frame-Options": "DENY",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Content-Security-Policy": (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self'; "
        "img-src 'self' data: blob:; "
        "connect-src 'self'; "
        "manifest-src 'self'; "
        "worker-src 'self'; "
        "object-src 'none'; "
        "base-uri 'none'; "
        "form-action 'self'; "
        "frame-ancestors 'none'"
    ),
}


class AppConfig:
    def __init__(self, static_dir: Path, data_file: Path, secret: str, dev_allow_weak_secret: bool) -> None:
        self.static_dir = static_dir.resolve()
        self.data_file = data_file.resolve()
        self.secret = secret
        self.dev_allow_weak_secret = dev_allow_weak_secret

    def validate(self) -> None:
        if not self.static_dir.exists():
            raise SystemExit(f"Static directory does not exist: {self.static_dir}")
        if not self.secret and not self.dev_allow_weak_secret:
            raise SystemExit("DV2_SHARED_SECRET must be set.")
        if self.secret == "CHANGE_ME" and not self.dev_allow_weak_secret:
            raise SystemExit("DV2_SHARED_SECRET must not be CHANGE_ME.")
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        if not self.data_file.exists():
            atomic_write_json(self.data_file, {"token": "", "updated": None})


def utc_now_iso() -> str:
    return dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_name, path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
        raise


def read_token_file(path: Path) -> dict:
    if not path.exists():
        return {"token": "", "updated": None}
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return {"token": str(data.get("token") or ""), "updated": data.get("updated")}


class ContactCardHandler(BaseHTTPRequestHandler):
    server_version = "Datello"
    sys_version = ""

    @property
    def config(self) -> AppConfig:
        return self.server.config  # type: ignore[attr-defined]

    def log_message(self, fmt: str, *args: object) -> None:
        if os.environ.get("DV2_ACCESS_LOG", "").lower() in {"1", "true", "yes"}:
            super().log_message(fmt, *args)

    def end_headers(self) -> None:
        for name, value in SECURITY_HEADERS.items():
            self.send_header(name, value)
        super().end_headers()

    def do_GET(self) -> None:
        if self.path_no_query == "/healthz":
            self.respond_json({"ok": True})
            return
        if self.path_no_query in {"/api/data", "/data.json"}:
            self.respond_json(read_token_file(self.config.data_file), no_store=True)
            return
        self.serve_static()

    def do_HEAD(self) -> None:
        if self.path_no_query == "/healthz":
            self.send_response(HTTPStatus.NO_CONTENT)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return
        self.serve_static(head_only=True)

    def do_POST(self) -> None:
        if self.path_no_query not in {"/api/token", "/save.php"}:
            self.respond_json({"ok": False, "error": "Nicht gefunden."}, HTTPStatus.NOT_FOUND)
            return
        if not self.authorized():
            self.respond_json({"ok": False, "error": "Ungültiges Shared Secret."}, HTTPStatus.FORBIDDEN)
            return
        try:
            payload = self.read_json_body()
            token = payload.get("token", "")
            if not isinstance(token, str) or len(token) < MIN_TOKEN_LENGTH or not TOKEN_RE.fullmatch(token):
                self.respond_json({"ok": False, "error": "Token fehlt oder ist zu kurz."}, HTTPStatus.UNPROCESSABLE_ENTITY)
                return
            updated = utc_now_iso()
            atomic_write_json(self.config.data_file, {"token": token, "updated": updated})
            self.respond_json({"ok": True, "token": token, "updated": updated}, no_store=True)
        except ValueError as exc:
            self.respond_json({"ok": False, "error": str(exc)}, HTTPStatus.BAD_REQUEST)
        except OSError:
            self.respond_json({"ok": False, "error": "Token konnte nicht geschrieben werden."}, HTTPStatus.INTERNAL_SERVER_ERROR)

    @property
    def path_no_query(self) -> str:
        return self.path.split("?", 1)[0]

    def authorized(self) -> bool:
        provided = self.headers.get("X-Auth-Token", "")
        return bool(self.config.secret) and hmac.compare_digest(provided, self.config.secret)

    def read_json_body(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("Ungültige Content-Length.") from exc
        if length <= 0 or length > MAX_BODY_BYTES:
            raise ValueError("Ungültiger Request.")
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError("JSON konnte nicht gelesen werden.") from exc
        if not isinstance(data, dict):
            raise ValueError("JSON-Objekt erwartet.")
        return data

    def respond_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK, no_store: bool = False) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store" if no_store else "private, max-age=0")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def serve_static(self, head_only: bool = False) -> None:
        requested = unquote(self.path_no_query)
        rel = "index.html" if requested in {"", "/"} else requested.lstrip("/")
        target = (self.config.static_dir / rel).resolve()
        if self.config.static_dir not in target.parents and target != self.config.static_dir:
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if target.is_dir():
            target = target / "index.html"
        if not target.exists() or not target.is_file():
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(target.stat().st_size))
        if self.path_no_query in NETWORK_ONLY_PATHS:
            self.send_header("Cache-Control", "no-store")
        elif target.name == "sw.js":
            self.send_header("Cache-Control", "no-store")
        elif target.name == "index.html" or target.suffix in {".html", ".json", ".js", ".css"}:
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        self.end_headers()
        if not head_only:
            with target.open("rb") as handle:
                self.wfile.write(handle.read())


class ContactCardServer(ThreadingHTTPServer):
    def __init__(self, server_address: tuple[str, int], config: AppConfig) -> None:
        super().__init__(server_address, ContactCardHandler)
        self.config = config


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the encrypted Datello PWA.")
    parser.add_argument("--host", default=os.environ.get("DV2_HOST", "0.0.0.0"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("DV2_PORT", "8080")))
    parser.add_argument("--static-dir", type=Path, default=Path(os.environ.get("DV2_STATIC_DIR", DEFAULT_STATIC_DIR)))
    parser.add_argument("--data-file", type=Path, default=DEFAULT_DATA_FILE)
    parser.add_argument("--dev-allow-weak-secret", action="store_true", default=os.environ.get("DV2_DEV_ALLOW_WEAK_SECRET") == "1")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = AppConfig(
        static_dir=args.static_dir,
        data_file=args.data_file,
        secret=os.environ.get("DV2_SHARED_SECRET", ""),
        dev_allow_weak_secret=args.dev_allow_weak_secret,
    )
    config.validate()
    httpd = ContactCardServer((args.host, args.port), config)
    print(f"Datello listening on http://{args.host}:{args.port}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
