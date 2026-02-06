#!/bin/bash
set -euo pipefail
DASHBOARD="docs/STATUS_DASHBOARD.md"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
cp "$DASHBOARD" "${DASHBOARD}.bak" 2>/dev/null || true
BUILD_STATUS="⏳ Unknown"
if npm run -s build >/dev/null 2>&1; then
  BUILD_STATUS="✅ Passed"
else
  BUILD_STATUS="❌ Failed"
fi
if command -v gsed >/dev/null 2>&1; then SED=gsed; else SED=sed; fi
$SED -i '' "s/^Updated:.*/Updated: ${TIMESTAMP}/" "$DASHBOARD" || true
if ! grep -q '^Last build:' "$DASHBOARD"; then
  printf '\nLast build: %s (%s)\n' "$BUILD_STATUS" "$TIMESTAMP" >> "$DASHBOARD"
else
  $SED -i '' "s/^Last build:.*/Last build: ${BUILD_STATUS} (${TIMESTAMP})/" "$DASHBOARD" || true
fi
echo "✅ Status dashboard updated"
