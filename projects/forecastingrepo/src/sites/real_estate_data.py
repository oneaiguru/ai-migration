from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd


REAL_ESTATE_COLUMNS = ["date", "price_index", "volume_index"]


def load_real_estate_data(
    region: str,
    start_date: date,
    end_date: date,
    data_path: Optional[Path] = None,
) -> pd.DataFrame:
    """
    Load real estate indicator data for the specified date range.
    """
    candidates = []
    if data_path:
        candidates.append(Path(data_path))
    else:
        candidates.extend(
            [
                Path("data/real_estate") / f"{region}.csv",
                Path("data/real_estate") / f"{region.lower()}.csv",
                Path(f"data/real_estate_{region}.csv"),
            ]
        )

    file_path = next((p for p in candidates if p.exists()), None)
    if file_path is None:
        return pd.DataFrame(columns=REAL_ESTATE_COLUMNS)

    df = pd.read_csv(file_path, parse_dates=["date"])
    df["date"] = pd.to_datetime(df["date"]).dt.date
    df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]
    return df.reset_index(drop=True)


def add_real_estate_features(
    service_df: pd.DataFrame,
    real_estate_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Merge real estate features into service data on date.
    """
    if service_df.empty or real_estate_df.empty:
        return service_df

    sdf = service_df.copy()
    sdf["service_dt"] = pd.to_datetime(sdf["service_dt"]).dt.date
    rdf = real_estate_df.copy()
    rdf["date"] = pd.to_datetime(rdf["date"]).dt.date
    merged = sdf.merge(rdf, left_on="service_dt", right_on="date", how="left")
    return merged.drop(columns=["date"])
