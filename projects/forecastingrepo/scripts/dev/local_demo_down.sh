#!/usr/bin/env bash
set -euo pipefail
pkill -f "vite preview" >/dev/null 2>&1 || true
pkill -f "node .*vite preview" >/dev/null 2>&1 || true
pkill -f "scripts.api_app:app" >/dev/null 2>&1 || true
pkill -f uvicorn >/dev/null 2>&1 || true
echo "Local demo processes stopped."
