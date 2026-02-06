#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-}
ORIGIN=${2:-https://mytko-forecast-ui.vercel.app}
if [ -z "$BASE" ]; then
  echo "Usage: $0 <BASE> [UI_ORIGIN]" >&2
  exit 2
fi
echo "[verify] GET $BASE/api/metrics"
status="000"
for i in {1..60}; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/metrics" 2>/dev/null) || true
  if [ "$status" = "200" ]; then break; fi
  sleep 1
done
if [ "$status" != "200" ]; then
  echo "[fail] GET /api/metrics returned $status" >&2
  exit 1
fi
printf "[ok] metrics returned %s\n" "$status"

echo "[verify] OPTIONS $BASE/api/metrics (CORS for $ORIGIN)"
hdr=$(curl -s -i -X OPTIONS "$BASE/api/metrics" -H "Origin: $ORIGIN" -H "Access-Control-Request-Method: GET" 2>/dev/null)
echo "$hdr" | grep -qi "^HTTP/.* 200" || { echo "[fail] Preflight not 200" >&2; exit 1; }
echo "$hdr" | grep -qi "access-control-allow-origin: $ORIGIN" || { echo "[fail] ACAO missing or mismatched" >&2; exit 1; }
echo "[ok] CORS preflight passed"
