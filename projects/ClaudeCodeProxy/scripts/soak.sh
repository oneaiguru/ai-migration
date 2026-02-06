#!/usr/bin/env bash
set -euo pipefail

DUR_MIN=${1:-60}
END=$(( $(date +%s) + DUR_MIN*60 ))
echo "[soak] running for ${DUR_MIN}m"
i=0
while [ "$(date +%s)" -lt "$END" ]; do
  # Anthropic lane (Sonnet)
  claude -p --model sonnet "echo SOAK-$i" --output-format json >/dev/null || true
  sleep 2
  # Z.AI lane (Haiku) — run this invocation against Z.AI env
  ( ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic" \
    ANTHROPIC_AUTH_TOKEN="${ZAI_API_KEY:-}" \
    claude -p --model haiku "echo SUBAGENT-$i" --output-format json >/dev/null || true )
  sleep 3
  i=$((i+1))
done
echo "[soak] done"

