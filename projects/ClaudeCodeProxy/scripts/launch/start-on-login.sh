#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PORT="${1:-8082}"

# Ensure logs dir exists for launchctl stdout/stderr
mkdir -p "${REPO_ROOT}/logs/prod"

# Start the shim (loads license if present via shim-start)
"${REPO_ROOT}/scripts/quick/shim-start.sh" "${PORT}" >/dev/null 2>&1 || true

# Health-gate: wait up to 10s then fail with diagnostic tail
ok=0
for i in {1..10}; do
  if curl -sSf "http://127.0.0.1:${PORT}/healthz" >/dev/null 2>&1; then ok=1; break; fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  echo "[startup] shim not healthy on :${PORT}" >&2
  echo "--- tail ccp.out ---" >&2
  tail -n 80 "${REPO_ROOT}/logs/prod/ccp.out" >&2 || true
  exit 1
fi

echo "[startup] shim healthy on :${PORT}" >&2
exit 0

