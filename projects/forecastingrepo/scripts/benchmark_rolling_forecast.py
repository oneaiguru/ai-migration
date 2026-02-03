#!/usr/bin/env python3
"""Benchmark rolling forecast generation times."""
import sys
from pathlib import Path
import time
from datetime import date

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest

HORIZONS = [7, 30, 90, 180, 365]
CUTOFF = date(2025, 3, 15)

def benchmark():
    print("Horizon | Sites | Time (s) | Rows")
    print("--------|-------|----------|------")

    for h in HORIZONS:
        req = ForecastRequest(cutoff_date=CUTOFF, horizon_days=h)
        t0 = time.time()
        result = generate_rolling_forecast(req, use_cache=False)
        elapsed = time.time() - t0
        rows = len(result.forecast_df)
        print(f"{h:7} | {result.site_count:5} | {elapsed:8.2f} | {rows}")

if __name__ == "__main__":
    benchmark()
