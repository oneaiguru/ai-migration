#!/usr/bin/env bash
set -euo pipefail

PREFIX=${1:-}
shift || true
if [[ -z "$PREFIX" ]]; then
  echo "Usage: $0 <MM-DD_HH-mm> [attachments...]" >&2
  exit 2
fi

SRC_DIR="uat"
DEST_DIR="$HOME/Desktop/UAT_${PREFIX}"
mkdir -p "$DEST_DIR"

# Copy flat prompt + index matching prefix
shopt -s nullglob
for f in "$SRC_DIR"/${PREFIX}_*; do
  cp -f "$f" "$DEST_DIR/" && echo "copied: $f"
done

# Copy any additional attachments supplied as args
for att in "$@"; do
  if [[ -f "$att" ]]; then
    cp -f "$att" "$DEST_DIR/" && echo "attached: $att"
  else
    echo "warn: attachment not found: $att" >&2
  fi
done

echo "UAT package prepared at: $DEST_DIR"
