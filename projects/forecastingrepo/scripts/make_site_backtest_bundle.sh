#!/usr/bin/env bash
set -euo pipefail

# Make a site-level backtest bundle (CSV scoreboards + SUMMARY.md + images) and zip for coordinator

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

SERVICE_CSV=${SERVICE_CSV:-data/sites/sites_service.csv}
REGISTRY_CSV=${REGISTRY_CSV:-data/sites/sites_registry.csv}
SITES_CSV=${SITES_CSV:-}
DATE_WINDOW=${DATE_WINDOW:-}
CUTOFF=${CUTOFF:-}

if [ -z "$SITES_CSV" ]; then
  SITES_CSV=$(ls -1 reports/sites_demo/daily_fill_*.csv 2>/dev/null | head -1 || true)
fi

if [ -z "$SITES_CSV" ] || [ ! -f "$SITES_CSV" ]; then
  echo "SITES_CSV not found. Provide SITES_CSV=path/to/daily_fill_*.csv" >&2
  exit 2
fi

if [ -z "$DATE_WINDOW" ]; then
  # Parse from filename daily_fill_START_to_END.csv
  bn=$(basename "$SITES_CSV")
  part=${bn#daily_fill_}
  part=${part%.csv}
  START=${part%_to_*}
  END=${part#*_to_}
  DATE_WINDOW="$START:$END"
fi

if [ -z "$CUTOFF" ]; then
  # Set cutoff to the day before START
  START=${DATE_WINDOW%%:*}
  CUTOFF=$(python - <<PY
from datetime import datetime, timedelta
print((datetime.strptime("$START", "%Y-%m-%d")-timedelta(days=1)).date())
PY
)
fi

OUTDIR="reports/site_backtest_${CUTOFF}"
mkdir -p "$OUTDIR"

echo "Running site backtest: cutoff=$CUTOFF window=$DATE_WINDOW"
PYTHONPATH=. python scripts/backtest_sites.py \
  --train-until "$CUTOFF" \
  --daily-window "$DATE_WINDOW" \
  --monthly-window "${DATE_WINDOW%%:*}" \
  --sites-registry "$REGISTRY_CSV" \
  --sites-service "$SERVICE_CSV" \
  --use-existing-sites-csv "$SITES_CSV" \
  --outdir "$OUTDIR"

# Generate simple plots and a REPORT.md
OUTDIR="$OUTDIR" MONTHLY="$OUTDIR/scoreboard_site_monthly.csv" PYTHONPATH=. python scripts/site_backtest_report.py

# Write a tiny README
cat > "$OUTDIR/README.md" << EOF
# Site Backtest Bundle

Cutoff: $CUTOFF
Window: $DATE_WINDOW
Inputs:
- Sites CSV: $SITES_CSV
- Service CSV: $SERVICE_CSV

Outputs:
- scoreboard_site_daily.csv
- scoreboard_site_monthly.csv
- SUMMARY.md (includes Overall site WAPE and Median per-site WAPE)
- hist_sites_wape.png, top_sites_median_wape.png, worst_sites_median_wape.png
- REPORT.md (embeds images)
EOF

TS=$(date +%Y%m%d_%H%M%S)
ZIP="reviews/site_backtest_pack_${CUTOFF}_${TS}.zip"
mkdir -p reviews
zip -q -r "$ZIP" "$OUTDIR"
echo "Wrote $ZIP"

