#!/usr/bin/env bash
set -euo pipefail

pkill -f 'uvicorn scripts.api_app:app' || true
pkill -f 'cloudflared tunnel --url http://127.0.0.1:8000' || true
echo "Stopped API and tunnel (if running)."

