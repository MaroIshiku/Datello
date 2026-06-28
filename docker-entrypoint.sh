#!/bin/sh
set -eu

APP_UID="${MEIKU_UID:-10001}"
APP_GID="${MEIKU_GID:-10001}"
DATA_DIR="${ISHIKU_DATA_DIR:-/data}"

mkdir -p "$DATA_DIR"

if [ "$(id -u)" = "0" ]; then
  if ! chown -R "$APP_UID:$APP_GID" "$DATA_DIR"; then
    echo "Meiku warning: could not chown $DATA_DIR to $APP_UID:$APP_GID." >&2
    echo "Meiku warning: ensure the host data directory is writable by that UID/GID." >&2
  fi
  exec su-exec "$APP_UID:$APP_GID" "$@"
fi

exec "$@"
