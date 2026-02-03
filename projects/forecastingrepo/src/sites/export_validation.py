"""
Forecast export for blind validation.

TASK-30: Generate forecasts and export as CSV for Jury's blind validation.
The format is designed to work with TASK-29's validation script.
"""
from datetime import date, timedelta
from pathlib import Path

import pandas as pd

from .rolling_forecast import generate_rolling_forecast
from .rolling_types import ForecastRequest
from .wide_report import write_wide_report


def export_forecast_for_validation(
    cutoff_date: date,
    horizon_days: int,
    output_path: Path = Path('forecast_for_validation.csv'),
    output_format: str = "wide",
    include_metadata: bool = False,
    pred_units: str = "m3",
) -> Path:
    """
    Generate forecast and export as CSV for validation.

    Used by TASK-29 blind validation protocol.

    Args:
        cutoff_date: Cutoff date (data up to this date is used for training)
        horizon_days: Number of days to forecast
        output_path: Path to write CSV output
        pred_units: Unit for pred_volume_m3 column (default: m3)

    Returns:
        Path to the output CSV file
    """
    print(f"Generating forecast: cutoff={cutoff_date}, horizon={horizon_days}...")

    request = ForecastRequest(
        cutoff_date=cutoff_date,
        horizon_days=horizon_days,
    )

    result = generate_rolling_forecast(request, use_cache=True)

    # Format for validation
    df = result.forecast_df.copy()

    if df.empty:
        export_df = pd.DataFrame(columns=["site_id", "date", "pred_m3", "forecast_m3"])
    else:
        if "pred_volume_m3" in df.columns:
            pred_m3 = pd.to_numeric(df["pred_volume_m3"], errors="coerce")
        else:
            raise RuntimeError("Forecast frame must contain 'pred_volume_m3'.")

        df["pred_m3"] = pred_m3
        df["forecast_m3"] = pred_m3
        export_df = (
            df[["site_id", "date", "pred_m3", "forecast_m3"]]
            .sort_values(by=["site_id", "date"])
            .reset_index(drop=True)
        )

    # Ensure output directory exists
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Writing to {output_path}...")
    if output_format == "wide":
        if export_df.empty or export_df["date"].isna().all():
            start = cutoff_date + timedelta(days=1)
            end = start + timedelta(days=horizon_days - 1)
        else:
            dates = pd.to_datetime(export_df["date"])
            start = dates.min().date()
            end = dates.max().date()
        write_wide_report(export_df, output_path, start, end, "forecast_m3", include_metadata)
    else:
        export_df[["site_id", "date", "pred_m3"]].to_csv(output_path, index=False)

    print(f"Exported {len(export_df)} records")
    print(f"  Sites: {export_df['site_id'].nunique() if not export_df.empty else 0}")
    print(f"  Dates: {export_df['date'].nunique() if not export_df.empty else 0}")
    print(f"  File: {output_path}")

    return output_path
