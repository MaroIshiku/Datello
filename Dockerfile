FROM python:3.13-alpine

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DV2_HOST=0.0.0.0 \
    DV2_PORT=8080 \
    DV2_STATIC_DIR=/app \
    DV2_DATA_FILE=/data/data.json

WORKDIR /app

RUN addgroup -S ishcontact && adduser -S -G ishcontact -u 10001 ishcontact \
    && mkdir -p /data \
    && chown -R ishcontact:ishcontact /data /app

COPY --chown=ishcontact:ishcontact index.html manifest.json sw.js server.py save.php build-info.json ./
COPY --chown=ishcontact:ishcontact css ./css
COPY --chown=ishcontact:ishcontact js ./js
COPY --chown=ishcontact:ishcontact assets ./assets

USER ishcontact

EXPOSE 8080
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=3).read()" || exit 1

CMD ["python", "/app/server.py"]
