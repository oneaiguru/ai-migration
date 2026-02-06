#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/parallel-subagents.sh [JOBS] [PROMPTS_FILE]
#
# Runs Haiku prompts in parallel using the subscription terminal env
# (expects HTTPS_PROXY + NODE_EXTRA_CA_CERTS already set via scripts/sub-env.sh).
# If PROMPTS_FILE is provided, each line is a prompt. Otherwise, runs a simple /status loop.

JOBS=${1:-4}
PROMPTS_FILE=${2:-}

if [[ -n "$PROMPTS_FILE" && -f "$PROMPTS_FILE" ]]; then
  # Consume prompts file with limited parallelism
  # shellcheck disable=SC2016
  xargs -P "$JOBS" -n 1 -I '{}' sh -c 'claude -p --model haiku "$@" >/dev/null || true' _ < "$PROMPTS_FILE"
else
  for j in $(seq 1 "$JOBS"); do
    (
      claude -p --model haiku "/status" --output-format json >/dev/null 2>&1 || true
    ) &
    sleep 1
  done
  wait || true
fi
