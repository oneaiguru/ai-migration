#!/usr/bin/env bash
set -euo pipefail

# Start a subscription-mode Claude session (no API key set).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export NO_PROXY=${NO_PROXY:-"127.0.0.1,localhost"}

# Load .env silently if present (not required, but harmless)
if [[ -f "$ROOT/.env" ]]; then
  set +o allexport
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ROOT/.env" | sed 's/\r$//') >/dev/null 2>&1 || true
fi

cd "$ROOT/work/sub"
echo "[SUB] Starting Claude in $(pwd). Login may be required on first run."
exec claude "$@"
