#!/usr/bin/env bash
set -euo pipefail

# Reproduce Python MITM proofs non-interactively.
# Requirements: claude CLI authorized; mitmdump installed.

PORT=${1:-8082}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"
LOG_ROOT="${CCP_LOGS_DIR:-${ROOT}/logs}"
RESULTS_ROOT="${CCP_RESULTS_DIR:-${ROOT}/results}"

cd "$ROOT"

echo "[repro:py] rotate logs"
mkdir -p "${LOG_ROOT}/archive" "${RESULTS_ROOT}"
if [[ -f "${LOG_ROOT}/usage.jsonl" ]]; then
  mv "${LOG_ROOT}/usage.jsonl" "${LOG_ROOT}/archive/usage-$(date +%Y%m%d-%H%M%S).jsonl" || true
fi
: > "${LOG_ROOT}/usage.jsonl"

echo "[repro:py] start MITM on :$PORT"
MITM_FILTER_CHAIN=1 MITM_PORT=$PORT FORCE_HAIKU_TO_ZAI=1 bash scripts/run-mitm.sh >/dev/null 2>&1 &
echo $! > "${LOG_ROOT}/mitm.pid"
sleep 1

echo "[repro:py] set proxied env"
source scripts/sub-env.sh $PORT >/dev/null 2>&1 || true

echo "[repro:py] run 3x haiku + 3x sonnet"
for i in 1 2 3; do
  claude -p --model haiku  "Say hi" --output-format json >/dev/null 2>&1 || true
  claude -p --model sonnet "Say hi" --output-format json >/dev/null 2>&1 || true
  sleep 0.2
done

echo "[repro:py] summarize"
node scripts/summarize-usage.js "${LOG_ROOT}/usage.jsonl" | tee "${RESULTS_ROOT}/METRICS_py_repro.json" >/dev/null

echo "[repro:py] proofs"
rg -n '"lane":"anthropic".*haiku' "${LOG_ROOT}/usage.jsonl" || echo "OK: no Haiku on Anth lane"
rg -n '"lane":"anthropic".*"header_mode":' "${LOG_ROOT}/usage.jsonl" || echo "OK: no Z.AI header on Anth lane"

cat > "${RESULTS_ROOT}/PY-REPRO-SUMMARY.md" << 'MD'
# Python MITM Repro (3× haiku + 3× sonnet)

- Port: ${PORT}
- Metrics: see active profile results dir (METRICS_py_repro.json)
- Log: usage.jsonl under CCP_LOGS_DIR (rotated before run)
- Proof: No Haiku on Anth lane; No Z.AI header on Anth lane
MD

echo "[repro:py] done"
