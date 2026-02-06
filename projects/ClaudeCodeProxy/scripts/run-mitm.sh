#!/usr/bin/env bash
set -euo pipefail

# Start mitmdump with the Haiku→GLM router addon on :8080.
# Note: You still need to export HTTPS_PROXY and NODE_EXTRA_CA_CERTS in the
# environment of the Claude Code process; this script only launches the proxy.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ADDON_PATH="$REPO_ROOT/services/mitm-subagent-offload/addons/haiku_glm_router.py"
ADDON_DIR="$REPO_ROOT/services/mitm-subagent-offload/addons"

# Load .env silently if present
if [[ -f "$REPO_ROOT/.env" ]]; then
  set +o allexport
  # shellcheck disable=SC2046
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$REPO_ROOT/.env" | sed 's/\r$//') >/dev/null 2>&1 || true
  # Fallback: if file appears to contain only the key (no VAR=), read the first non-comment line
  if [[ -z "${ZAI_API_KEY:-}" ]]; then
    KEY_LINE=$(grep -Ev '^[[:space:]]*#' "$REPO_ROOT/.env" | head -n1 | tr -d '\r' | xargs echo -n)
    if [[ -n "$KEY_LINE" && "$KEY_LINE" != *"="* ]]; then
      export ZAI_API_KEY="$KEY_LINE"
    fi
  fi
fi

export NO_PROXY=${NO_PROXY:-"127.0.0.1,localhost"}
export ANTH_VERSION=${ANTH_VERSION:-"2023-06-01"}
export MITM_FORCE_H1=${MITM_FORCE_H1:-"0"}
export FORCE_HAIKU_TO_ZAI=${FORCE_HAIKU_TO_ZAI:-"0"}
export ZAI_HEADER_MODE=${ZAI_HEADER_MODE:-"x-api-key"}
export MITM_PORT=${MITM_PORT:-"8080"}

# Ensure user-local bins on PATH (where mitmdump may live)
export PATH="$HOME/Library/Python/3.12/bin:$HOME/Library/Python/3.11/bin:$HOME/Library/Python/3.10/bin:$HOME/Library/Python/3.9/bin:$HOME/.local/bin:$PATH"

if ! command -v mitmdump >/dev/null 2>&1; then
  echo "mitmdump not found. Please install mitmproxy." >&2
  exit 1
fi

if [[ ! -f "$ADDON_PATH" ]]; then
  echo "Addon not found at $ADDON_PATH" >&2
  exit 1
fi

mkdir -p "$REPO_ROOT/logs"

# Auto-pick a free port if requested port is busy
if command -v lsof >/dev/null 2>&1 && lsof -iTCP:$MITM_PORT -sTCP:LISTEN >/dev/null 2>&1; then
  for p in 8082 8083 18080; do
    if ! lsof -iTCP:$p -sTCP:LISTEN >/dev/null 2>&1; then
      export MITM_PORT=$p
      break
    fi
  done
fi

if [[ -z "${ZAI_API_KEY:-}" ]]; then
  echo "Note: ZAI_API_KEY is not set; Haiku reroute will be disabled unless MITM_DRY_RUN=1." >&2
fi

echo "Starting mitmdump on :$MITM_PORT with addon…"

# Optional: run filtered chain (clean logs + optional body tee) when MITM_FILTER_CHAIN=1
if [[ "${MITM_FILTER_CHAIN:-0}" == "1" ]]; then
  LOG_ONLY="$ADDON_DIR/log_only_messages.py"
  BODY_TEE="$ADDON_DIR/body_sample_tee.py"
  echo "MITM_FILTER_CHAIN=1 → chain: $LOG_ONLY, $BODY_TEE, $ADDON_PATH"
  exec mitmdump -s "$LOG_ONLY" -s "$BODY_TEE" -s "$ADDON_PATH" -p "$MITM_PORT"
else
  exec mitmdump -s "$ADDON_PATH" -p "$MITM_PORT"
fi
