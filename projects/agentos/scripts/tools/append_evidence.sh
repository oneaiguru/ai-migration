#!/usr/bin/env bash
set -euo pipefail

# Append a row to Acceptance_Evidence.csv with artifact hash.
# Usage:
#   scripts/tools/append_evidence.sh \
#     --window W0-20 \
#     --capability CAP-UAT-PYTEST \
#     --runner pytest \
#     --result pass \
#     --artifacts artifacts/test_runs/TR-.../pytest.txt \
#     [--notes "uat opener"] [--test-run-id TR-...]

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
LEDGER="$ROOT_DIR/docs/Ledgers/Acceptance_Evidence.csv"

WINDOW=""; CAP=""; RUNNER=""; RESULT=""; ARTIF=""; NOTES=""; RUNID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --window) WINDOW="$2"; shift 2 ;;
    --capability) CAP="$2"; shift 2 ;;
    --runner) RUNNER="$2"; shift 2 ;;
    --result) RESULT="$2"; shift 2 ;;
    --artifacts) ARTIF="$2"; shift 2 ;;
    --notes) NOTES="$2"; shift 2 ;;
    --test-run-id) RUNID="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

if [[ -z "$WINDOW" || -z "$CAP" || -z "$RUNNER" || -z "$RESULT" || -z "$ARTIF" ]]; then
  echo "missing required arguments" >&2
  exit 2
fi

mkdir -p "$(dirname "$LEDGER")"
if [[ ! -s "$LEDGER" ]]; then
  echo "window_id,capability_id,test_run_id,runner,result,artifacts_path,artifact_hash,notes" > "$LEDGER"
fi

if [[ -z "$RUNID" ]]; then
  RUNID="TR-$(date -u +%Y%m%dT%H%M%SZ)-$RUNNER"
fi

if [[ ! -f "$ARTIF" ]]; then
  echo "artifact not found: $ARTIF" >&2
  exit 2
fi

HASH=$(shasum -a 256 "$ARTIF" | awk '{print $1}')
echo "$WINDOW,$CAP,$RUNID,$RUNNER,$RESULT,$ARTIF,$HASH,${NOTES}" >> "$LEDGER"
echo "evidence appended: $WINDOW $CAP ($RUNNER)"

