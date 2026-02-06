#!/usr/bin/env bash
# Helper to codesign and verify macOS artifacts. Requires Developer ID cert.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <artifact>" >&2
  exit 1
fi

ARTIFACT="$1"
CODESIGN_ID="${CODESIGN_ID:?CODESIGN_ID env var required}"

if [[ ! -f "$ARTIFACT" ]]; then
  echo "[sign-macos] file not found: $ARTIFACT" >&2
  exit 1
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

# Sign the binary inside the tarball if necessary
if [[ "$ARTIFACT" == *.tar.gz ]]; then
  tar -xzf "$ARTIFACT" -C "$TMPDIR"
  if [[ -f "$TMPDIR"/ccp/ccp ]]; then
    BIN="$TMPDIR/ccp/ccp"
    codesign --options runtime --timestamp --sign "$CODESIGN_ID" "$BIN"
    codesign --verify --verbose "$BIN"
    tar -czf "$ARTIFACT" -C "$TMPDIR" ccp
  else
    echo "[sign-macos] warning: expected ccp/ccp inside tarball" >&2
  fi
else
  codesign --options runtime --timestamp --sign "$CODESIGN_ID" "$ARTIFACT"
  codesign --verify --verbose "$ARTIFACT"
fi

echo "[sign-macos] signed $ARTIFACT"
