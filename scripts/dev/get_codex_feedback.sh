#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: OWNER_REPO=<owner/repo> $0 <PR_NUMBER>" 1>&2
  exit 1
fi

PR="$1"
OWNER_REPO="${OWNER_REPO:-oneaiguru/ai}"

gh api "repos/${OWNER_REPO}/pulls/${PR}/comments" --paginate \
  --jq '.[] | {type:"review", id, in_reply_to_id, user:.user.login, created_at, path, line, body}' \
  > /tmp/_codex_review_${PR}.jsonl

gh api "repos/${OWNER_REPO}/issues/${PR}/comments" --paginate \
  --jq '.[] | {type:"issue", id, in_reply_to_id:null, user:.user.login, created_at, path:null, line:null, body}' \
  > /tmp/_codex_issue_${PR}.jsonl

cat /tmp/_codex_review_${PR}.jsonl /tmp/_codex_issue_${PR}.jsonl 2>/dev/null \
  | jq -s '
      map(select(.user | test("chatgpt-codex-connector"))) 
      | sort_by(.created_at // "") 
      | .[]
    '

rm -f /tmp/_codex_review_${PR}.jsonl /tmp/_codex_issue_${PR}.jsonl
