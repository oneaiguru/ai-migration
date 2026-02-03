#!/bin/bash
# Git Push Wrapper - Per Plan Execution SOP
# Usage: ./git_push_wrapper.sh "plan-id: commit message"

set -euo pipefail

MAIN_REPO="/Users/m/ai"
cd "$MAIN_REPO"

echo "=== Git Push Wrapper - Plan Execution SOP ==="
echo

# 1. Git status check (per SOP)
echo "[1] Checking git status..."
git status --short
echo

# 2. Check if there are changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# 3. Stage changes (targeted stages preferred per SOP)
echo "[2] Staging changes..."
git add -A

# 4. Commit with plan identifier (per SOP)
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    COMMIT_MSG="Update $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "[3] Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"
echo

# 5. Push to remote (per SOP Git Flow Handoff)
echo "[4] Pushing to remote..."
git push

echo
echo "=== Done! Working tree clean ==="
