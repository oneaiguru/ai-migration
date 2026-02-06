#!/usr/bin/env bash
set -euo pipefail

# Lint/format check for Python (ruff + black). Optional TS type-check hint.

STRICT=${STRICT:-0}

echo "[lint] ruff check"
python -m ruff --version >/dev/null 2>&1 || { echo "ruff not found (install via requirements-dev.txt)" >&2; exit 1; }
set +e
python -m ruff check .
RUFF_RC=$?
set -e
if [ "$STRICT" = "1" ] && [ $RUFF_RC -ne 0 ]; then
  echo "ruff found issues (STRICT=1)" >&2
  exit $RUFF_RC
fi

echo "[lint] black --check"
python -m black --version >/dev/null 2>&1 || { echo "black not found (install via requirements-dev.txt)" >&2; exit 1; }
set +e
python -m black --check .
BLACK_RC=$?
set -e
if [ "$STRICT" = "1" ] && [ $BLACK_RC -ne 0 ]; then
  echo "black found issues (STRICT=1)" >&2
  exit $BLACK_RC
fi

echo "[lint] large-file guard (600 lines)"
bash scripts/ci/check_large_files.sh 600

echo "[hint] UI TS type-check (optional):"
echo "  (cd ui/forecast-ui && npx tsc --noEmit)"

if [ "$STRICT" = "1" ]; then
  echo "Lint OK (STRICT)"
else
  echo "Lint run complete (advisory mode; not failing on issues)"
fi
