#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

LOG_FILE="${REPO_ROOT}/logs/prod/ccp.out"

mkdir -p "$(dirname "$LOG_FILE")"

exec tail -F "$LOG_FILE"
