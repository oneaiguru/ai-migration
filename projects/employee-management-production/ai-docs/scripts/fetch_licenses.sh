#!/usr/bin/env bash
set -euo pipefail
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/reference/licenses"
mkdir -p "$OUT_DIR"

while IFS='|' read -r name url; do
  [[ -z "$name" ]] && continue
  [[ "$name" =~ ^# ]] && continue
  if curl -fsSL "$url" -o "$OUT_DIR/$name.LICENSE"; then
    echo "[OK] $name"
  else
    echo "[WARN] Failed $name" >&2
  fi
done <<'LICENSES'
shadcn|https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md
radix|https://raw.githubusercontent.com/radix-ui/primitives/main/LICENSE
tanstack-table|https://raw.githubusercontent.com/TanStack/table/main/LICENSE
tanstack-virtual|https://raw.githubusercontent.com/TanStack/virtual/main/LICENSE
react-hook-form|https://raw.githubusercontent.com/react-hook-form/react-hook-form/master/LICENSE
hookform-resolvers|https://raw.githubusercontent.com/react-hook-form/resolvers/master/LICENSE
zod|https://raw.githubusercontent.com/colinhacks/zod/master/LICENSE
dnd-kit|https://raw.githubusercontent.com/clauderic/dnd-kit/master/LICENSE
tremor|https://raw.githubusercontent.com/tremorlabs/tremor/main/LICENSE
recharts|https://raw.githubusercontent.com/recharts/recharts/master/LICENSE
minisearch|https://raw.githubusercontent.com/lucaong/minisearch/master/LICENSE.txt
vaul|https://raw.githubusercontent.com/emilkowalski/vaul/main/LICENSE.md
playwright|https://raw.githubusercontent.com/microsoft/playwright/main/LICENSE
axe-core|https://raw.githubusercontent.com/dequelabs/axe-core/develop/LICENSE
LICENSES
