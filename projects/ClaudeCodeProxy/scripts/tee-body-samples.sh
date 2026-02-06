#!/usr/bin/env bash
set -euo pipefail
CMD=${1:-start}
TEE_FLAG_FILE="logs/.tee-on"
mkdir -p logs
if [[ "${ENABLE_BODY_TEE:-0}" != "1" ]]; then
  echo "[tee] not enabled (set ENABLE_BODY_TEE=1)"; exit 0
fi
if [[ "$CMD" == "start" ]]; then
  touch "$TEE_FLAG_FILE"
  echo "[tee] body sampling ON -> logs/body-samples.jsonl"
else
  rm -f "$TEE_FLAG_FILE"
  echo "[tee] body sampling OFF"
fi

