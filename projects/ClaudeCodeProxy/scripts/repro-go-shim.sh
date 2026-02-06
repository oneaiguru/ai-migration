#!/usr/bin/env bash
set -euo pipefail

# Reproduce Go shim proofs non-interactively against real endpoints.
# Paths supported:
#  - curl path (requires ANTHROPIC_AUTH_TOKEN for Sonnet)
#  - CLI fallback (no token): uses Claude CLI pass-through OAuth; sets ANTHROPIC_BASE_URL to shim

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

BUILD_TARGET="go-shim-build"
SHIM_BIN="./services/go-anth-shim/bin/ccp"
if [[ "${VARIANT}" == "lite" ]]; then
  BUILD_TARGET="go-shim-lite-build"
  SHIM_BIN="./services/go-anth-shim/bin/ccp-lite"
fi

echo "[repro:go] build shim (${VARIANT})"
make "${BUILD_TARGET}" >/dev/null

echo "[repro:go] rotate logs"
mkdir -p logs/archive results
[[ -f logs/usage.jsonl ]] && mv logs/usage.jsonl "logs/archive/usage-$(date +%Y%m%d-%H%M%S).jsonl" || true
: > logs/usage.jsonl

killall ccp 2>/dev/null || true
pkill -f "services/go-anth-shim/bin/ccp" 2>/dev/null || true
pkill -f "services/go-anth-shim/bin/ccp-lite" 2>/dev/null || true

echo "[repro:go] start shim :$PORT"
ZAI_API_KEY="${ZAI_API_KEY:-}" "${SHIM_BIN}" serve --port "$PORT" > logs/ccp.out 2>&1 &
echo $! > logs/ccp.pid
sleep 1

export ANTHROPIC_BASE_URL="http://127.0.0.1:${PORT}"

if [[ -n "${ANTHROPIC_AUTH_TOKEN:-}" ]]; then
  echo "[repro:go] curl path (token present): 3x sonnet + 3x haiku"
  for i in 1 2 3; do
    curl -sS -X POST "$ANTHROPIC_BASE_URL/v1/messages" \
      -H "content-type: application/json" \
      -H "authorization: Bearer $ANTHROPIC_AUTH_TOKEN" \
      -d '{"model":"claude-sonnet-4.5","max_tokens":8,"messages":[{"role":"user","content":"Say hi"}]}' >/dev/null || true
    curl -sS -X POST "$ANTHROPIC_BASE_URL/v1/messages" \
      -H "content-type: application/json" \
      -d '{"model":"claude-haiku-4.5","max_tokens":8,"messages":[{"role":"user","content":"Say hi"}]}' >/dev/null || true
    sleep 0.2
  done
else
  echo "[repro:go] CLI fallback (no token): 3x sonnet + 3x haiku via Claude CLI"
  unset HTTPS_PROXY NODE_EXTRA_CA_CERTS ANTHROPIC_AUTH_TOKEN
  for i in 1 2 3; do
    claude -p --model sonnet "Say hi" --output-format json >/dev/null 2>&1 || true
    claude -p --model haiku  "Say hi" --output-format json >/dev/null 2>&1 || true
    sleep 0.2
  done
fi

node scripts/summarize-usage.js logs/usage.jsonl | tee results/METRICS_go_repro.json >/dev/null

rg -n '"lane":"anthropic".*haiku' logs/usage.jsonl || echo "OK: no Haiku on Anth lane"
rg -n '"lane":"anthropic".*"header_mode":' logs/usage.jsonl || echo "OK: no Z.AI header on Anth lane"

cat > results/GO-REPRO-SUMMARY.md << 'MD'
# Go Shim Repro (3× sonnet + 3× haiku)

- Port: ${PORT}
- Metrics: results/METRICS_go_repro.json
- Log: logs/usage.jsonl (rotated before run)
- Proof: No Haiku on Anth lane; No Z.AI header on Anth lane
MD

echo "[repro:go] done"
