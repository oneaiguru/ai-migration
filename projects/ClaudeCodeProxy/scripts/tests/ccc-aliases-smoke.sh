#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

export CCC_REPO_ROOT="$REPO_ROOT"
# shellcheck disable=SC1090
. "$REPO_ROOT/scripts/shell/ccc-aliases.sh"

port="8132"

cleanup() {
  ccc_off --quiet || true
}
trap cleanup EXIT

banner=$(ccc_on "$port")
sleep 1

if [[ "$banner" != *"[usage]"* ]]; then
  echo "expected usage banner from ccc_on" >&2
  exit 1
fi

ccc_status >/dev/null

if command -v curl >/dev/null 2>&1; then
  curl --max-time 2 -sSf "http://127.0.0.1:${port}/healthz" >/dev/null
fi

log_file="${CCP_LOGS_DIR}/usage.jsonl"
[ -f "$log_file" ]

"$REPO_ROOT/bin/cc" providers >/dev/null

ccc_off --quiet
