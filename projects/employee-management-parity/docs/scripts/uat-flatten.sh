#!/usr/bin/env bash
set -euo pipefail

SRC=${1:-}
PREFIX=${2:-}
if [[ -z "$SRC" || -z "$PREFIX" ]]; then
  echo "Usage: $0 <src-folder> <MM-DD_HH-mm>" >&2
  exit 2
fi

dest="uat"
mkdir -p "$dest"

shopt -s nullglob
for f in "$SRC"/*; do
  base=$(basename "$f")
  # Keep extension
  ext="${base##*.}"
  # Map common names to friendly slugs
  case "$base" in
    UAT_PROMPT_*.txt) newname="${PREFIX}_UAT_PROMPT_3-demos.txt";;
    INDEX.txt)        newname="${PREFIX}_INDEX.txt";;
    *)                newname="${PREFIX}_${base// /_}";;
  esac
  cp -f "$f" "$dest/$newname"
  echo "copied: $f -> $dest/$newname"
done
