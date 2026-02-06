#!/bin/bash
set -euo pipefail
echo "🔍 AI-Docs cleanup (dry-run by default)"
DRY=1
if [[ "${1:-}" == "--apply" ]]; then DRY=0; fi

actions=()

# Consolidate URL lists suggestions
if [[ -f ai-docs/migration_urls_latest.md && -f ai-docs/corrected_urls.md ]]; then
  actions+=("Merge migration_urls_latest.md into corrected_urls.md and delete migration_urls_latest.md")
fi
if [[ -f ai-docs/corrected_urls2.md ]]; then
  actions+=("Delete duplicate corrected_urls2.md")
fi

# Wrapper drafts divergence report
echo "\nWrapper drafts divergence report:"
shopt -s globstar nullglob
for draft in ai-docs/wrappers-draft/**/*.tsx; do
  prod="src/wrappers/${draft#*wrappers-draft/}"
  name=$(basename "$draft")
  if [[ -f "$prod" ]]; then
    diff_lines=$(diff <(head -20 "$draft") <(head -20 "$prod") | wc -l | tr -d ' ')
    if [[ ${diff_lines:-0} -lt 5 ]]; then
      echo "  $name: NEARLY IDENTICAL → consider delete draft"
    elif [[ ${diff_lines:-0} -lt 20 ]]; then
      echo "  $name: SIMILAR → consider freeze snapshot"
    else
      echo "  $name: DIVERGED → review manually"
    fi
  else
    echo "  $name: NO PRODUCTION; keep draft"
  fi
done

echo "\nPlanned actions:"
for a in "${actions[@]}"; do echo "- $a"; done

if [[ $DRY -eq 0 ]]; then
  if [[ -f ai-docs/migration_urls_latest.md && -f ai-docs/corrected_urls.md ]]; then
    {
      echo "# URL Corrections Master List";
      echo "Last updated: $(date +%Y-%m-%d)";
      echo;
      cat ai-docs/corrected_urls.md;
      echo;
      cat ai-docs/migration_urls_latest.md;
    } > ai-docs/corrected_urls.md.tmp
    mv ai-docs/corrected_urls.md.tmp ai-docs/corrected_urls.md
    rm -f ai-docs/migration_urls_latest.md
  fi
  rm -f ai-docs/corrected_urls2.md || true
  echo "✅ Applied cleanup"
else
  echo "(dry-run) Use --apply to make changes"
fi
