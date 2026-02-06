#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8082}"

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$PLIST_DIR/com.ccp.shim.plist"

mkdir -p "$PLIST_DIR"

cat > "$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ccp.shim</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$REPO_ROOT/scripts/launch/start-on-login.sh</string>
    <string>$PORT</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$REPO_ROOT/logs/prod/launchctl.out</string>
  <key>StandardErrorPath</key>
  <string>$REPO_ROOT/logs/prod/launchctl.err</string>
</dict>
</plist>
PLIST

# unload any existing instance
launchctl bootout "gui/$(id -u)" com.ccp.shim >/dev/null 2>&1 || true
# load new instance
launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"
launchctl enable "gui/$(id -u)/com.ccp.shim"
launchctl kickstart -k "gui/$(id -u)/com.ccp.shim"

echo "[startup] installed and started com.ccp.shim (port ${PORT})"
