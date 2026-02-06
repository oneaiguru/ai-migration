#!/usr/bin/env bash
set -euo pipefail

# Soak/persist perf: 10k writes + rollup timings
# Usage: from repo root, run: bash scripts/perf/soak_persist.sh

cd "$(dirname "$0")/../.." || exit 1

export GOPROXY=direct
export GOSUMDB=off

echo "[soak] running 10k writes + rollup timings (SOAK=1)"
(cd services/go-anth-shim && SOAK=1 go test -run TestStoreSoak -v ./cmd/ccp 2>&1 | tee /tmp/ccp_soak_persist.log)

echo "--- Summary ---"
rg -n "insert_p95_ms|rollup_hour_ms" /tmp/ccp_soak_persist.log || true

