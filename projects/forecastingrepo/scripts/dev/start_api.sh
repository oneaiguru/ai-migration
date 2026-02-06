#!/usr/bin/env bash
set -euo pipefail

export PYTHONHASHSEED=${PYTHONHASHSEED:-0}
export TZ=${TZ:-UTC}
export LC_ALL=${LC_ALL:-C.UTF-8}

PORT=${PORT:-8000}

if ! command -v uvicorn >/dev/null 2>&1; then
  echo "[info] uvicorn not found in PATH; trying .venv"
  UV=".venv/bin/uvicorn"
else
  UV="uvicorn"
fi

exec ${UV} scripts.api_app:app --host 127.0.0.1 --port "$PORT"

