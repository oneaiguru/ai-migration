#!/usr/bin/env bash
set -euo pipefail

# Large-file guard: fails if any Python/TS/TSX file exceeds the threshold
# unless an allow marker is present.
# Usage: bash scripts/ci/check_large_files.sh [THRESHOLD]

THRESHOLD=${1:-600}
ROOT=$(cd "$(dirname "$0")/../.." && pwd)

echo "Large-file guard threshold: ${THRESHOLD} lines"

fail_list=()

check_file() {
  local f="$1"; local n
  n=$(wc -l < "$f" | tr -d ' ')
  if [ "$n" -gt "$THRESHOLD" ]; then
    case "$f" in
      *.py)
        if ! grep -q '^# allow-large-file:' "$f"; then
          fail_list+=("$f:$n")
        fi
        ;;
      *.ts|*.tsx)
        if ! grep -q '^// @allow-large-file:' "$f"; then
          fail_list+=("$f:$n")
        fi
        ;;
    esac
  fi
}

# Python (forecastingrepo)
while IFS= read -r -d '' f; do
  case "$f" in
    */.venv/*|*/.git/*|*/dist/*|*/deliveries/*|*/node_modules/*)
      continue
      ;;
  esac
  if [[ "$f" == *.py ]]; then
    check_file "$f"
  fi
done < <(find "$ROOT" -type f -name "*.py" -print0)

# UI TS/TSX (if repo present)
if [ -d "$ROOT/../ui/forecast-ui/src" ]; then
  while IFS= read -r -d '' f; do
    check_file "$f"
  done < <(find "$ROOT/../ui/forecast-ui/src" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0)
fi

if [ ${#fail_list[@]} -gt 0 ]; then
  echo "Found files exceeding ${THRESHOLD} lines without allow marker:" >&2
  for it in "${fail_list[@]}"; do echo "  - $it" >&2; done
  echo "Add an allow marker to defer: '# allow-large-file:<ticket>' or '// @allow-large-file:<ticket>'" >&2
  exit 2
fi

echo "Large-file guard OK (<= ${THRESHOLD} or allowed)."
