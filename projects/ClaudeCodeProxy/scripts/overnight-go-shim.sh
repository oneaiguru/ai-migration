#!/usr/bin/env bash
set -euo pipefail

# Overnight runner: keep trying until both lanes show at least one completion
# Sonnet/Anth lane completion (200) and Haiku/Z.AI completion (200), with hygiene checks.
# Uses short, timed Claude CLI calls to avoid stalls. Escalates by toggling H1 and restarting shim.

PORT=${1:-8082}
MAX_MINUTES=${MAX_MINUTES:-15}
SLEEP_BETWEEN=${SLEEP_BETWEEN:-8}
TIMEOUT_SECS=${TIMEOUT_SECS:-45}

mkdir -p logs/archive results results/overnight

timestamp() { date +%Y%m%d-%H%M%S; }

start_shim() {
  pkill -f ccp 2>/dev/null || true
  pkill -f "services/go-anth-shim/bin/ccp" 2>/dev/null || true
  local env_h1="${MITM_FORCE_H1:-}" env_mode="${ZAI_HEADER_MODE:-}"
  # Provide ZAI key from .env if not set
  if [[ -z "${ZAI_API_KEY:-}" && -f .env ]]; then
    export ZAI_API_KEY=$(grep -Ev '^[[:space:]]*#' .env | head -n1 | tr -d '\r' | xargs echo -n)
  fi
  echo "[overnight] starting shim on :$PORT (H1=${MITM_FORCE_H1:-0}, ZAI_HEADER_MODE=${ZAI_HEADER_MODE:-x-api-key})"
  ZAI_API_KEY="${ZAI_API_KEY:-}" MITM_FORCE_H1="${MITM_FORCE_H1:-}" ZAI_HEADER_MODE="${ZAI_HEADER_MODE:-}" \
    ./services/go-anth-shim/bin/ccp serve --port "$PORT" > logs/ccp.out 2>&1 &
  echo $! > logs/ccp.pid
  sleep 1
  export ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}"
  unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_AUTH_TOKEN
}

summarize() {
  node scripts/summarize-usage.js logs/usage.jsonl > results/overnight/METRICS_$(timestamp).json || true
}

have_zai_completion() {
  rg -n '"lane":"zai"[^\n]*"status":200' logs/usage.jsonl >/dev/null 2>&1
}

have_anth_completion() {
  rg -n '"lane":"anthropic"[^\n]*"status":200' logs/usage.jsonl >/dev/null 2>&1
}

call_model() {
  local model="$1"
  bash scripts/with-timeout.sh "$TIMEOUT_SECS" claude -p --model "$model" "Say ok" --output-format json >/dev/null 2>&1 || true
}

rotate_logs() {
  [[ -f logs/usage.jsonl ]] && mv logs/usage.jsonl "logs/archive/usage-$(timestamp).jsonl" || true
  : > logs/usage.jsonl
}

# Begin
make go-shim-build >/dev/null
rotate_logs
start_shim

deadline=$(( $(date +%s) + MAX_MINUTES*60 ))
zai_ok=0
anth_ok=0
attempt=0

while (( $(date +%s) < deadline )); do
  attempt=$((attempt+1))
  echo "[overnight] attempt #$attempt"
  # Always try Haiku first (fastest)
  call_model haiku
  summarize
  if have_zai_completion; then zai_ok=1; fi

  # Try Sonnet next
  call_model sonnet
  summarize
  if have_anth_completion; then anth_ok=1; fi

  # Check hygiene each loop
  if ! bash scripts/check-hygiene.sh logs/usage.jsonl; then
    echo "[overnight] hygiene failure; saving snapshot"
    cp logs/usage.jsonl "logs/overnight_hygiene_fail_$(timestamp).jsonl" || true
  fi

  if (( zai_ok==1 && anth_ok==1 )); then
    echo "[overnight] PASS: both lanes have at least one completion"
    break
  fi

  # Escalation for Sonnet stalls: toggle H1 and restart after every 3 attempts without anth_ok
  if (( anth_ok==0 && attempt % 3 == 0 )); then
    export MITM_FORCE_H1=$(( ${MITM_FORCE_H1:-0} == 1 ? 0 : 1 ))
    echo "[overnight] toggling H1 to ${MITM_FORCE_H1} and restarting shim"
    start_shim
  fi

  sleep "$SLEEP_BETWEEN"
done

# Final summarize and bundle
summarize
cp logs/usage.jsonl logs/usage_overnight_final.jsonl || true
make bundle

status=0
if (( zai_ok==0 )); then echo "[overnight] FAIL: no Z.AI completion captured"; status=1; fi
if (( anth_ok==0 )); then echo "[overnight] FAIL: no Anthropic completion captured"; status=1; fi
exit $status

