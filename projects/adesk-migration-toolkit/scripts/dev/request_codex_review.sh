#!/usr/bin/env bash
set -euo pipefail

OWNER_REPO="${OWNER_REPO:-}"
if [[ -z "$OWNER_REPO" ]]; then
  OWNER_REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
fi
if [[ -z "$OWNER_REPO" ]]; then
  echo "Set OWNER_REPO=<owner/repo> or run inside a git repo with gh auth." >&2
  exit 1
fi
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# Find PR for current branch; prefer head branch lookup
PR_NUMBER="$(gh pr list -R "${OWNER_REPO}" --head "${BRANCH}" --state open --json number --jq '.[0].number // ""' 2>/dev/null || true)"
if [ -z "${PR_NUMBER}" ]; then
  # Fallback: current PR context (if gh knows it)
  PR_NUMBER="$(gh pr view --json number --jq '.number // ""' 2>/dev/null || true)"
fi

if [ -z "${PR_NUMBER}" ]; then
  echo "No open PR for branch ${BRANCH}; nothing to do." >&2
  exit 0
fi

echo "Requesting Codex review on PR #${PR_NUMBER} ..."
gh pr comment "${PR_NUMBER}" -R "${OWNER_REPO}" --body '@codex review'
