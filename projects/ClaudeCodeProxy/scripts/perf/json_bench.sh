#!/usr/bin/env bash
set -euo pipefail

# Simple JSON latency micro-bench using curl loops.
# Requires ANTHROPIC_AUTH_TOKEN and ANTHROPIC_BASE_URL set appropriately.

N=${1:-20}
BODY='{"model":"claude-3-haiku-20240307","max_tokens":8,"messages":[{"role":"user","content":"Say ok"}]}'

time (
  for i in $(seq 1 $N); do
    curl -sS -D/dev/null -o /dev/null \
      -H "content-type: application/json" \
      -H "authorization: ${AUTH_HEADER:-$([[ -n ${ANTHROPIC_AUTH_TOKEN:-} ]] && echo "Bearer ${ANTHROPIC_AUTH_TOKEN}")}" \
      "${ANTHROPIC_BASE_URL:-https://api.anthropic.com}/v1/messages" \
      --data "$BODY" >/dev/null || true
  done
)

echo "[bench] ran $N JSON requests to ${ANTHROPIC_BASE_URL:-https://api.anthropic.com}"

