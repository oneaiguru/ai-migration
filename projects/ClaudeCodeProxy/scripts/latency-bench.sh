#!/usr/bin/env bash
set -euo pipefail

LANE=${1:-sonnet} # sonnet|haiku
N=${2:-10}
echo "[bench] lane=$LANE n=$N"
for i in $(seq 1 "$N"); do
  if [[ "$LANE" == "haiku" ]]; then
    ( ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic" \
      ANTHROPIC_AUTH_TOKEN="${ZAI_API_KEY:-}" \
      claude -p --model haiku "echo BENCH-$i" --output-format json >/dev/null || true )
  else
    claude -p --model sonnet "echo BENCH-$i" --output-format json >/dev/null || true
  fi
  sleep 1
done
echo "[bench] done"

