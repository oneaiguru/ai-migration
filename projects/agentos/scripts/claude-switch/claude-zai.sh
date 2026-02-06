#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${SCRIPT_DIR}/state/zai"
ENV_FILE="${SCRIPT_DIR}/.env.zai"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[claude-zai] Missing $ENV_FILE. Copy .env.zai.example and fill in your credentials." >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$ENV_FILE"

: "${ZAI_API_KEY:?ZAI_API_KEY must be set in .env.zai}"
ZAI_BASE_URL="${ZAI_BASE_URL:-https://api.z.ai/api/anthropic}"

if [[ "${ISOLATE_HOME:-0}" == "1" ]]; then
  export HOME="${STATE_DIR}/home"
  mkdir -p "$HOME"
fi

export XDG_CONFIG_HOME="${STATE_DIR}/xdg-config"
export XDG_CACHE_HOME="${STATE_DIR}/xdg-cache"
export XDG_STATE_HOME="${STATE_DIR}/xdg-state"

mkdir -p "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_STATE_HOME"

export ANTHROPIC_API_KEY="$ZAI_API_KEY"
export ANTHROPIC_BASE_URL="$ZAI_BASE_URL"

# Optional overrides - fall back to GLM models if not provided
export ANTHROPIC_DEFAULT_HAIKU_MODEL="${ZAI_DEFAULT_HAIKU_MODEL:-glm-4.6}"
export ANTHROPIC_DEFAULT_SONNET_MODEL="${ZAI_DEFAULT_SONNET_MODEL:-glm-4.6}"
export ANTHROPIC_DEFAULT_OPUS_MODEL="${ZAI_DEFAULT_OPUS_MODEL:-glm-4.6}"

exec claude "$@"
