#!/bin/sh
set -e

# default retry interval (seconds)
RETRY_INTERVAL=${RETRY_INTERVAL:-2}
MAX_RETRIES=${MAX_RETRIES:-60}
i=0

echo "Entrypoint: starting init task..."

# tunggu & retry hingga migrate success (db siap)
until npm run migrate:up; do
    i=$((i+1))
    echo "migrate failed, retrying in ${RETRY_INTERVAL}s (attempt $i/$MAX_RETRIES)"
    [ "$i" -ge "$MAX_RETRIES" ] && { echo "migrate failed after $i attempts"; exit 1; }
    sleep "$RETRY_INTERVAL"
done

# jalankan import sekali — import.js sudah melakukan pengecekan per-table (idempotent)
echo "Running import:csv (idempotent)"
if npm run import:csv; then
  echo "import finished"
else
  echo "import failed or skipped; continuing"
fi

echo "init task done. starting app..."
exec npm run dev