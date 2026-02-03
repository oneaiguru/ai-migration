#!/usr/bin/env bash
set -euo pipefail

# Ensure PATH and python are available for cron
PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

# Load GitHub token for gh if present (prefer ~/.ai-coordinator-env, fallback to .env)
if [ -f "$HOME/.ai-coordinator-env" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.ai-coordinator-env"
elif [ -f "$HOME/ai/.env" ]; then
  # shellcheck source=/dev/null
  . "$HOME/ai/.env"
fi
# Export tokens if set
[ -n "${GH_TOKEN:-}" ] && export GH_TOKEN
[ -n "${GITHUB_TOKEN:-}" ] && export GITHUB_TOKEN

# Defaults; override via env or cron
ALLOWED_REPOS="${ALLOWED_REPOS:-oneaiguru/ai}"
REQUIRED_CHECKS="${REQUIRED_CHECKS:-}"
COORDINATOR_APPROVE="${COORDINATOR_APPROVE:-false}"
BRANCH_STATE_DIR="${BRANCH_STATE_DIR:-$HOME/ai}"

export ALLOWED_REPOS
export REQUIRED_CHECKS
export COORDINATOR_APPROVE
export BRANCH_STATE_DIR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
COORDINATOR_PATH="${COORDINATOR_PATH:-$SCRIPT_DIR/../coordinator.py}"

"${PYTHON_BIN}" "${COORDINATOR_PATH}"
