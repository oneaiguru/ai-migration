#!/usr/bin/env bash
# Usage: source scripts/sub-env.sh [PORT]
# Sets subscription terminal env for Claude Code via local MITM.
PORT=${1:-${MITM_PORT:-8082}}
export HTTPS_PROXY="http://127.0.0.1:${PORT}"
export NODE_EXTRA_CA_CERTS="${NODE_EXTRA_CA_CERTS:-$HOME/.mitmproxy/mitmproxy-ca-cert.pem}"
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN 2>/dev/null || true
echo "[sub-env] HTTPS_PROXY=$HTTPS_PROXY"
echo "[sub-env] NODE_EXTRA_CA_CERTS=$NODE_EXTRA_CA_CERTS"
echo "[sub-env] unset ANTHROPIC_* done"

