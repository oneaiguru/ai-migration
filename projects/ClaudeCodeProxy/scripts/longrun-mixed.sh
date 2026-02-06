#!/usr/bin/env bash
set -euo pipefail

# Alternating long-run using the subscription CLI via MITM, producing
# balanced Anthropic (Sonnet) and Z.AI (Haiku, forced routing) traffic.
#
# Usage: scripts/longrun-mixed.sh <cycles>
# Each cycle runs: 1 Sonnet (/status) → toggle FORCE_HAIKU_TO_ZAI=1 → 1 Haiku (/status) → toggle back.
#
# Requires mitmdump on PATH and ~/.mitmproxy CA installed.

CYCLES=${1:-120}
PORT=${MITM_PORT:-8082}

start_mitm() {
  local force="$1"
  if [[ -f logs/mitm.pid ]]; then
    local pid; pid=$(cat logs/mitm.pid || true)
    [[ -n "${pid:-}" ]] && kill "$pid" 2>/dev/null || true
    rm -f logs/mitm.pid
    sleep 1
  fi
  FORCE_HAIKU_TO_ZAI="$force" MITM_PORT=$PORT bash "$(dirname "$0")/run-mitm.sh" >/dev/null 2>&1 &
  sleep 1
  pgrep -f "mitmdump.*-p $PORT" | head -n1 > logs/mitm.pid || true
}

export HTTPS_PROXY="http://127.0.0.1:$PORT"
export NODE_EXTRA_CA_CERTS="${NODE_EXTRA_CA_CERTS:-$HOME/.mitmproxy/mitmproxy-ca-cert.pem}"
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN || true

echo "[mixed] starting on :$PORT for $CYCLES cycles"
start_mitm 0
for i in $(seq 1 "$CYCLES"); do
  # Anthropic (Sonnet)
  timeout 20s claude -p --model sonnet "/status" --output-format json >/dev/null 2>&1 || true
  sleep 1
  # Z.AI (Haiku, forced)
  start_mitm 1
  timeout 20s claude -p --model haiku "/status" --output-format json >/dev/null 2>&1 || true
  sleep 1
  start_mitm 0
  if (( i % 10 == 0 )); then
    node "$(dirname "$0")/summarize-usage.js" logs/usage.jsonl > results/METRICS.json || true
    echo "[mixed] progress: $i/$CYCLES cycles"
  fi
done
echo "[mixed] done"

