#!/usr/bin/env bash
# Source this to configure a shell for dev/testing usage (mock issuer, isolated logs).

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "Usage: source scripts/env/dev.sh" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
export CCP_PROFILE=dev
export CCP_LOGS_DIR="${ROOT_DIR}/logs/dev"
export CCP_RESULTS_DIR="${ROOT_DIR}/results/dev"
export CCP_LICENSE_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/ccc"
: "${CCP_PORT_DEFAULT:=8182}"
export CCP_PORT_DEFAULT

mkdir -p "$CCP_LOGS_DIR" "$CCP_RESULTS_DIR" "$CCP_LICENSE_DIR"

echo "[env-dev] CCP_PROFILE=dev"
echo "[env-dev] Logs -> $CCP_LOGS_DIR"
echo "[env-dev] Results -> $CCP_RESULTS_DIR"
echo "[env-dev] License dir -> $CCP_LICENSE_DIR"
