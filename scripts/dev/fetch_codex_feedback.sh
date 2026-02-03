#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: REPO=<owner/repo> $0 <PR_NUMBER> [output_file]" 1>&2
  exit 1
}

command -v gh >/dev/null 2>&1 || { echo "gh CLI is required" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq is required" >&2; exit 1; }

PR_NUMBER="${1:-}"
[[ -n "$PR_NUMBER" ]] || usage

REPO="${REPO:-oneaiguru/ai}"
OUTFILE="${2:-codex_feedback_${PR_NUMBER}.md}"
CODEX_USER="${CODEX_USER:-chatgpt-codex-connector}"
CODEX_USER_PATTERN="${CODEX_USER_PATTERN:-}"

if [[ -z "$CODEX_USER_PATTERN" ]]; then
  escaped_user="$(printf '%s' "$CODEX_USER" | sed -e 's/[][\\.^$*+?{}|()]/\\&/g')"
  if [[ "$CODEX_USER" == *"[bot]"* ]]; then
    CODEX_USER_PATTERN="^${escaped_user}$"
  else
    CODEX_USER_PATTERN="^${escaped_user}(\\[bot\\])?$"
  fi
fi

tmp_reviews="$(mktemp)"       # inline review comments
tmp_issues="$(mktemp)"        # PR-level issue comments
tmp_summaries="$(mktemp)"     # review summaries (no inline comments)
trap 'rm -f "$tmp_reviews" "$tmp_issues" "$tmp_summaries"' EXIT

gh api "repos/${REPO}/pulls/${PR_NUMBER}/comments" --paginate \
  | jq '.[] | {user:.user, created_at, path, line, body}' \
  >"$tmp_reviews"

gh api "repos/${REPO}/issues/${PR_NUMBER}/comments" --paginate \
  | jq '.[] | {user:.user, created_at, path:null, line:null, body}' \
  >"$tmp_issues"

gh api "repos/${REPO}/pulls/${PR_NUMBER}/reviews" --paginate \
  | jq '.[] | {user:.user, created_at:(.submitted_at // .created_at // ""), path:null, line:null, body}' \
  >"$tmp_summaries"

comments="$(jq -r \
  --arg pattern "$CODEX_USER_PATTERN" \
  --arg no_path "(no path)" \
  --arg default_line "-" \
  -s '
    flatten
    | map(select(.user.login | test($pattern)))
    | sort_by(.created_at // "")
    | map(
        "## "
        + ((.path // $no_path) | tostring)
        + ":"
        + ((.line // $default_line) | tostring)
        + "\n"
        + (.body // "")
        + "\n"
      )
    | .[]
  ' "$tmp_reviews" "$tmp_issues" "$tmp_summaries")"

if [[ -z "$comments" ]]; then
  echo "No Codex comments found for PR #${PR_NUMBER} (pattern=${CODEX_USER_PATTERN})."
  rm -f "$OUTFILE"
  exit 0
fi

{
  echo "# Codex Review Feedback for PR #${PR_NUMBER}"
  echo ""
  printf "%s\n" "$comments"
} >"$OUTFILE"

echo "Saved Codex feedback to ${OUTFILE}"
cat "$OUTFILE"
