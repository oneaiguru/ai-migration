#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VFILE="$ROOT/VERSIONS.json"

function safe_version() {
  local cmd="$1"; shift || true
  if command -v $cmd >/dev/null 2>&1; then
    $cmd "$@" 2>/dev/null | head -n1 | tr -d '\r'
  else
    echo "not-installed"
  fi
}

export PATH="$HOME/Library/Python/3.12/bin:$HOME/Library/Python/3.11/bin:$HOME/Library/Python/3.10/bin:$HOME/Library/Python/3.9/bin:$HOME/.local/bin:$PATH"
CLAUDE_VER=$(safe_version claude --version || true)
MITMDUMP_VER=$(safe_version mitmdump --version || true)
NODE_VER=$(safe_version node --version || true)
PY_VER=$(safe_version python --version || true)

cat >"$VFILE" <<JSON
{
  "claude": "${CLAUDE_VER}",
  "mitmdump": "${MITMDUMP_VER}",
  "node": "${NODE_VER}",
  "python": "${PY_VER}"
}
JSON

echo "Wrote $VFILE"
