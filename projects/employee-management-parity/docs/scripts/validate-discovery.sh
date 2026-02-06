#!/bin/bash
# Usage: ./docs/scripts/validate-discovery.sh path/to/discovery.md
set -euo pipefail

DISCOVERY_FILE=${1:-}
if [ -z "$DISCOVERY_FILE" ] || [ ! -f "$DISCOVERY_FILE" ]; then
  echo "❌ File not found: $DISCOVERY_FILE" >&2
  exit 1
fi

grep -q "^## AI-Docs References" "$DISCOVERY_FILE" || {
  echo "❌ Missing '## AI-Docs References' section" >&2
  exit 1
}

if ! grep -E "[A-Za-z0-9/_-]+\.(tsx?|md):[0-9]+" "$DISCOVERY_FILE" >/dev/null; then
  echo "⚠️  No file:line citations found" >&2
fi

echo "✅ Discovery doc validation passed"
