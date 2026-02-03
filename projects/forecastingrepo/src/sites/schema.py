"""
Site-level schema and lightweight validation helpers.

This module is intentionally pandas-optional in interfaces; the ingest script
can use pandas for convenience, but core validation is simple Python.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Iterable, Optional, Tuple
try:
    from pydantic import BaseModel  # type: ignore
except Exception:  # pragma: no cover - pydantic available in tests
    BaseModel = object  # type: ignore


@dataclass(frozen=True)
class SiteRegistryRow:
    site_id: str
    district: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    bin_count: Optional[int] = None
    bin_size_liters: Optional[float] = None
    bin_type: Optional[str] = None
    land_use: Optional[str] = None


@dataclass(frozen=True)
class SiteServiceRow:
    site_id: str
    service_dt: date
    service_time: Optional[str] = None
    emptied_flag: Optional[bool] = None
    collect_volume_m3: Optional[float] = None
    district: Optional[str] = None


def ensure_unique_keys(rows: Iterable[SiteServiceRow]) -> None:
    """Raise ValueError if (site_id, service_dt, service_time) duplicates exist."""
    seen: set[Tuple[str, date, Optional[str]]] = set()
    for r in rows:
        key = (r.site_id, r.service_dt, r.service_time)
        if key in seen:
            raise ValueError(f"Duplicate service key: {key}")
        seen.add(key)


def ensure_nonnegative_volume(rows: Iterable[SiteServiceRow]) -> None:
    for r in rows:
        if r.collect_volume_m3 is not None and r.collect_volume_m3 < 0:
            raise ValueError("Negative collect_volume_m3 not allowed")


def coerce_date(obj) -> date:
    if isinstance(obj, date) and not isinstance(obj, datetime):
        return obj
    if isinstance(obj, datetime):
        return obj.date()
    if isinstance(obj, str):
        s = obj.strip()
        # Try ISO YYYY-MM-DD
        try:
            return datetime.strptime(s, "%Y-%m-%d").date()
        except Exception:
            pass
        # Try RU/EU dd.mm.yyyy
        try:
            return datetime.strptime(s, "%d.%m.%Y").date()
        except Exception:
            pass
        # Try dd/mm/yyyy
        try:
            return datetime.strptime(s, "%d/%m/%Y").date()
        except Exception:
            pass
        # Try yyyy/mm/dd
        try:
            return datetime.strptime(s, "%Y/%m/%d").date()
        except Exception as e:
            raise ValueError(f"Invalid date string: {obj}") from e
    raise TypeError(f"Unsupported date value: {obj!r}")


# ----- API models (read-only endpoints) -----
class SiteForecastPoint(BaseModel):
    date: str
    pred_volume_m3: Optional[float] = None
    fill_pct: Optional[float] = None
    overflow_prob: Optional[float] = None
    last_service_dt: Optional[str] = None


class RouteStopForecast(BaseModel):
    site_id: str
    address: Optional[str] = None
    volume_m3: Optional[float] = None
    schedule: Optional[str] = None
    fill_pct: Optional[float] = None
    overflow_prob: Optional[float] = None
    pred_volume_m3: Optional[float] = None
    last_service_dt: Optional[str] = None
