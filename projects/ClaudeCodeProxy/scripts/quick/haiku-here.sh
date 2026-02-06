#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PORT="${1:-8082}"

# Point this process at the local shim
# shellcheck disable=SC1090
. "${REPO_ROOT}/scripts/go-env.sh" "$PORT"

mkdir -p "$HOME/.claude/debug"

exec claude --model "claude-haiku-4-5-20251001"
