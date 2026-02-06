#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PORT="${1:-8082}"

# shellcheck disable=SC1090
. "${REPO_ROOT}/scripts/go-env.sh" "$PORT"

timeout 30 env ANTHROPIC_BASE_URL="$ANTHROPIC_BASE_URL" claude -p --model "claude-haiku-4-5-20251001" "ok" --output-format json

