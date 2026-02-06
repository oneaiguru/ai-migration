#!/usr/bin/env bash
set -euo pipefail

PLIST_PATH="$HOME/Library/LaunchAgents/com.ccp.shim.plist"

launchctl bootout "gui/$(id -u)" com.ccp.shim >/dev/null 2>&1 || true
rm -f "$PLIST_PATH"

echo "[startup] disabled com.ccp.shim"

