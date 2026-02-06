#!/usr/bin/env bash
# Source this to configure a shell for production usage (real license, primary logs).

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "Usage: source scripts/env/prod.sh" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export CCP_PROFILE=prod
export CCP_LOGS_DIR="${ROOT_DIR}/logs/prod"
export CCP_RESULTS_DIR="${ROOT_DIR}/results/prod"
export CCP_LICENSE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ccp"
: "${CCP_PORT_DEFAULT:=8082}"
export CCP_PORT_DEFAULT

mkdir -p "$CCP_LOGS_DIR" "$CCP_RESULTS_DIR" "$CCP_LICENSE_DIR"

echo "[env-prod] CCP_PROFILE=prod"
echo "[env-prod] Logs -> $CCP_LOGS_DIR"
echo "[env-prod] Results -> $CCP_RESULTS_DIR"
echo "[env-prod] License dir -> $CCP_LICENSE_DIR"
