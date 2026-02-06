#!/usr/bin/env bash
set -euo pipefail

# List git worktrees and optionally prune those whose branches are already merged
# into origin/main and are clean. Run from the repo root.
#
# Usage:
#   scripts/dev/cleanup_worktrees.sh          # list status
#   scripts/dev/cleanup_worktrees.sh --prune  # remove merged & clean worktrees
#
# Notes:
# - Skips the primary worktree (the repo root).
# - Does not touch dirty worktrees or branches that are not merged.
# - If you keep a worktree for a follow-up PR, leave it and rerun later.

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

PRUNE=false
if [[ "${1-}" == "--prune" ]]; then
  PRUNE=true
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repo" >&2
  exit 1
fi

printf "%-50s %-35s %-7s %-6s\n" "Path" "Branch" "Merged" "Dirty"
printf "%-50s %-35s %-7s %-6s\n" "----" "------" "------" "-----"

# Parse git worktree list --porcelain
primary_path="$(git worktree list --porcelain | awk '/^worktree /{print $2; exit}')"
mapfile -t entries < <(git worktree list --porcelain)

remove_paths=()
for ((i=0; i<${#entries[@]}; i++)); do
  line="${entries[$i]}"
  if [[ "$line" =~ ^worktree\ (.*) ]]; then
    path="${BASH_REMATCH[1]}"
    branch=""
    locked="no"
    # next lines may include "branch" and "HEAD"
    for ((j=i+1; j<${#entries[@]}; j++)); do
      next="${entries[$j]}"
      # Stop when we reach the next worktree header (single space per porcelain format)
      [[ "$next" =~ ^worktree[[:space:]] ]] && break
      if [[ "$next" =~ ^branch\ (.*) ]]; then
        branch="${BASH_REMATCH[1]#refs/heads/}"
      fi
      if [[ "$next" =~ ^locked ]]; then
        locked="yes"
      fi
    done

    # Skip primary worktree
    if [[ "$path" == "$primary_path" ]]; then
      continue
    fi

    # Determine merged status
    merged="-"
    if [[ -n "$branch" ]]; then
      merged="no"
      if git merge-base --is-ancestor "$branch" origin/main >/dev/null 2>&1; then
        merged="yes"
      fi
    else
      # Detached worktree: treat as merged if HEAD is ancestor of origin/main
      if git -C "$path" merge-base --is-ancestor HEAD origin/main >/dev/null 2>&1; then
        merged="yes"
      else
        merged="no"
      fi
    fi

    # Determine dirty status
    dirty="no"
    if [[ -n "$(git -C "$path" status --porcelain)" ]]; then
      dirty="yes"
    fi

    printf "%-50s %-35s %-7s %-6s\n" "$path" "$branch" "$merged" "$dirty"

    if $PRUNE && [[ "$merged" == "yes" && "$dirty" == "no" && "$locked" == "no" ]]; then
      remove_paths+=("$path")
    fi
  fi
done

if $PRUNE && [[ ${#remove_paths[@]} -gt 0 ]]; then
  echo
  echo "Removing merged & clean worktrees:"
  for p in "${remove_paths[@]}"; do
    echo " - $p"
    git worktree remove --force "$p"
  done
  git worktree prune
fi
