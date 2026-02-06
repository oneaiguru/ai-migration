#!/usr/bin/env bash
set -euo pipefail

PORT=8082
VARIANT="full"
PORT_SET=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --lite)
      VARIANT="lite"
      shift
      ;;
    *)
      if [[ $PORT_SET -eq 0 ]]; then
        PORT="$1"
        PORT_SET=1
        shift
      else
        echo "usage: $0 [port] [--lite]" >&2
        exit 1
      fi
      ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"
LOG_ROOT="${CCP_LOGS_DIR:-${ROOT}/logs}"
RESULTS_ROOT="${CCP_RESULTS_DIR:-${ROOT}/results}"

BUILD_TARGET="go-shim-build"
SHIM_BIN="${ROOT}/services/go-anth-shim/bin/ccp"
if [[ "${VARIANT}" == "lite" ]]; then
  BUILD_TARGET="go-shim-lite-build"
  SHIM_BIN="${ROOT}/services/go-anth-shim/bin/ccp-lite"
fi

echo "[quick] build shim (${VARIANT})"
make "${BUILD_TARGET}" >/dev/null

echo "[quick] rotate logs"
mkdir -p "${LOG_ROOT}/archive" "${RESULTS_ROOT}"
if [[ -f "${LOG_ROOT}/usage.jsonl" ]]; then
  mv "${LOG_ROOT}/usage.jsonl" "${LOG_ROOT}/archive/usage-$(date +%Y%m%d-%H%M%S).jsonl" || true
fi
: > "${LOG_ROOT}/usage.jsonl"

echo "[quick] (re)start shim on :$PORT"
pkill -f ccp 2>/dev/null || true
pkill -f "services/go-anth-shim/bin/ccp" 2>/dev/null || true
pkill -f "services/go-anth-shim/bin/ccp-lite" 2>/dev/null || true
if [[ -z "${ZAI_API_KEY:-}" && -f .env ]]; then
  export ZAI_API_KEY=$(grep -Ev '^[[:space:]]*#' .env | head -n1 | tr -d '\r' | xargs echo -n)
fi
ZAI_API_KEY="${ZAI_API_KEY:-}" "${SHIM_BIN}" serve --port "$PORT" > "${LOG_ROOT}/ccp.out" 2>&1 &
echo $! > "${LOG_ROOT}/ccp.pid"
sleep 1

export ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}"
unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_AUTH_TOKEN

echo "[quick] 1× Haiku and 1× Sonnet via Claude CLI with timeouts"
bash scripts/with-timeout.sh 60 claude -p --model haiku  "Say ok" --output-format json >/dev/null 2>&1 || echo "[quick] haiku timeout/err (ignored)"
sleep 0.2
bash scripts/with-timeout.sh 60 claude -p --model sonnet "/status" --output-format json >/dev/null 2>&1 || echo "[quick] sonnet timeout/err (ignored)"

node scripts/summarize-usage.js "${LOG_ROOT}/usage.jsonl" | tee "${RESULTS_ROOT}/METRICS_go_repro_quick.json" >/dev/null || true

rg -n '"lane":"anthropic".*haiku' "${LOG_ROOT}/usage.jsonl" || echo "OK: no Haiku on Anth lane"
rg -n '"lane":"anthropic".*"header_mode":' "${LOG_ROOT}/usage.jsonl" || echo "OK: no Z.AI header on Anth lane"

cp "${LOG_ROOT}/usage.jsonl" "${LOG_ROOT}/usage_go_repro_quick.jsonl" || true
echo "[quick] done; see ${RESULTS_ROOT}/METRICS_go_repro_quick.json and ${LOG_ROOT}/usage_go_repro_quick.jsonl"
cd "$ROOT"
