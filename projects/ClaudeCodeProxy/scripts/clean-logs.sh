#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_ROOT="${CCP_LOGS_DIR:-${REPO_ROOT}/logs}"
ARCHIVE_DIR="${LOG_ROOT}/archive"
ts=$(date +%Y%m%d-%H%M%S)
mkdir -p "$ARCHIVE_DIR"
shopt -s nullglob
for f in "${LOG_ROOT}"/*.jsonl "${LOG_ROOT}"/body-samples.jsonl; do
  if [[ -f "$f" ]]; then
    base=$(basename "$f" .jsonl)
    mv "$f" "${ARCHIVE_DIR}/${base}-${ts}.jsonl" || true
  fi
done
printf '{}' > "${LOG_ROOT}/usage.jsonl"
echo "[logs] rotated -> ${ARCHIVE_DIR}/"
