#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOTICES="$ROOT_DIR/docs/LEGAL/THIRD_PARTY_NOTICES.md"
SERVICES_DIR="$ROOT_DIR/services/go-anth-shim"

if [[ ! -f "$NOTICES" ]]; then
  echo "[check-licenses] missing docs/LEGAL/THIRD_PARTY_NOTICES.md" >&2
  exit 1
fi

missing=0
while IFS= read -r line; do
  module=${line%% *}
  version=${line#* }
  if [[ -z "$module" || "$module" == github.com/local/ccp-shim ]]; then
    continue
  fi
  if ! grep -q "$module" "$NOTICES"; then
    echo "[check-licenses] $module not documented" >&2
    missing=1
  fi
  if ! grep -q "$version" "$NOTICES"; then
    echo "[check-licenses] version $version for $module not documented" >&2
    missing=1
  fi
  if grep -qi 'gpl' "$NOTICES" && grep -q "$module" "$NOTICES"; then
    continue
  fi
  if echo "$module" | grep -qi 'gpl'; then
    echo "[check-licenses] refusing GPL module: $module" >&2
    missing=1
  fi
done < <(cd "$SERVICES_DIR" && go list -m all | tail -n +2)

if [[ $missing -ne 0 ]]; then
  exit 1
fi

echo "[check-licenses] ok"
