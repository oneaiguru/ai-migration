#!/usr/bin/env bash
set -euo pipefail

# Unified push helper:
# - First push: sets upstream, creates PR against main (title defaults to branch), posts @codex review.
# - Later pushes: just pushes and re-requests @codex review.
# - Blocks pushing to main.

OWNER_REPO="${OWNER_REPO:-oneaiguru/ai}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$BRANCH" == "main" ]]; then
  echo "ERROR: Refusing to push directly to main. Create a feature/import branch." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI is required for PR lookup/creation." >&2
  exit 1
fi

# Push (set upstream if needed), bypassing any git alias.
if ! git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  echo "Setting upstream for $BRANCH ..."
  command git push -u origin "$BRANCH" "$@"
else
  command git push "$@"
fi

# Find existing PR (open).
PR_NUMBER="$(gh pr list -R "${OWNER_REPO}" --head "${BRANCH}" --state open --json number --jq '.[0].number // ""' 2>/dev/null || true)"

# If none, ensure no closed/merged PR exists, then create one.
if [[ -z "$PR_NUMBER" ]]; then
  PR_STATE="$(gh pr list -R "${OWNER_REPO}" --head "${BRANCH}" --state all --limit 1 --json number,state --jq '.[0].state // ""' 2>/dev/null || true)"
  PR_LAST_NUMBER="$(gh pr list -R "${OWNER_REPO}" --head "${BRANCH}" --state all --limit 1 --json number --jq '.[0].number // ""' 2>/dev/null || true)"
  if [[ "$PR_STATE" == "CLOSED" || "$PR_STATE" == "MERGED" ]]; then
    echo "ERROR: Branch $BRANCH already has a $PR_STATE PR #$PR_LAST_NUMBER. Reopen it or use a new branch." >&2
    exit 1
  fi

  echo "No open PR found for $BRANCH. Creating one..."
  PR_TITLE="${PR_TITLE_OVERRIDE:-$BRANCH}"
  PR_BODY="${PR_BODY_OVERRIDE:-$'## Summary\n- Fill in a short summary\n\n## Deferred Issues\n- None yet'}"

  if ! PR_URL="$(gh pr create -R "${OWNER_REPO}" --base main --head "${BRANCH}" --title "${PR_TITLE}" --body "${PR_BODY}")"; then
    echo "ERROR: Failed to create PR for $BRANCH." >&2
    exit 1
  fi
  echo "Created PR: ${PR_URL}"
  PR_NUMBER="$(gh pr list -R "${OWNER_REPO}" --head "${BRANCH}" --state open --json number --jq '.[0].number // ""' 2>/dev/null || true)"
fi

if [[ -z "$PR_NUMBER" ]]; then
  echo "ERROR: Could not determine PR number for $BRANCH after push." >&2
  exit 1
fi

echo "Requesting Codex review on PR #${PR_NUMBER} ..."
gh pr comment "${PR_NUMBER}" -R "${OWNER_REPO}" --body '@codex review'

# Optional: schedule Codex feedback fetch after push/@codex review.
# Enable with CODEX_FETCH_AFTER_PUSH=1; defaults to 600s delay (override with CODEX_FETCH_DELAY).
if [[ "${CODEX_FETCH_AFTER_PUSH:-}" == "1" || "${CODEX_FETCH_AFTER_PUSH:-}" == "true" ]]; then
  repo="${REPO:-$OWNER_REPO}"
  if command -v gh >/dev/null 2>&1; then
    repo="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "$repo")"
  fi
  pr_number="${PR_NUMBER}"
  delay="${CODEX_FETCH_DELAY:-600}"

  if [[ -n "$pr_number" ]]; then
    (
      sleep "$delay"
      repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
      cd "$repo_root" || exit 0
      helper="scripts/dev/fetch_codex_feedback.sh"
      [[ -x "$helper" ]] || helper="scripts/dev/get_codex_feedback.sh"
      outfile="codex_feedback_${pr_number}.md"
      logdir="$repo_root/logs"
      mkdir -p "$logdir"
      logfile="$logdir/codex_fetch_after_push.log"
      ts() { date '+%Y-%m-%dT%H:%M:%S%z'; }
      if [[ -f "$outfile" ]]; then
        echo "[skip] $(ts) PR=$pr_number reason=feedback_exists" >>"$logfile"
        exit 0
      fi
      if [[ ! -x "$helper" ]]; then
        echo "[skip] $(ts) PR=$pr_number reason=missing_helper helper=$helper" >>"$logfile"
        exit 0
      fi
      echo "[start] $(ts) PR=$pr_number delay=$delay helper=$helper" >>"$logfile"
      REPO="$repo" "$helper" "$pr_number" >>"$logfile" 2>&1
      echo "[done] $(ts) PR=$pr_number helper=$helper" >>"$logfile"
    ) >/dev/null 2>&1 &
    disown || true
  fi
fi

echo "Done. PR #${PR_NUMBER} updated and Codex review requested."
