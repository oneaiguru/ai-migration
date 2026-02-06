#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}" )/.." && pwd)"
DIST_DIR="${ROOT}/../dist"
VERSION="${1:-0.1.0}"

mkdir -p "$DIST_DIR"

# Build binary
make -C "$ROOT" go-shim-build

TAR_NAME="ccp-${VERSION}-darwin-universal.tar.gz"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/ccp"
cp "$ROOT/services/go-anth-shim/bin/ccp" "$TMP_DIR/ccp/"

pushd "$TMP_DIR" >/dev/null
  tar -czf "$DIST_DIR/$TAR_NAME" ccp
popd >/dev/null

echo "[release] wrote $DIST_DIR/$TAR_NAME"

echo "[release] update packaging/homebrew/Formula/ccp.rb with the new path and sha256 (private tap only)."
