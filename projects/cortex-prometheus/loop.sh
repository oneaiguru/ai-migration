#!/bin/bash
# Usage: ./loop.sh [plan] [max_iterations]
# Examples:
#   ./loop.sh            # Build mode, unlimited iterations
#   ./loop.sh 20         # Build mode, max 20 iterations
#   ./loop.sh plan       # Plan mode, unlimited iterations
#   ./loop.sh plan 5     # Plan mode, max 5 iterations

MODE="build"
PROMPT_FILE="PROMPT_build.md"
MAX_ITERATIONS=0

if [ "$1" = "plan" ]; then
  MODE="plan"
  PROMPT_FILE="PROMPT_plan.md"
  MAX_ITERATIONS=${2:-0}
elif [[ "$1" =~ ^[0-9]+$ ]]; then
  MAX_ITERATIONS=$1
fi

ITERATION=0
while true; do
  if [ "$MAX_ITERATIONS" -ne 0 ] && [ "$ITERATION" -ge "$MAX_ITERATIONS" ]; then
    break
  fi

  CODEX_FLAGS=${CODEX_FLAGS:---dangerously-bypass-approvals-and-sandbox -c mcp_servers.playwright.enabled=false}
  CODEX_BIN="${CODEX_BIN:-codex}"
  cat "$PROMPT_FILE" | "$CODEX_BIN" exec ${CODEX_FLAGS} --model "${CODEX_MODEL:-gpt-5.2-codex}" -

  ITERATION=$((ITERATION + 1))
done
