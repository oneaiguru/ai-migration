from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd


EVENT_COLUMNS = ["date", "event_name", "category", "impact_score"]


def load_events_data(
    region: str,
    start_date: date,
    end_date: date,
    events_path: Optional[Path] = None,
) -> pd.DataFrame:
    """
    Load tourism/event data for the specified date range.
    """
    candidates = []
    if events_path:
        candidates.append(Path(events_path))
    else:
        candidates.extend(
            [
                Path("data/events") / f"{region}.csv",
                Path("data/events") / f"{region.lower()}.csv",
                Path(f"data/events_{region}.csv"),
            ]
        )

    data_path = next((p for p in candidates if p.exists()), None)
    if data_path is None:
        return pd.DataFrame(columns=EVENT_COLUMNS)

    df = pd.read_csv(data_path, parse_dates=["date"])
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
    return df.reset_index(drop=True)


def add_event_features(
    service_df: pd.DataFrame,
    events_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Merge event features into service data on date.
    """
    if service_df.empty or events_df.empty:
        return service_df

    sdf = service_df.copy()
    sdf["service_dt"] = pd.to_datetime(sdf["service_dt"]).dt.date
    edf = events_df.copy()
    edf["date"] = pd.to_datetime(edf["date"]).dt.date
    merged = sdf.merge(edf, left_on="service_dt", right_on="date", how="left")
    return merged.drop(columns=["date"])
