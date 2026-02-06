#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/work/sub" "$ROOT/work/zai" "$ROOT/logs" "$ROOT/results"
echo "Created: work/sub work/zai logs results"

cat <<'EONOTE'
Next steps:
- In one terminal: cd work/sub && claude (login via subscription)
- In another: export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"; \
              export ANTHROPIC_AUTH_TOKEN="$ZAI_API_KEY"; cd work/zai && claude
EONOTE
