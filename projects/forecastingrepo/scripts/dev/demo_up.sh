#!/usr/bin/env bash
set -euo pipefail
export DEMO_DEFAULT_DATE=${DEMO_DEFAULT_DATE:-2024-08-03}
export API_CORS_ORIGIN=${API_CORS_ORIGIN:-https://mytko-forecast-ui.vercel.app}
PORT=${PORT:-8000}
cd "$(dirname "$0")/../.."
if ! pgrep -f "scripts.api_app:app" >/dev/null 2>&1; then
  nohup bash scripts/dev/start_api.sh >/tmp/api.log 2>&1 &
  sleep 2
fi
attempt_tunnel() {
  # ensure log file exists fresh
  : > /tmp/cloudflared.log || true
  bash scripts/dev/tunnel_start.sh >/tmp/tunnel_cmd.out 2>&1 || true
  # Wait up to ~45s for URL to appear
  URL=""
  for i in {1..45}; do
    URL=$(grep -Eo 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' -m1 /tmp/cloudflared.log || true)
    if [ -n "$URL" ]; then break; fi
    sleep 1
  done
}

if pgrep -f "cloudflared tunnel" >/dev/null 2>&1; then
  # Try to read current URL; if missing, restart
  URL=$(grep -Eo 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' -m1 /tmp/cloudflared.log || true)
  if [ -z "$URL" ]; then
    pkill -f "cloudflared" || true
    sleep 1
    attempt_tunnel
  fi
else
  attempt_tunnel
fi
if [ -z "$URL" ]; then
  echo "[error] Could not determine tunnel URL (see /tmp/cloudflared.log)" >&2
  exit 1
fi
printf "BASE=%s\n" "$URL"
