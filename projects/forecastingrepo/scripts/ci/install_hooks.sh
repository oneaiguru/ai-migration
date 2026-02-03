#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/../.." && pwd)

echo "Configuring git to use repo hooks..."
git config core.hooksPath .githooks
chmod +x "$ROOT_DIR/.githooks"/*
echo "Hooks installed. Pre-commit will warn at 500 lines and block at 600 (unless allowed)."

