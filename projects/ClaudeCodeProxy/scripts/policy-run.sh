#!/usr/bin/env bash
set -euo pipefail
POLICY=${1:-ROUTING-POLICY.json}
if [[ ! -f "$POLICY" ]]; then
  echo "[policy] file not found: $POLICY" >&2
  exit 1
fi
echo "[policy] applying $POLICY"
LANE_HAIKU=$(jq -r '.rules[]|select(.when.modelContains=="haiku")|.lane' "$POLICY" 2>/dev/null || true)
if [[ "$LANE_HAIKU" == "zai" ]]; then
  export FORCE_HAIKU_TO_ZAI=0
else
  export FORCE_HAIKU_TO_ZAI=0
fi
ERRS=$(jq -r '.failover.zaiErrorsPerMin // empty' "$POLICY" 2>/dev/null || true)
echo "[policy] FORCE_HAIKU_TO_ZAI=$FORCE_HAIKU_TO_ZAI failover.zaiErrorsPerMin=${ERRS:-n/a}"

