#!/bin/bash
set -euo pipefail
echo "🔍 Running documentation health checks..."

echo "Checking for absolute paths..."
if grep -R "/Users/m/" docs/ | grep -v ".git" | grep -v "health-check.sh"; then
  echo "⚠️  Found absolute paths - see above"
else
  echo "✅ No absolute paths found"
fi

echo "Checking for stale docs (>60 days old)..."
find docs/ -name "*.md" -mtime +60 | grep -v Archive | grep -v Workspace || echo "✅ No stale docs over 60 days"

echo "✅ Health check complete"
