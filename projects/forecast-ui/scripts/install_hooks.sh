#!/usr/bin/env bash
set -euo pipefail

echo "Configuring git to use repo hooks for UI..."
git config core.hooksPath .githooks
chmod +x .githooks/*
echo "UI hooks installed. Pre-commit warns at 350 and blocks at 500 unless allowed."

