from __future__ import annotations

from datetime import datetime
from typing import List, Optional
import csv
import io

from fastapi import APIRouter, HTTPException, Query, Response

from .schema import RouteStopForecast


router = APIRouter()


def _validate_date(date_s: str) -> str:
    try:
        datetime.strptime(date_s, "%Y-%m-%d")
        return date_s
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=400, detail=f"invalid date: {e}")


def _load_route_forecast_demo(route_id: str, date_s: str, policy: str = "strict") -> List[RouteStopForecast]:
    # Demo loader: join recommendations file with site/day forecast slice if available,
    # then filter to a route if the demo data encodes it (most demo CSVs do not),
    # otherwise return an empty list to preserve correctness.
    try:
        from pathlib import Path
        from scripts.api_app import _routes_file, _find_sites_csv_for_date  # type: ignore

        rp: Path = _routes_file(date_s, policy)
        if not rp.exists():
            return []
        # Build site lookup for the day
        site_map: dict[str, dict] = {}
        sf = _find_sites_csv_for_date(date_s)
        if sf and Path(sf).exists():
            with Path(sf).open(newline="", encoding="utf-8") as f2:
                r2 = csv.DictReader(f2)
                for rec in r2:
                    if (rec.get("date") or "") != date_s:
                        continue
                    sid = (rec.get("site_id") or "").strip()
                    if sid:
                        site_map[sid] = rec

        # Demo recommendations do not encode route_id; cannot partition by route.
        # Return [] to avoid misleading grouping for unknown route ids.
        return []
    except Exception:
        return []


@router.get("/api/routes/{route_id}/forecast", response_model=List[RouteStopForecast])
def get_route_forecast(
    route_id: str,
    date: str,
    format: Optional[str] = Query(None, pattern="^(json|csv)$"),
    policy: str = "strict",
):
    date_s = _validate_date(date)
    data = _load_route_forecast_demo(route_id, date_s, policy=policy)
    if (format or "json").lower() == "csv":
        buf = io.StringIO()
        fieldnames = [
            "site_id",
            "address",
            "volume_m3",
            "schedule",
            "fill_pct",
            "overflow_prob",
            "pred_volume_m3",
            "last_service_dt",
        ]
        writer = csv.DictWriter(buf, fieldnames=fieldnames)
        writer.writeheader()
        for p in data:
            writer.writerow({
                "site_id": p.site_id,
                "address": getattr(p, "address", None),
                "volume_m3": getattr(p, "volume_m3", None),
                "schedule": getattr(p, "schedule", None),
                "fill_pct": getattr(p, "fill_pct", None),
                "overflow_prob": getattr(p, "overflow_prob", None),
                "pred_volume_m3": getattr(p, "pred_volume_m3", None),
                "last_service_dt": getattr(p, "last_service_dt", None),
            })
        return Response(content=buf.getvalue(), media_type="text/csv")
    # JSON array (allow empty [])
    return data
