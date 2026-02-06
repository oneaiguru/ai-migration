#!/usr/bin/env bash
set -euo pipefail

# Start a Z.AI-mode Claude session (Anthropic-compatible endpoint).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export NO_PROXY=${NO_PROXY:-"127.0.0.1,localhost"}

# Load .env silently if present
if [[ -f "$ROOT/.env" ]]; then
  set +o allexport
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ROOT/.env" | sed 's/\r$//') >/dev/null 2>&1 || true
fi

if [[ -z "${ZAI_API_KEY:-}" ]]; then
  echo "ZAI_API_KEY is not set (check .env)." >&2
  exit 1
fi

export ANTHROPIC_BASE_URL=${ANTHROPIC_BASE_URL:-"https://api.z.ai/api/anthropic"}
export ANTHROPIC_AUTH_TOKEN=${ANTHROPIC_AUTH_TOKEN:-"$ZAI_API_KEY"}

cd "$ROOT/work/zai"
echo "[ZAI] Starting Claude in $(pwd) against $ANTHROPIC_BASE_URL"
exec claude "$@"
