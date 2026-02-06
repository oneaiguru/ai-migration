#!/usr/bin/env bash
set -euo pipefail

MODEL="glm-4-6"
REPEAT=60
TOKENS=100
SLEEP=1
PORT="${CCP_PORT_DEFAULT:-8082}"
LOG_FILE="results/GLM_LIMIT_PROBE.log"

usage() {
  cat <<'USAGE'
Usage: glm-limit-probe.sh [--model NAME] [--repeat N] [--tokens T] [--sleep SEC] [--port PORT]

Sends synthetic completions via the local shim (using /v1/dev/sim-usage) and
records rolling usage after each call. Intended to provide a reproducible harness
for GLM limit experiments; swap the POST target with a real GLM call when
available.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model) MODEL="$2"; shift 2 ;;
    --repeat) REPEAT="$2"; shift 2 ;;
    --tokens) TOKENS="$2"; shift 2 ;;
    --sleep) SLEEP="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; usage; exit 1 ;;
  esac
  done

mkdir -p "$(dirname "$LOG_FILE")"

echo "# $(date -u '+%Y-%m-%dT%H:%M:%SZ') model=$MODEL repeat=$REPEAT tokens=$TOKENS" | tee -a "$LOG_FILE"
for ((i=1; i<=REPEAT; i++)); do
  payload=$(printf '{"model":"%s","in":%d,"out":%d}' "$MODEL" "$TOKENS" "$TOKENS")
  status=$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}/v1/dev/sim-usage" \
    -H 'content-type: application/json' -d "$payload" || echo "000")
  if [[ "$status" != "200" ]]; then
    echo "[probe] request $i failed (status $status)" | tee -a "$LOG_FILE"
    break
  fi
  usage_json=$(curl -sS "http://127.0.0.1:${PORT}/v1/usage")
  headroom_json=$(echo "$usage_json" | python3 - "${MODEL}" <<'PY'
import json, sys
model = sys.argv[1]
data = json.load(sys.stdin)
models = data.get("models", {})
info = models.get(model, {})
rolling = info.get("rolling_out", 0)
cap = info.get("rolling_pct", 0.0)
warn_auto = info.get("warn_pct_auto", 0.0)
gap_p50 = info.get("gap_seconds_p50", 0.0)
gap_p95 = info.get("gap_seconds_p95", 0.0)
print(json.dumps({"rolling_out": rolling, "rolling_pct": cap,
                 "warn": info.get("warn", False),
                 "warn_pct_auto": warn_auto,
                 "gap_seconds_p50": gap_p50,
                 "gap_seconds_p95": gap_p95}))
PY
)
  echo "${i},${TOKENS},${status},${headroom_json}" | tee -a "$LOG_FILE"
  sleep "$SLEEP"
done
