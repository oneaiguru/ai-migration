#!/usr/bin/env bash
set -euo pipefail

# Alternating Sonnet/Haiku under model-only routing (FORCE_HAIKU_TO_ZAI=1).
# Does not restart MITM; assumes it's running on $MITM_PORT or default 8082.

CYCLES=${1:-240}
SLEEP=${SLEEP_BETWEEN:-2}
PORT=${MITM_PORT:-8082}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"

cd "$ROOT"

export HTTPS_PROXY="http://127.0.0.1:$PORT"
export NODE_EXTRA_CA_CERTS="${NODE_EXTRA_CA_CERTS:-$HOME/.mitmproxy/mitmproxy-ca-cert.pem}"
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN || true

echo "[model-only] cycles=$CYCLES port=$PORT"
for i in $(seq 1 "$CYCLES"); do
  timeout 20s claude -p --model sonnet "/status" --output-format json >/dev/null 2>&1 || true
  sleep "$SLEEP"
  timeout 20s claude -p --model haiku "/status" --output-format json >/dev/null 2>&1 || true
  sleep "$SLEEP"
  if (( i % 20 == 0 )); then
    LOG_ROOT="${CCP_LOGS_DIR:-${ROOT}/logs}"
    RESULTS_ROOT="${CCP_RESULTS_DIR:-${ROOT}/results}"
    node "$(dirname "$0")/summarize-usage.js" "${LOG_ROOT}/usage.jsonl" > "${RESULTS_ROOT}/METRICS.json" || true
    echo "[model-only] progress $i/$CYCLES"
  fi
done
echo "[model-only] done"
