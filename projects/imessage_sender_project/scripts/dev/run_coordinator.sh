#!/usr/bin/env bash
set -euo pipefail

# Ensure PATH and python are available for cron
PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
ENV_FILE="${COORDINATOR_ENV_FILE:-$REPO_ROOT/.env}"

# Load GitHub token for gh if present (prefer ~/.ai-coordinator-env, fallback to .env)
if [ -f "$HOME/.ai-coordinator-env" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.ai-coordinator-env"
elif [ -f "$ENV_FILE" ]; then
  # shellcheck source=/dev/null
  . "$ENV_FILE"
fi
# Export tokens if set
[ -n "${GH_TOKEN:-}" ] && export GH_TOKEN
[ -n "${GITHUB_TOKEN:-}" ] && export GITHUB_TOKEN

# Defaults; override via env or cron
ALLOWED_REPOS="${ALLOWED_REPOS:-}"
REQUIRED_CHECKS="${REQUIRED_CHECKS:-}"
COORDINATOR_APPROVE="${COORDINATOR_APPROVE:-false}"
BRANCH_STATE_DIR="${BRANCH_STATE_DIR:-$REPO_ROOT}"

if [ -z "$ALLOWED_REPOS" ] && command -v gh >/dev/null 2>&1; then
  ALLOWED_REPOS="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi

if [ -z "$ALLOWED_REPOS" ]; then
  echo "Set ALLOWED_REPOS=owner/repo (comma-separated) or run inside a repo with gh auth." >&2
  exit 1
fi

export ALLOWED_REPOS
export REQUIRED_CHECKS
export COORDINATOR_APPROVE
export BRANCH_STATE_DIR

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
COORDINATOR_PATH="${COORDINATOR_PATH:-$SCRIPT_DIR/../coordinator.py}"

if [ ! -f "$COORDINATOR_PATH" ]; then
  echo "Coordinator not found at $COORDINATOR_PATH. Set COORDINATOR_PATH to your coordinator script." >&2
  exit 1
fi

"${PYTHON_BIN}" "${COORDINATOR_PATH}"
