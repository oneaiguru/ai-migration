#!/usr/bin/env bash
set -euo pipefail

# Sync PRO materials from /Users/m/git/personal/tmp into this repo,
# unwrapping files that are fully wrapped in triple backtick fences.

SRC_ROOT="/Users/m/git/personal/tmp"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SANITIZER="$REPO_ROOT/scripts/tools/sanitize_fence.py"
REPORT="$REPO_ROOT/docs/imports/PRO_SYNC_REPORT.md"

copy_one() {
  local src="$1" dest="$2"
  local ext="${src##*.}"
  case "$ext" in
    json|js|ts|go|sh|yaml|yml|md)
      python3 "$SANITIZER" "$src" "$dest" ;;
    *)
      mkdir -p "$(dirname "$dest")" && cp -f "$src" "$dest" ;;
  esac
}

sync_tree() {
  local sub="$1" dest_base="$2"
  local src_dir="$SRC_ROOT/$sub"
  [[ -d "$src_dir" ]] || { echo "[skip] $src_dir"; return; }
  while IFS= read -r -d '' f; do
    rel="${f#$src_dir/}"
    dest="$REPO_ROOT/$dest_base/$rel"
    mkdir -p "$(dirname "$dest")"
    copy_one "$f" "$dest"
    echo "[copied] $sub/$rel -> $dest_base/$rel"
  done < <(find "$src_dir" -type f -print0 | sort -z)
}

main() {
  mkdir -p "$(dirname "$REPORT")"
  {
    echo "# PRO Sync Report ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
    echo
    echo "## Source"
    (cd "$SRC_ROOT" && find docs configs scripts -type f -print0 | xargs -0 -I{} sh -c 'printf "%6s  %s\n" "$(wc -l < "{}" 2>/dev/null || echo 0)" "{}"') || true
    echo
    echo "## Copy"
  } > "$REPORT"

  sync_tree docs docs | tee -a "$REPORT"
  sync_tree configs configs | tee -a "$REPORT"
  sync_tree scripts scripts | tee -a "$REPORT"

  echo >> "$REPORT"
  echo "## Checksums" >> "$REPORT"
  while IFS= read -r -d '' f; do
    sum=$(shasum -a 256 "$f" | awk '{print $1}')
    printf "%s  %s\n" "$sum" "${f#$REPO_ROOT/}"
  done < <(printf '%s\0' $(git ls-files docs/LICENSING docs/QUOTAS.md docs/ROUTING-POLICY.md configs/*.json scripts/dev/simulate-usage.js 2>/dev/null || true)) >> "$REPORT"

  echo "[done] See $REPORT"
}

main "$@"

