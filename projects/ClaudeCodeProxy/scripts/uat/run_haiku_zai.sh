#!/usr/bin/env bash
set -euo pipefail

PORT=8082
VARIANT="full"
PORT_SET=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --lite)
      VARIANT="lite"
      shift
      ;;
    *)
      if [[ $PORT_SET -eq 0 ]]; then
        PORT="$1"
        PORT_SET=1
        shift
      else
        echo "usage: $0 [port] [--lite]" >&2
        exit 1
      fi
      ;;
  esac
done
TIMEOUT_SEC=${TIMEOUT:-60}
ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT_DIR"

mkdir -p "$HOME/.claude/debug"

LICENSE_ENV="logs/dev-license/exports.sh"
if [[ ! -f "$LICENSE_ENV" ]]; then
  echo "[haiku-zai] provisioning local license"
  scripts/dev/dev-license-activate.sh
fi
# shellcheck disable=SC1090
source "$LICENSE_ENV"

if [[ "${VARIANT}" == "lite" ]]; then
  export CCP_SHIM_VARIANT=lite
fi

make go-proxy
source scripts/go-env.sh "$PORT"

echo "[haiku-zai] firing Haiku probe"
timeout "$TIMEOUT_SEC" claude -p --model haiku "Say ok" --output-format json

LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"
if [[ -f "$LOG_FILE" ]]; then
  echo "[haiku-zai] latest Z.ai entry:"
  rg '"lane":"zai"' "$LOG_FILE" | tail -n 1
fi
