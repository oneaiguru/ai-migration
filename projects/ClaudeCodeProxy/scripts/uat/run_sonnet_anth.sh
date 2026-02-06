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
RESTORE=0
if [[ -n "${CC_LICENSE_JSON:-}" || -n "${CC_LICENSE_SIG:-}" || -n "${CCP_LICENSE_PUBKEY_B64:-}" ]]; then
  RESTORE=1
fi

unset CC_LICENSE_JSON CC_LICENSE_SIG CCP_LICENSE_PUBKEY_B64 ZAI_HEADER_MODE
if [[ "${VARIANT}" == "lite" ]]; then
  export CCP_SHIM_VARIANT=lite
fi
FORCE_HAIKU_TO_ZAI=0 make go-proxy >/dev/null 2>&1 || true
source scripts/go-env.sh "$PORT"

set +e
RESULT=$(FORCE_HAIKU_TO_ZAI=0 timeout "$TIMEOUT_SEC" claude -p --model haiku "Say ok" --output-format json 2>&1)
STATUS=$?
set -e
printf '%s\n' "$RESULT"

LOG_FILE="${CCP_LOGS_DIR:-logs}/usage.jsonl"
if [[ -f "$LOG_FILE" ]]; then
  echo "[anth-lane] latest Anth 200 entry:"
  rg '"lane":"anthropic".*"status":200' "$LOG_FILE" | tail -n 1
fi

if [[ $RESTORE -eq 1 && -f "$LICENSE_ENV" ]]; then
  # shellcheck disable=SC1090
  source "$LICENSE_ENV"
fi

exit $STATUS
