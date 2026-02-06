#!/usr/bin/env bash
set -euo pipefail

# UAT T1-T3 against local CCP (Go shim) using Claude CLI.
# Requirements:
# - claude CLI installed and logged-in (or ANTHROPIC_AUTH_TOKEN set if needed for sonnet)
# - .env contains a single-line ZAI_API_KEY or ZAI_API_KEY is exported
#
# Usage: scripts/uat/run_t1_t3_ccp.sh [PORT]

PORT=${1:-8082}
ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT_DIR/services/go-anth-shim"

echo "[uat] building ccp..."
GOPROXY=direct GOSUMDB=off go build -o ./bin/ccp ./cmd/ccp

echo "[uat] resolving ZAI_API_KEY..."
if [[ -z "${ZAI_API_KEY:-}" ]]; then
  if [[ -f "$ROOT_DIR/.env" ]]; then
    export ZAI_API_KEY=$(head -n1 "$ROOT_DIR/.env" | tr -d '\r')
  fi
fi
if [[ -z "${ZAI_API_KEY:-}" ]]; then
  echo "ZAI_API_KEY not set and .env missing; abort." >&2
  exit 1
fi

echo "[uat] ensuring trial license exports..."
if [[ -z "${CC_LICENSE_JSON:-}" || -z "${CC_LICENSE_SIG:-}" ]]; then
  LICENSE_ENV="$ROOT_DIR/logs/dev-license/exports.sh"
  if [[ ! -f "$LICENSE_ENV" ]]; then
    echo "[uat] provisioning local trial license"
    (cd "$ROOT_DIR" && scripts/dev/dev-license-activate.sh)
  fi
  if [[ -f "$LICENSE_ENV" ]]; then
    # shellcheck disable=SC1090
    source "$LICENSE_ENV"
  else
    echo "[uat] license exports missing (expected $LICENSE_ENV)." >&2
    exit 1
  fi
fi

echo "[uat] starting CCP on :$PORT ..."
LOG=/tmp/ccp_uat_ccp.log
set +e
ZAI_API_KEY="$ZAI_API_KEY" CCP_PERSIST=1 CCP_DB_PATH=logs/ccp.uat.sqlite3 CCP_DEV_ENABLE=1 ./bin/ccp serve --port "$PORT" >"$LOG" 2>&1 &
PID=$!
set -e
sleep 1

echo "[uat] waiting for /healthz ..."
for i in {1..40}; do
  if curl -sSf "http://127.0.0.1:${PORT}/healthz" >/dev/null 2>&1; then
    break
  fi
  sleep 0.25
done

echo "[uat] T1 - Haiku -> Z.AI"
FORCE_HAIKU_TO_ZAI=1 ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}" claude -p --model haiku "/status" --output-format json | tee /tmp/uat_t1.json || true

echo "[uat] T2 - Sonnet -> Anthropic (skip if no token)"
if [[ -n "${ANTHROPIC_AUTH_TOKEN:-}" ]]; then
  ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}" claude -p --model sonnet "/status" --output-format json | tee /tmp/uat_t2.json || true
else
  echo "[uat] Skipping T2 - set ANTHROPIC_AUTH_TOKEN to exercise Anth lane"
fi

echo "[uat] T3 - SSE integrity"
ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}" timeout 60s claude -p "Generate 200 lines of numbered text quickly." >/dev/null || true

echo "[uat] done. Logs: $LOG; samples/rollups at /v1/usage/*; metrics at /metrics"
