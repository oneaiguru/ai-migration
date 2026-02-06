#!/usr/bin/env bash
set -euo pipefail

BURSTS=${1:-20}
for i in $(seq 1 "$BURSTS"); do
  claude -p --model sonnet "echo BURST-A-$i" --output-format json >/dev/null || true
  ( ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic" \
    ANTHROPIC_AUTH_TOKEN="${ZAI_API_KEY:-}" \
    claude -p --model haiku  "echo BURST-B-$i" --output-format json >/dev/null || true )
  sleep 1
done

