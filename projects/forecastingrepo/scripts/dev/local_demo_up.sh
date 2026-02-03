#!/usr/bin/env bash
set -euo pipefail
API_ROOT=${API_ROOT:-/Users/m/git/clients/rtneo/forecastingrepo}
UI_ROOT=${UI_ROOT:-/Users/m/git/clients/rtneo/ui/forecast-ui}
API_PORT=${API_PORT:-8000}
UI_PORT=${UI_PORT:-4173}

bash "$API_ROOT/scripts/dev/local_demo_down.sh" || true

cd "$API_ROOT"
export DEMO_DEFAULT_DATE=${DEMO_DEFAULT_DATE:-2024-08-03}
export API_CORS_ORIGIN=${API_CORS_ORIGIN:-http://127.0.0.1:${UI_PORT}}
nohup bash scripts/dev/start_api.sh >/tmp/api.log 2>&1 &
sleep 2

ok=0
for i in {1..60}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${API_PORT}/api/metrics" || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 1
done
if [ "$ok" != "1" ]; then echo "[ERR] API not responding"; exit 1; fi

cd "$UI_ROOT"
export VITE_API_URL="http://127.0.0.1:${API_PORT}"
npm run build -s
nohup npm run preview -- --host 127.0.0.1 --port ${UI_PORT} >/tmp/ui_preview.log 2>&1 &
sleep 1

ok=0
for i in {1..30}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${UI_PORT}" || true)
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 1
done
if [ "$ok" != "1" ]; then echo "[ERR] UI preview not responding"; exit 1; fi

echo "DONE: Open http://127.0.0.1:${UI_PORT} (API: http://127.0.0.1:${API_PORT}/api/metrics)"
