#!/usr/bin/env bash
set -euo pipefail

# Emits JSONL: {path,size,hash,date,author}
# Skips common junk and files > 2MB to keep review lean.

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

tmpfile=$(mktemp)

# List tracked files; skip junk
git ls-files -z | tr '\0' '\n' | rg -v '^(.DS_Store|node_modules/|logs/|results/|\.env$)' > "$tmpfile"

while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  if [[ -f "$path" ]]; then
    size=$(stat -f%z "$path" 2>/dev/null || echo 0)
    if [[ "$size" -gt 2097152 ]]; then
      # Skip >2MB
      echo "{\"path\":\"$path\",\"size\":$size,\"skipped\":\"large\"}"
      continue
    fi
    hash=$(git log -1 --pretty=format:%H -- "$path" 2>/dev/null || echo null)
    date=$(git log -1 --date=iso-strict --pretty=format:%ad -- "$path" 2>/dev/null || echo null)
    author=$(git log -1 --pretty=format:%an -- "$path" 2>/dev/null || echo null)
    echo "{\"path\":\"$path\",\"size\":$size,\"hash\":\"$hash\",\"date\":\"$date\",\"author\":\"$author\"}"
  fi
done < "$tmpfile"

rm -f "$tmpfile"

