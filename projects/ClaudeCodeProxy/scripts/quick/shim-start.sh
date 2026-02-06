#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PORT="${1:-8082}"

# Prefer HTTP/1.1 for Z.ai stability
export MITM_FORCE_H1=${MITM_FORCE_H1:-1}

# Write logs under logs/prod
export CCP_LOGS_DIR="${REPO_ROOT}/logs/prod"

cd "$REPO_ROOT"

# Prevent self-proxy loop: ensure shim upstreams are defaults (no client envs)
unset ANTHROPIC_BASE_URL
unset HTTPS_PROXY
unset NODE_EXTRA_CA_CERTS
unset ANTHROPIC_AUTH_TOKEN

# Load dev license exports if present (enables Haiku→Z.ai)
LIC_ENV="$REPO_ROOT/logs/dev-license/exports.sh"
if [ -f "$LIC_ENV" ]; then
  # shellcheck disable=SC1090
  . "$LIC_ENV"
fi

bash "${REPO_ROOT}/scripts/run-go-shim.sh" "$PORT"
