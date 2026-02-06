#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PORT="${1:-8082}"
LOG_DIR="${CCP_LOGS_DIR:-${REPO_ROOT}/logs}"

VARIANT="${CCP_SHIM_VARIANT:-full}"
MAKE_TARGET="go-shim-build"
SHIM_BIN="${REPO_ROOT}/services/go-anth-shim/bin/ccp"
if [[ "${VARIANT}" == "lite" ]]; then
  MAKE_TARGET="go-shim-lite-build"
  SHIM_BIN="${REPO_ROOT}/services/go-anth-shim/bin/ccp-lite"
fi
if [[ -n "${CCP_SHIM_BIN:-}" ]]; then
  SHIM_BIN="${CCP_SHIM_BIN}"
fi

# Build the shim binary if needed
make -C "${REPO_ROOT}" "${MAKE_TARGET}" >/dev/null

# Load .env for ZAI_API_KEY if present (same logic as run-mitm)
if [[ -z "${ZAI_API_KEY:-}" && -f "${REPO_ROOT}/.env" ]]; then
  RAW_KEY=$(grep -Ev '^[[:space:]]*#' "${REPO_ROOT}/.env" | head -n1 | tr -d '\r')
  if [[ -n "${RAW_KEY}" ]]; then
    if [[ "${RAW_KEY}" == *=* ]]; then
      # shellcheck disable=SC2163
      export "${RAW_KEY}"
    else
      export ZAI_API_KEY="${RAW_KEY}"
    fi
  fi
fi

if [[ -z "${ZAI_API_KEY:-}" ]]; then
  echo "[go-proxy] warning: ZAI_API_KEY not set; Haiku routing will fail" >&2
fi

mkdir -p "${LOG_DIR}"

# Stop existing shim if running
if [[ -f "${LOG_DIR}/ccp.pid" ]]; then
  if kill "$(cat "${LOG_DIR}/ccp.pid")" >/dev/null 2>&1; then
    echo "[go-proxy] stopped prior shim (pid $(cat "${LOG_DIR}/ccp.pid"))"
  fi
  rm -f "${LOG_DIR}/ccp.pid"
fi
pkill -f "services/go-anth-shim/bin/ccp" >/dev/null 2>&1 || true
pkill -f "services/go-anth-shim/bin/ccp-lite" >/dev/null 2>&1 || true

# Launch new instance
# IMPORTANT: prevent self-proxy loops — ensure the shim's upstreams are clean
unset ANTHROPIC_BASE_URL
unset HTTPS_PROXY
unset NODE_EXTRA_CA_CERTS
unset ANTHROPIC_AUTH_TOKEN
ZAI_API_KEY="${ZAI_API_KEY:-}" "${SHIM_BIN}" serve --port "${PORT}" \
  > "${LOG_DIR}/ccp.out" 2>&1 &
PID=$!
echo ${PID} > "${LOG_DIR}/ccp.pid"
echo "[go-proxy] ${VARIANT} listening on :${PORT} (pid ${PID})"
