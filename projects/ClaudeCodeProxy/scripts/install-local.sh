#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "${BASH_SOURCE[0]%/*}"/.. && pwd)"
BIN_SRC="$ROOT_DIR/bin/cc"

echo "[install] Preparing local install for ClaudeCodeProxy helpers"

if [[ ! -f "$BIN_SRC" ]]; then
  echo "[install] Missing $BIN_SRC" >&2
  exit 1
fi

chmod +x "$BIN_SRC" || true

# Prefer ~/bin on PATH; else suggest adding repo bin to PATH
TARGET_DIR="$HOME/bin"
if [[ -d "$TARGET_DIR" ]]; then
  ln -sf "$BIN_SRC" "$TARGET_DIR/cc"
  echo "[install] Linked $TARGET_DIR/cc → $BIN_SRC"
else
  echo "[install] No ~/bin directory detected. You can either:"
  echo "  1) mkdir -p ~/bin && ln -sf $BIN_SRC ~/bin/cc && echo 'export PATH=\$HOME/bin:\$PATH' >> ~/.zshrc && source ~/.zshrc"
  echo "  2) Add this to your ~/.zshrc: export PATH=\$PATH:$ROOT_DIR/bin"
fi

cat <<'NEXT'

Next steps:
  - Start MITM: cc mitm start 8082
  - Proxied terminal: source scripts/sub-env.sh 8082
  - Open two terminals: cc two-up 8082 (tmux required)
  - Verify & bundle: cc verify && cc bundle

Safety:
  - Keep body tee OFF (use make tee-on only for diagnostics)
  - Toggle H1/H2 or ZAI header mode only if needed

Docs:
  - docs/ONE-PAGER.md (ELI16), docs/HANDOFF-DUAL-TERMINAL-PILOT.md

Install complete.
NEXT

