from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd


WEATHER_COLUMNS = [
    "date",
    "station_id",
    "temp_avg",
    "temp_min",
    "temp_max",
    "precip_mm",
    "snow_cm",
]


def load_weather_data(
    region: str,
    start_date: date,
    end_date: date,
    weather_path: Optional[Path] = None,
) -> pd.DataFrame:
    """
    Load historical weather data from a local CSV if available.

    Expected columns: date, station_id, temp_avg, temp_min, temp_max, precip_mm, snow_cm
    """
    candidates = []
    if weather_path:
        candidates.append(Path(weather_path))
    else:
        candidates.extend(
            [
                Path("data/weather") / f"{region}.csv",
                Path("data/weather") / f"{region.lower()}.csv",
                Path(f"data/weather_{region}.csv"),
            ]
        )

    data_path = next((p for p in candidates if p.exists()), None)
    if data_path is None:
        return pd.DataFrame(columns=WEATHER_COLUMNS)

    df = pd.read_csv(data_path, parse_dates=["date"])
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
    return df.reset_index(drop=True)


def add_weather_features(
    service_df: pd.DataFrame,
    weather_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Merge weather features into service data on date.
    """
    if service_df.empty or weather_df.empty:
        return service_df

    sdf = service_df.copy()
    sdf["service_dt"] = pd.to_datetime(sdf["service_dt"]).dt.date
    wdf = weather_df.copy()
    wdf["date"] = pd.to_datetime(wdf["date"]).dt.date
    merged = sdf.merge(wdf, left_on="service_dt", right_on="date", how="left")
    return merged.drop(columns=["date"])
