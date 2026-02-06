#!/usr/bin/env bash
set -euo pipefail

# Basic streaming sanity check: runs a long prompt via Claude Code.
# Assumes HTTPS_PROXY and NODE_EXTRA_CA_CERTS are exported in the shell
# where you run `claude`.

PROMPT=${1:-"Generate 200 lines of numbered text quickly."}

echo "Starting SSE check… (Ctrl+C to abort)"
timeout 60s claude -p "$PROMPT" >/dev/null
echo "SSE check completed without early termination."

