#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-oneaiguru/ai}"
CODEX_USER="${CODEX_USER:-chatgpt-codex-connector}"
CODEX_USER_PATTERN="${CODEX_USER_PATTERN:-}"
FETCH_HELPER="${FETCH_HELPER:-scripts/dev/fetch_codex_feedback.sh}"
REACT_HEADER="Accept: application/vnd.github+json"

if [[ -z "$CODEX_USER_PATTERN" ]]; then
  escaped_user="$(printf '%s' "$CODEX_USER" | sed -e 's/[][\\.^$*+?{}|()]/\\&/g')"
  if [[ "$CODEX_USER" == *"[bot]"* ]]; then
    CODEX_USER_PATTERN="^${escaped_user}$"
  else
    CODEX_USER_PATTERN="^${escaped_user}(\\[bot\\])?$"
  fi
fi

gh_available() { command -v gh >/dev/null 2>&1; }
jq_available() { command -v jq >/dev/null 2>&1; }

if ! gh_available; then
  echo "gh CLI is required for watch_codex_feedback.sh" >&2
  exit 0
fi

if ! jq_available; then
  echo "jq is required for watch_codex_feedback.sh" >&2
  exit 0
fi

prs=$(gh pr list --repo "$REPO" --state open --json number -q '.[].number' 2>/dev/null || true)
if [[ -z "$prs" ]]; then
  echo "No open PRs found; exiting." >&2
  exit 0
fi

for pr in $prs; do
  outfile="codex_feedback_${pr}.md"
  tmpfile="$(mktemp)"
  trap 'rm -f "$tmpfile"' EXIT

  if [[ -x "$FETCH_HELPER" ]]; then
    REPO="$REPO" "$FETCH_HELPER" "$pr" "$tmpfile" || true
  fi

  if [[ -s "$tmpfile" ]]; then
    mv "$tmpfile" "$outfile"
    echo "wrote $outfile from comments"
    continue
  fi

  rm -f "$tmpfile"

  reactions=$(gh api "repos/${REPO}/issues/${pr}/reactions" --paginate --header "$REACT_HEADER" \
    | jq -r --arg pattern "$CODEX_USER_PATTERN" \
      '.[] | select(.user.login | test($pattern)) | select(.content=="+1")') || true

  if [[ -n "$reactions" ]]; then
    {
      echo "# Codex Review Feedback for PR #${pr}"
      echo ""
      echo "Codex reacted with 👍 (no inline comments present)."
    } >"$outfile"
    echo "wrote $outfile from reactions"
  else
    echo "no Codex feedback for PR #${pr}; skipping"
  fi

  rm -f "$tmpfile"
done
