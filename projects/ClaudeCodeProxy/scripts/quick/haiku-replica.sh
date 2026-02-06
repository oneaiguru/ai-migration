#!/usr/bin/env bash
set -euo pipefail

# Start an interactive Claude session with Haiku model routed via local CCP.
# Usage: scripts/quick/haiku-replica.sh [PORT]

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

PORT="${1:-${CCP_PORT_DEFAULT:-8082}}"

# Point this process at the local shim
if [ -f "${REPO_ROOT}/scripts/go-env.sh" ]; then
  # shellcheck disable=SC1090
  . "${REPO_ROOT}/scripts/go-env.sh" "$PORT"
fi

mkdir -p "$HOME/.claude/debug"

# Optional second argument or CCC_TARGET_DIR can specify a working directory.
TARGET_DIR="${2:-${CCC_TARGET_DIR:-}}"
if [ -n "$TARGET_DIR" ]; then
  cd "$TARGET_DIR"
fi
echo "[quick] interactive Haiku in $(pwd) (port ${PORT})"
exec claude --model "claude-haiku-4-5-20251001"
