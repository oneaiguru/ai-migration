#!/usr/bin/env bash
set -euo pipefail

DEST=${DEST:-$HOME/reviews}
mkdir -p "$DEST"
ROOT=$(cd "$(dirname "$0")/../.." && pwd)

cd "$ROOT"

# 1) Core Pipeline
TMP1=$(mktemp -d)
rsync -aR src/sites/*.py scripts/ingest_and_forecast.py "$TMP1/"
(cd "$TMP1" && zip -q -r "$DEST/pipeline_bundle.zip" .)

# 2) API Layer
TMP2=$(mktemp -d)
rsync -aR scripts/api_app.py tests/api/*.py "$TMP2/"
(cd "$TMP2" && zip -q -r "$DEST/api_bundle.zip" .)

# 3) Backtesting & Metrics
TMP3=$(mktemp -d)
rsync -aR scripts/backtest_eval.py scripts/backtest_sites.py tests/backtest/*.py "$TMP3/"
(cd "$TMP3" && zip -q -r "$DEST/eval_bundle.zip" .)

# 4) Config & Schema
TMP4=$(mktemp -d)
rsync -aR scenarios/*.yml specs/overview/*.md docs/data/*.md "$TMP4/"
(cd "$TMP4" && zip -q -r "$DEST/config_bundle.zip" .)

# Rest code bundle (optional)
TMP5=$(mktemp -d)
rsync -aR \
  scripts/routes_recommend.py \
  scripts/quicklook_report.py \
  scripts/weather_join_local.py \
  scripts/eval/*.py \
  scripts/bootstrap*.sh \
  scripts/make_eval_bundle.sh \
  scripts/__init__.py \
  scripts/dev/* \
  scripts/health/* \
  src/plugins/** \
  src/__init__.py \
  tests/routes/*.py \
  tests/scripts/*.py \
  tests/sites/*.py \
  tests/viz/*.py \
  tests/unit/*.py \
  requirements*.txt \
  "$TMP5/" 2>/dev/null || true
(cd "$TMP5" && zip -q -r "$DEST/rest_code_bundle.zip" .)

echo "Bundles written to: $DEST"
