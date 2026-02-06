#!/usr/bin/env bash
set -euo pipefail

LOG=${1:-${CCP_LOGS_DIR:-$(pwd)/logs}/usage.jsonl}
[[ -f "$LOG" ]] || { echo "[hygiene] no log at $LOG"; exit 1; }

fail=0
if rg -n '"lane":"anthropic".*haiku' "$LOG" >/dev/null; then
  echo "[hygiene] FAIL: found Haiku on Anthropic lane"; fail=1
else
  echo "[hygiene] OK: no Haiku on Anthropic lane"
fi

if rg -n '"lane":"anthropic"[^\n]*"header_mode":"(x-api-key|authorization)"' "$LOG" >/dev/null; then
  echo "[hygiene] FAIL: found Z.AI header on Anthropic lane"; fail=1
else
  echo "[hygiene] OK: no Z.AI header on Anthropic lane"
fi

exit $fail
