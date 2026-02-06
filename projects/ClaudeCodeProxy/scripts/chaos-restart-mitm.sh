#!/usr/bin/env bash
set -euo pipefail
PORT=${1:-8080}
DELAY=${2:-30}
ADDON=${ADDON_PATH:-services/mitm-subagent-offload/addons/haiku_glm_router.py}
echo "[chaos] restarting mitm in ${DELAY}s on port ${PORT}"
sleep "$DELAY"
pkill -f "mitmdump.*-p $PORT" || true
sleep 2
mitmdump -s "$ADDON" -p "$PORT" &
echo "[chaos] restarted mitm on :$PORT"

