#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d_%H%M)"
ROOT="$(pwd)"
DEST="${HOME}/Downloads/eval_bundle_${TS}"
ZIP="${DEST}.zip"

echo "[i] Creating ${DEST}"
mkdir -p "${DEST}"

# Include code & docs (filtered)
rsync -a \
  --exclude '.git' \
  --exclude '__pycache__' \
  --exclude '.pytest_cache' \
  --exclude '.coverage' \
  --exclude 'coverage.xml' \
  --exclude 'deliveries/' \
  --exclude 'delivery/' \
  --exclude 'forecasts/' \
  --exclude 'data/raw/' \
  --exclude '*.xlsx' \
  --exclude 'spec_registry/spec_index.yml' \
  scripts/ src/ specs/ tests/ .tools/ .github/ docs/ scenarios/ requirements*.txt README.md AGENTS.md \
  "${DEST}/"

# Include evaluation data & reports (only)
mkdir -p "${DEST}/data/eval" "${DEST}/reports"
if [ -d "data/eval" ]; then
  rsync -a "data/eval/" "${DEST}/data/eval/"
fi
for R in reports/backtest_* reports/backtest_consolidated_*; do
  if [ -d "$R" ]; then
    mkdir -p "${DEST}/${R}"
    rsync -a "${R}/" "${DEST}/${R}/"
  fi
done

# Manifest
pushd "${DEST}" >/dev/null
{
  echo "Eval Bundle — MANIFEST"
  echo "Created: ${TS}"
  echo -n "HEAD SHA: "
  git -C "${ROOT}" rev-parse HEAD 2>/dev/null || echo "n/a"
  echo
  echo "Included files (subset):"
  find . -maxdepth 4 -type f | sed 's#^\./##' | sort
  echo
  echo "Excluded patterns:"
  cat <<'PATTERNS'
.git/, __pycache__/, .pytest_cache/, .coverage, coverage.xml,
deliveries/, delivery/, forecasts/, data/raw/**, *.xlsx, spec_registry/spec_index.yml,
secrets (.env, ~/.cdsapirc)
PATTERNS
} > MANIFEST.txt
popd >/dev/null

echo "[i] Zipping → ${ZIP}"
(cd "${DEST}/.." && zip -qr "$(basename "${ZIP}")" "$(basename "${DEST}")")
echo "[OK] ${ZIP}"

