#!/usr/bin/env bash
set -euo pipefail

# One-shot bootstrap: install aliases, load license (if present or create one),
# start the proxy on 8082 with HTTP/1 for Z.ai, verify both lanes, and print log proof.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
PORT="${1:-8082}"

cd "$REPO_ROOT"

# 1) Install aliases (idempotent) and load them into this shell
"$REPO_ROOT/scripts/install-shell-aliases.sh" >/dev/null 2>&1 || true
# shellcheck disable=SC1090
. "$REPO_ROOT/scripts/shell/ccc-aliases.sh" 2>/dev/null || true

# 2) Ensure dev license exists and is exported
LIC_ENV="$REPO_ROOT/logs/dev-license/exports.sh"
if [ ! -f "$LIC_ENV" ]; then
  "$REPO_ROOT/scripts/dev/dev-license-activate.sh"
fi
# shellcheck disable=SC1090
. "$LIC_ENV"

# 3) Start proxy on $PORT and require health
"$REPO_ROOT/scripts/quick/shim-start.sh" "$PORT" >/dev/null 2>&1 || true

ok=0
for i in 1 2 3 4 5; do
  if curl -sSf "http://127.0.0.1:${PORT}/healthz" >/dev/null 2>&1; then ok=1; break; fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  echo "[bootstrap] shim not healthy on :${PORT}" >&2
  echo "--- tail ccp.out ---" >&2
  tail -n 80 "$REPO_ROOT/logs/prod/ccp.out" >&2 || true
  exit 1
fi

# 4) Point this process at the proxy and probe both lanes
# shellcheck disable=SC1090
. "$REPO_ROOT/scripts/go-env.sh" "$PORT"

timeout 30 env ANTHROPIC_BASE_URL="$ANTHROPIC_BASE_URL" claude -p --model "claude-haiku-4-5-20251001" "ok" --output-format json >/dev/null 2>&1 || true
timeout 30 env ANTHROPIC_BASE_URL="$ANTHROPIC_BASE_URL" claude -p --model "claude-sonnet-4-5-20250929" "ok" --output-format json >/dev/null 2>&1 || true

# 5) Print log proof (last few entries for each model)
LOG_FILE="$REPO_ROOT/logs/prod/usage.jsonl"
echo "--- PROOF: Haiku + Sonnet (last entries) ---"
if command -v rg >/dev/null 2>&1; then
  rg -n '"model":"claude-haiku-4-5-20251001"|"model":"claude-sonnet-4-5-20250929"' "$LOG_FILE" | tail -n 8
else
  grep -n '"model":"claude-haiku-4-5-20251001"\|"model":"claude-sonnet-4-5-20250929"' "$LOG_FILE" | tail -n 8
fi
echo "--- /healthz: $(curl -sS "http://127.0.0.1:${PORT}/healthz" || true) ---"

exit 0
