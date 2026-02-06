#!/usr/bin/env bash
set -euo pipefail

if [ -z "${BACKPRESSURE_COMMANDS:-}" ]; then
  cat <<'EOF' >&2
BACKPRESSURE_COMMANDS is not set.

Set it to newline-separated commands, for example:
BACKPRESSURE_COMMANDS=$'pnpm run typecheck\npnpm run lint\npnpm run test'
EOF
  exit 1
fi

while IFS= read -r command; do
  if [ -z "$command" ]; then
    continue
  fi
  echo "[backpressure] $command" >&2
  bash -lc "$command"
done <<<"${BACKPRESSURE_COMMANDS}"
