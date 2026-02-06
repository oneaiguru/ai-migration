#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8082}"

curl --max-time 3 -sS "http://127.0.0.1:${PORT}/healthz" || true

exit 0

