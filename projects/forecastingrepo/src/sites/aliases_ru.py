"""
Header alias resolution for Russian/English labels in site-level data.

Maps various RU/EN headers to canonical field names expected by the ingest.

Canonical fields (registry):
  - site_id, district, lat, lon, bin_count, bin_size_liters, bin_type, land_use

Canonical fields (service):
  - site_id, service_dt, service_time, emptied_flag, collect_volume_m3, district

This module contains pure functions and constants (easy to unit test).
"""
from __future__ import annotations

import re
from typing import Dict, Iterable, Tuple


# Define alias lists for RU/EN headers (case-insensitive match)
ALIASES: Dict[str, Tuple[str, ...]] = {
    # IDs and common
    "site_id": (
        "site_id",
        "id площадки",
        "площадка",
        "кп id",
        "контейнерная площадка",
        "код кп",
        "id",
    ),
    "district": (
        "district",
        "район",
        "участок",
    ),
    "service_dt": (
        "service_dt",
        "date",
        "дата",
        "дата операции",
        "дата обслуживания",
    ),
    "service_time": (
        "service_time",
        "время",
        "время обслуживания",
        "time",
    ),
    "collect_volume_m3": (
        "collect_volume_m3",
        "volume_m3",
        "объем, м3",
        "объём, м3",
        "объем, м³",
        "объём, м³",
        "объем (м3)",
        "объём (м3)",
        "объем",
        "объём",
        "volume",
    ),
    "emptied_flag": (
        "emptied_flag",
        "опорожнение",
        "вывоз",
        "пусто после",
        "emptied",
    ),
    "lat": (
        "lat",
        "широта",
    ),
    "lon": (
        "lon",
        "долгота",
    ),
    "bin_count": (
        "bin_count",
        "количество контейнеров",
        "контейнеров",
        "кол-во контейнеров",
    ),
    "bin_size_liters": (
        "bin_size_liters",
        "объем, л",
        "объём, л",
        "объем (л)",
        "литры",
        "емкость, л",
    ),
    "bin_type": (
        "bin_type",
        "тип контейнера",
        "тип",
    ),
    "land_use": (
        "land_use",
        "тип застройки",
        "землепользование",
        "landuse",
    ),
}


def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def header_to_canonical(header: str) -> str | None:
    h = normalize(header)
    for canon, variants in ALIASES.items():
        for v in variants:
            if h == normalize(v):
                return canon
    return None


def map_headers(headers: Iterable[str]) -> Dict[str, str]:
    """Return mapping original_header -> canonical (skip unknown).

    If multiple originals map to the same canonical, prefer the first occurrence.
    """
    mapping: Dict[str, str] = {}
    seen_canon: set[str] = set()
    for h in headers:
        canon = header_to_canonical(h)
        if canon and canon not in seen_canon:
            mapping[h] = canon
            seen_canon.add(canon)
    return mapping


