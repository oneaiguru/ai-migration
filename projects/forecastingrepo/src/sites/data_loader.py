"""
Data loader for rolling-cutoff forecast demo.

Loads service history and registry data with optional date/site filtering.
"""
from __future__ import annotations

import logging
import os
from datetime import date
from pathlib import Path
from typing import Optional

import pandas as pd

from .rolling_types import ServiceDataBundle


SERVICE_ENV_PATH = os.getenv("SITES_SERVICE_PATH")
REGISTRY_ENV_PATH = os.getenv("SITES_REGISTRY_PATH")

DEFAULT_SERVICE_PATH = Path(SERVICE_ENV_PATH or "data/sites_service.csv")
DEFAULT_REGISTRY_PATH = Path(REGISTRY_ENV_PATH or "data/sites_registry.csv")

SERVICE_FALLBACK_PATHS = [
    Path("data/sites/sites_service.csv"),
    Path("data/demo_sites_service.csv"),
    Path("demo_data/sites_service_demo.csv"),
]
REGISTRY_FALLBACK_PATHS = [
    Path("data/sites/sites_registry.csv"),
    Path("data/demo_sites_registry.csv"),
    Path("demo_data/sites_registry_demo.csv"),
]

logger = logging.getLogger(__name__)


def _resolve_default_path(path: Path, fallback_paths: list[Path], env_var: str) -> Path:
    if path.exists():
        return path
    for fallback in fallback_paths:
        if fallback.exists():
            logger.warning("Default %s not found at %s; using %s", env_var, path, fallback)
            return fallback
    logger.warning(
        "Default %s not found at %s; set %s or provide demo data.",
        env_var,
        path,
        env_var,
    )
    return path


def _resolve_service_path(service_path: Path) -> Path:
    if service_path != DEFAULT_SERVICE_PATH:
        return service_path
    if SERVICE_ENV_PATH and not service_path.exists():
        logger.warning("SITES_SERVICE_PATH points to missing file: %s", service_path)
        return service_path
    return _resolve_default_path(service_path, SERVICE_FALLBACK_PATHS, "SITES_SERVICE_PATH")


def _resolve_registry_path(registry_path: Path) -> Path:
    if registry_path != DEFAULT_REGISTRY_PATH:
        return registry_path
    if REGISTRY_ENV_PATH and not registry_path.exists():
        logger.warning("SITES_REGISTRY_PATH points to missing file: %s", registry_path)
        return registry_path
    return _resolve_default_path(registry_path, REGISTRY_FALLBACK_PATHS, "SITES_REGISTRY_PATH")


def _empty_service_df() -> pd.DataFrame:
    return pd.DataFrame(columns=["site_id", "service_dt", "collect_volume_m3"])


def _empty_registry_df() -> pd.DataFrame:
    return pd.DataFrame(columns=["site_id", "district", "bin_count", "bin_size_liters"])




def _build_registry_from_service(
    service_df: pd.DataFrame,
    site_ids: Optional[list[str]],
) -> pd.DataFrame:
    if "site_id" not in service_df.columns:
        return _empty_registry_df()
    site_series = service_df["site_id"].dropna().astype(str)
    if site_ids is not None:
        site_set = set(str(s) for s in site_ids)
        site_series = site_series[site_series.isin(site_set)]
    unique_sites = sorted(site_series.unique())
    if not unique_sites:
        return _empty_registry_df()
    return pd.DataFrame(
        {
            "site_id": unique_sites,
            "district": ["Unknown"] * len(unique_sites),
            "address": pd.NA,
            "bin_count": 1,
            "bin_size_liters": 1100.0,
        }
    )


def load_service_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    site_ids: Optional[list[str]] = None,
    service_path: Path = DEFAULT_SERVICE_PATH,
) -> pd.DataFrame:
    """
    Load service history with optional date and site filtering.

    Returns DataFrame with columns: site_id, service_dt (as date), collect_volume_m3 (as float)
    """
    service_path = _resolve_service_path(service_path)
    if service_path.exists():
        df = pd.read_csv(
            service_path,
            dtype={"site_id": str},
            parse_dates=["service_dt"],
            usecols=[0, 1, 2],  # Take only first 3 columns (2025 export has extra metadata)
            on_bad_lines="warn",  # Allow rows with extra columns
        )

        # Convert datetime to date
        df["service_dt"] = df["service_dt"].dt.date

        # Normalize volume column from the third position
        df = df.rename(columns={df.columns[2]: "collect_volume_m3"})
        df["collect_volume_m3"] = pd.to_numeric(df["collect_volume_m3"], errors="coerce").astype(float)
    else:
        df = _empty_service_df()
        if df.empty:
            return _empty_service_df()

    # Filter by date range
    if start_date is not None:
        df = df[df["service_dt"] >= start_date]
    if end_date is not None:
        df = df[df["service_dt"] <= end_date]

    # Filter by site IDs
    if site_ids is not None:
        site_set = set(str(s) for s in site_ids)
        df = df[df["site_id"].isin(site_set)]

    return df.reset_index(drop=True)


def load_registry(
    site_ids: Optional[list[str]] = None,
    registry_path: Path = DEFAULT_REGISTRY_PATH,
) -> pd.DataFrame:
    """
    Load site registry with optional site filtering.

    Returns DataFrame with columns: site_id, district, address, bin_count, bin_size_liters
    """
    registry_path = _resolve_registry_path(registry_path)
    if not registry_path.exists():
        return _empty_registry_df()

    df = pd.read_csv(
        registry_path,
        dtype={"site_id": str, "district": str},
    )

    # Ensure required columns exist with defaults
    if "bin_count" not in df.columns:
        df["bin_count"] = 1
    if "bin_size_liters" not in df.columns:
        df["bin_size_liters"] = 1100.0

    # Fill missing values with defaults
    df["bin_count"] = df["bin_count"].fillna(1).astype(int)
    df["bin_size_liters"] = df["bin_size_liters"].fillna(1100.0).astype(float)

    # Select only needed columns (if others exist)
    cols = ["site_id", "district", "address", "bin_count", "bin_size_liters"]
    available_cols = [c for c in cols if c in df.columns]
    df = df[available_cols]

    # Filter by site IDs
    if site_ids is not None:
        site_set = set(str(s) for s in site_ids)
        df = df[df["site_id"].isin(site_set)]

    return df.reset_index(drop=True)


def load_data_bundle(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    site_ids: Optional[list[str]] = None,
    service_path: Path = DEFAULT_SERVICE_PATH,
    registry_path: Path = DEFAULT_REGISTRY_PATH,
) -> ServiceDataBundle:
    """
    Load both service and registry data, returning a typed bundle.
    """
    service_df = load_service_data(
        start_date=start_date,
        end_date=end_date,
        site_ids=site_ids,
        service_path=service_path,
    )

    # Get site IDs from service data for registry filtering
    if site_ids is None and not service_df.empty:
        registry_site_ids = service_df["site_id"].unique().tolist()
    else:
        registry_site_ids = site_ids

    registry_df = load_registry(
        site_ids=registry_site_ids,
        registry_path=registry_path,
    )
    if registry_df.empty and not service_df.empty:
        registry_df = _build_registry_from_service(service_df, registry_site_ids)

    # Compute date range
    if service_df.empty:
        date_range = (date.min, date.min)
    else:
        date_range = (
            service_df["service_dt"].min(),
            service_df["service_dt"].max(),
        )

    # Count unique sites
    site_count = service_df["site_id"].nunique() if not service_df.empty else 0

    return ServiceDataBundle(
        service_df=service_df,
        registry_df=registry_df,
        date_range=date_range,
        site_count=site_count,
    )
