#!/usr/bin/env bash
set -euo pipefail

OUT_ROOT="$(cd "$(dirname "$0")/.." && pwd)/reference/docs"
DATE="$(date '+%Y-%m-%d')"
UA="Mozilla/5.0 (MigrationPrep)"

fetch_doc() {
  local library="$1"
  local slug="$2"
  local url="$3"
  local mode="${4:-gfm}"
  local out_dir="$OUT_ROOT/$library"
  local out_file="$out_dir/$slug.md"

  mkdir -p "$out_dir"

  local tmp_in tmp_conv format
  tmp_in="$(mktemp)"
  tmp_conv="$(mktemp)"

  if ! curl -fsSL -H "User-Agent: $UA" "$url" -o "$tmp_in"; then
    echo "[WARN] Failed to fetch $url" >&2
    rm -f "$tmp_in" "$tmp_conv"
    return 1
  fi

  format="$mode"

  case "$mode" in
    raw)
      format="markdown"
      cp "$tmp_in" "$tmp_conv"
      ;;
    html)
      format="html"
      cp "$tmp_in" "$tmp_conv"
      ;;
    markdown)
      if ! pandoc -f html -t markdown --strip-comments --wrap=none "$tmp_in" -o "$tmp_conv" 2>/dev/null; then
        format="html"
        cp "$tmp_in" "$tmp_conv"
      fi
      ;;
    gfm|*)
      if ! pandoc -f html -t gfm --strip-comments --wrap=none "$tmp_in" -o "$tmp_conv" 2>/dev/null; then
        if pandoc -f html -t markdown --strip-comments --wrap=none "$tmp_in" -o "$tmp_conv" 2>/dev/null; then
          format="markdown"
        else
          format="html"
          cp "$tmp_in" "$tmp_conv"
        fi
      fi
      ;;
  esac

  {
    printf '%s\n' '---'
    printf 'source: %s\n' "$url"
    printf 'date_fetched: %s\n' "$DATE"
    printf 'format: %s\n' "$format"
    printf '%s\n' '---'
    printf '\n'
    cat "$tmp_conv"
  } > "$out_file"

  rm -f "$tmp_in" "$tmp_conv"
  echo "[OK] $library/$slug ($format)"
}

while IFS='|' read -r library slug url mode; do
  [[ -z "$library" ]] && continue
  [[ "$library" =~ ^# ]] && continue
  fetch_doc "$library" "$slug" "$url" "$mode" || true
done <<'DOCS'
shadcn|introduction|https://ui.shadcn.com/docs|
shadcn|components-index|https://ui.shadcn.com/docs/components|
shadcn|dialog|https://ui.shadcn.com/docs/components/dialog|
shadcn|sheet|https://ui.shadcn.com/docs/components/sheet|
shadcn|popover|https://ui.shadcn.com/docs/components/popover|
shadcn|tabs|https://ui.shadcn.com/docs/components/tabs|
radix|overview|https://www.radix-ui.com/primitives/docs/overview/introduction|
radix|accessibility|https://www.radix-ui.com/primitives/docs/overview/accessibility|
radix|dialog|https://www.radix-ui.com/primitives/docs/components/dialog|
radix|popover|https://www.radix-ui.com/primitives/docs/components/popover|
radix|tabs|https://www.radix-ui.com/primitives/docs/components/tabs|
tanstack-table|introduction|https://tanstack.com/table/v8/docs/introduction|
tanstack-table|react-getting-started|https://tanstack.com/table/v8/docs/framework/react/react-table|
tanstack-table|virtualization|https://tanstack.com/table/v8/docs/guide/virtualization|
tanstack-table|row-selection|https://tanstack.com/table/v8/docs/framework/react/examples/row-selection|
tanstack-table|column-pinning|https://tanstack.com/table/v8/docs/framework/react/examples/column-pinning|
tanstack-table|api-reference|https://tanstack.com/table/v8/docs/api/core/table|
tanstack-virtual|introduction|https://tanstack.com/virtual/latest/docs/introduction|
tanstack-virtual|react-guide|https://tanstack.com/virtual/latest/docs/framework/react/react-virtual|
tanstack-virtual|table-example|https://tanstack.com/virtual/latest/docs/framework/react/examples/table|
react-hook-form|get-started|https://react-hook-form.com/get-started|html
react-hook-form|docs|https://react-hook-form.com/docs|
react-hook-form|useform|https://react-hook-form.com/docs/useform|
react-hook-form|register|https://react-hook-form.com/docs/useform/register|
react-hook-form|validation|https://react-hook-form.com/get-started#Applyvalidation|
react-hook-form|typescript|https://react-hook-form.com/ts|
zod|main|https://zod.dev/|
zod|basic-usage|https://zod.dev/?id=basic-usage|
zod|primitives|https://zod.dev/?id=primitives|
zod|refinements|https://zod.dev/?id=refine|
zod|error-handling|https://zod.dev/?id=error-handling|
hookform-resolvers|zod|https://github.com/react-hook-form/resolvers#zod|
dnd-kit|overview|https://docs.dndkit.com/|
dnd-kit|sortable|https://docs.dndkit.com/presets/sortable|
dnd-kit|sortable-context|https://docs.dndkit.com/presets/sortable/sortable-context|
dnd-kit|usesortable|https://docs.dndkit.com/presets/sortable/usesortable|
dnd-kit|sensors|https://docs.dndkit.com/api-documentation/sensors|
dnd-kit|accessibility|https://docs.dndkit.com/guides/accessibility|
tremor|readme|https://raw.githubusercontent.com/tremorlabs/tremor/main/README.md|raw
recharts|readme|https://raw.githubusercontent.com/recharts/recharts/master/README.md|raw
minisearch|readme|https://raw.githubusercontent.com/lucaong/minisearch/master/README.md|raw
vaul|main|https://vaul.emilkowal.ski/|
vaul|get-started|https://vaul.emilkowal.ski/#getting-started|
vaul|api|https://vaul.emilkowal.ski/#api-reference|
playwright|intro|https://playwright.dev/docs/intro|
playwright|a11y|https://playwright.dev/docs/accessibility-testing|
playwright|api|https://playwright.dev/docs/api/class-playwright|
axe-core|repo|https://github.com/dequelabs/axe-core|
axe-core|api|https://github.com/dequelabs/axe-core/blob/develop/doc/API.md|
axe-core|rules|https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md|
axe-playwright|readme|https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md|
DOCS
