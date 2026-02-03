#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${SCRIPT_DIR}/state/sub"

if [[ "${ISOLATE_HOME:-0}" == "1" ]]; then
  export HOME="${STATE_DIR}/home"
  mkdir -p "$HOME"
fi

export XDG_CONFIG_HOME="${STATE_DIR}/xdg-config"
export XDG_CACHE_HOME="${STATE_DIR}/xdg-cache"
export XDG_STATE_HOME="${STATE_DIR}/xdg-state"

mkdir -p "$XDG_CONFIG_HOME" "$XDG_CACHE_HOME" "$XDG_STATE_HOME"

# Ensure we are using subscription (OAuth) mode by removing API auth in this shell.
unset ANTHROPIC_API_KEY
unset ANTHROPIC_BASE_URL
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_DEFAULT_HAIKU_MODEL
unset ANTHROPIC_DEFAULT_SONNET_MODEL
unset ANTHROPIC_DEFAULT_OPUS_MODEL

exec claude "$@"
