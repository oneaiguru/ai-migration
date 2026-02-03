#!/bin/bash

# Git Push Wrapper Script
# Usage: ./git_push_wrapper.sh [commit_message]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MAIN_REPO="/Users/m/ai"

# Change to main repo directory
cd "$MAIN_REPO"

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Add all changes
echo "Adding changes..."
git add -A

# Commit with provided message or default
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    COMMIT_MSG="Update $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "Committing with message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Push to remote
echo "Pushing to remote..."
git push

echo "Done!"
