from __future__ import annotations

from datetime import date
from typing import Iterable

import pandas as pd


FEDERAL_HOLIDAYS_2025 = {
    date(2025, 1, 1),
    date(2025, 1, 2),
    date(2025, 1, 3),
    date(2025, 1, 4),
    date(2025, 1, 5),
    date(2025, 1, 6),
    date(2025, 1, 7),
    date(2025, 1, 8),
    date(2025, 2, 23),
    date(2025, 3, 8),
    date(2025, 5, 1),
    date(2025, 5, 9),
    date(2025, 6, 12),
    date(2025, 11, 4),
}


def is_holiday(dt: date, region: str | None = None) -> bool:
    """
    Check if a date is a holiday (federal or regional).

    Regional support is a placeholder for future extensions.
    """
    _ = region
    return dt in FEDERAL_HOLIDAYS_2025


def adjust_baseline_for_holidays(
    baseline_rates: pd.DataFrame,
    forecast_dates: Iterable[date],
    multiplier: float = 1.15,
    region: str | None = None,
) -> pd.DataFrame:
    """
    Adjust weekday rates when forecast dates include holidays.
    """
    if baseline_rates.empty:
        return baseline_rates

    holiday_weekdays = {
        d.weekday() for d in forecast_dates if is_holiday(d, region=region)
    }
    if not holiday_weekdays:
        return baseline_rates

    adjusted = baseline_rates.copy()
    adjusted.loc[
        adjusted["weekday"].isin(holiday_weekdays),
        "rate_m3_per_day",
    ] = adjusted.loc[
        adjusted["weekday"].isin(holiday_weekdays),
        "rate_m3_per_day",
    ] * multiplier
    return adjusted
