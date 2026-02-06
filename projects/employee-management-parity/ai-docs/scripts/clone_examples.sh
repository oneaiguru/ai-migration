#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_ROOT="$ROOT/third_party"
mkdir -p "$TARGET_ROOT"

clone_repo() {
  local name="$1"
  local url="$2"
  local dest="$TARGET_ROOT/$name"

  rm -rf "$dest"
  if ! git clone --depth=1 "$url" "$dest" >/dev/null 2>&1; then
    echo "[WARN] Failed to clone $url" >&2
    return 1
  fi
  rm -rf "$dest/.git"

  if [ -d "$dest/examples" ]; then
    find "$dest" -mindepth 1 -maxdepth 1 \
      ! -name examples \
      ! -name README.md \
      ! -name LICENSE \
      ! -name LICENSE.md \
      -exec rm -rf {} +
    echo "[OK] $name (examples retained)"
  else
    echo "[OK] $name (no examples directory; full repo kept)"
  fi
}

while IFS='|' read -r name url; do
  [[ -z "$name" ]] && continue
  [[ "$name" =~ ^# ]] && continue
  clone_repo "$name" "$url"
done <<'REPOS'
shadcn-ui|https://github.com/shadcn-ui/ui.git
radix-primitives|https://github.com/radix-ui/primitives.git
tanstack-table|https://github.com/TanStack/table.git
tanstack-virtual|https://github.com/TanStack/virtual.git
react-hook-form|https://github.com/react-hook-form/react-hook-form.git
zod|https://github.com/colinhacks/zod.git
dnd-kit|https://github.com/clauderic/dnd-kit.git
tremor|https://github.com/tremorlabs/tremor.git
recharts|https://github.com/recharts/recharts.git
minisearch|https://github.com/lucaong/minisearch.git
vaul|https://github.com/emilkowalski/vaul.git
playwright|https://github.com/microsoft/playwright.git
axe-core|https://github.com/dequelabs/axe-core.git
REPOS
