#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8000}
LOG=${LOG:-/tmp/cloudflared.log}

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not installed. Install from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
  exit 1
fi

nohup cloudflared tunnel --url "http://127.0.0.1:${PORT}" >"$LOG" 2>&1 &
sleep 2
URL=$(grep -Eo 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' -m1 "$LOG" || true)
echo "API_URL=${URL:-<pending>}"
echo "Log: $LOG"

