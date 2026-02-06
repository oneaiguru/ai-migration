from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable, Optional

import pandas as pd

from .data_loader import load_service_data
from .rolling_forecast import compute_accuracy_metrics, generate_rolling_forecast
from .rolling_types import ForecastRequest


def run_backtest(
    cutoff_dates: Iterable[date],
    horizon_days: int,
    sample_sites: Optional[list[str]] = None,
    use_cache: bool = True,
) -> pd.DataFrame:
    """
    Run rolling forecasts for multiple cutoffs and compare against actuals.

    Returns DataFrame with columns:
      cutoff_date, site_id, target_date, forecast_m3, actual_m3, error_pct
    """
    rows = []
    for cutoff in cutoff_dates:
        request = ForecastRequest(
            cutoff_date=cutoff,
            horizon_days=horizon_days,
            site_ids=sample_sites,
        )
        result = generate_rolling_forecast(request, use_cache=use_cache)
        if result.forecast_df.empty:
            continue

        service_df = load_service_data(
            start_date=cutoff + timedelta(days=1),
            end_date=cutoff + timedelta(days=horizon_days),
            site_ids=sample_sites,
        )
        merged, _ = compute_accuracy_metrics(
            result.forecast_df,
            service_df,
            cutoff,
            horizon_days,
        )
        if merged.empty:
            continue

        merged = merged.copy()
        merged["forecast_m3"] = merged["pred_volume_m3"].astype(float)
        merged["cutoff_date"] = cutoff
        merged = merged.rename(columns={"date": "target_date"})
        rows.append(
            merged[["cutoff_date", "site_id", "target_date", "forecast_m3", "actual_m3", "error_pct"]]
        )

    if not rows:
        return pd.DataFrame(
            columns=["cutoff_date", "site_id", "target_date", "forecast_m3", "actual_m3", "error_pct"]
        )

    return pd.concat(rows, ignore_index=True)
