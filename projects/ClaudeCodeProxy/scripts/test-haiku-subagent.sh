#!/usr/bin/env bash
set -euo pipefail

# Attempts a few ways to trigger the local agent named "haiku-subagent"
# and captures body samples + usage lines for metadata inspection.

PORT=${MITM_PORT:-8082}
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"
LOG_ROOT="${CCP_LOGS_DIR:-${ROOT}/logs}"

cd "$ROOT"
export HTTPS_PROXY="http://127.0.0.1:$PORT"
export NODE_EXTRA_CA_CERTS="${NODE_EXTRA_CA_CERTS:-$HOME/.mitmproxy/mitmproxy-ca-cert.pem}"
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN || true

TARGET_FILE=${1:-/Users/m/git/tools/ClaudeCodeProxy/CLAUDE.md}

echo "[subagent-test] target: $TARGET_FILE"

# Ensure tee is on and mitm chain is running
ENABLE_BODY_TEE=1 bash "$(dirname "$0")/tee-body-samples.sh" start || true

run() {
  local name="$1"; shift
  echo "[subagent-test] $name"
  timeout 30s claude -p "$@" >/dev/null 2>&1 || true
}

run "slash-agent" "/agent haiku-subagent: read first 8 lines of $TARGET_FILE and summarize in one sentence"
run "delegate-phrase" "Use agent haiku-subagent to read first 8 lines of $TARGET_FILE and summarize in one sentence"
run "explicit-haiku-model" "Use the Haiku agent to read $TARGET_FILE (first 8 lines)"

echo "[subagent-test] usage tail:"; tail -n 8 "${LOG_ROOT}/usage.jsonl" || true
echo "[subagent-test] sample tail:"; tail -n 2 "${LOG_ROOT}/body-samples.jsonl" || true

echo "[subagent-test] metadata scan:"; rg -n "\"subagent\"|\"role\":\s*\"subagent\"|\"metadata\"\s*:\s*\{" "${LOG_ROOT}/body-samples.jsonl" || true

ENABLE_BODY_TEE=0 bash "$(dirname "$0")/tee-body-samples.sh" stop || true

echo "[subagent-test] done"
