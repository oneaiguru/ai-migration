#!/usr/bin/env bash
set -euo pipefail
pkill -f cloudflared >/dev/null 2>&1 || true
pkill -f "scripts.api_app:app" >/dev/null 2>&1 || true
pkill -f uvicorn >/dev/null 2>&1 || true
echo "Stopped cloudflared and uvicorn (if running)."
