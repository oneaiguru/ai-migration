#!/usr/bin/env bash
# Source this script to point the current shell (or Claude CLI) at the Go shim.

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "Usage: source scripts/go-env.sh [port]" >&2
  exit 1
fi

DEFAULT_PORT="${CCP_PORT_DEFAULT:-8082}"
PORT="${1:-$DEFAULT_PORT}"
export ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}"
unset HTTPS_PROXY
unset NODE_EXTRA_CA_CERTS
unset ANTHROPIC_AUTH_TOKEN

echo "[go-env] profile=${CCP_PROFILE:-prod} port=${PORT}"
echo "[go-env] ANTHROPIC_BASE_URL=${ANTHROPIC_BASE_URL}"
echo "[go-env] HTTPS_PROXY, NODE_EXTRA_CA_CERTS, ANTHROPIC_AUTH_TOKEN unset"
