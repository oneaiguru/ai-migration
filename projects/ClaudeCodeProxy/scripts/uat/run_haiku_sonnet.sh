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
ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
cd "$ROOT_DIR"

ARGS=()
if [[ -n "${PORT:-}" ]]; then
  ARGS+=("$PORT")
fi
if [[ "${VARIANT}" == "lite" ]]; then
  ARGS+=("--lite")
fi

scripts/uat/run_haiku_zai.sh "${ARGS[@]}"
scripts/uat/run_sonnet_anth.sh "${ARGS[@]}"
