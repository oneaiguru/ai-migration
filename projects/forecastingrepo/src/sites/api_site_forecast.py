from __future__ import annotations

from datetime import datetime, timedelta
import csv
import io
import os
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, Response

from .api_context import ApiContext
from .schema import SiteForecastPoint


def _parse_window(window: Optional[str], days: Optional[int], default_end: str) -> tuple[str, str]:
    if window:
        try:
            start_s, end_s = window.split(":", 1)
            datetime.strptime(start_s, "%Y-%m-%d")
            datetime.strptime(end_s, "%Y-%m-%d")
            return start_s, end_s
        except Exception as e:  # pragma: no cover - validated by tests
            raise HTTPException(status_code=400, detail=f"invalid window: {e}")
    d_end = datetime.strptime(default_end, "%Y-%m-%d")
    d_days = int(days or 7)
    d_start = d_end - timedelta(days=d_days - 1)
    return d_start.strftime("%Y-%m-%d"), d_end.strftime("%Y-%m-%d")


def _default_end_date(context: ApiContext) -> str:
    demo_env = os.getenv("DEMO_DEFAULT_DATE")
    if demo_env:
        try:
            datetime.strptime(demo_env, "%Y-%m-%d")
            return demo_env
        except ValueError:
            pass

    try:
        files = context.sites_files()
        latest_end = None
        for path in files:
            name = path.name
            if "daily_fill_" in name and "_to_" in name:
                mid = name.split("daily_fill_")[-1].split(".csv")[0]
                _, end_s = mid.split("_to_", 1)
                datetime.strptime(end_s, "%Y-%m-%d")
                if latest_end is None or end_s > latest_end:
                    latest_end = end_s
        if latest_end:
            return latest_end
    except Exception:
        pass

    return "2024-08-03"


def _load_site_forecast_demo(
    site_id: str,
    start_s: str,
    end_s: str,
    context: ApiContext,
) -> List[SiteForecastPoint]:
    # Minimal demo loader: reuse the active SITES_DATA_DIR/DELIVERIES_DIR wiring via ApiContext.
    # We intentionally return [] if any IO fails to keep endpoint read-only and non-fatal in demo.
    try:
        p = context.find_sites_csv_for_date(end_s) or (context.sites_files()[-1] if context.sites_files() else None)
        if not p or not p.exists():
            return []
        out: List[SiteForecastPoint] = []
        with p.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                d = (rec.get("date") or "").strip()
                if not (start_s <= d <= end_s):
                    continue
                if (rec.get("site_id") or "") != site_id:
                    continue
                pred_raw = rec.get("pred_volume_m3")
                out.append(SiteForecastPoint(
                    date=d,
                    pred_volume_m3=(float(pred_raw) if pred_raw not in (None, "") else None),
                    fill_pct=(float(rec.get("fill_pct") or 0.0) if rec.get("fill_pct") not in (None, "") else None),
                    overflow_prob=(float(rec.get("overflow_prob") or 0.0) if rec.get("overflow_prob") not in (None, "") else None),
                    last_service_dt=rec.get("last_service_dt"),
                ))
        return out
    except Exception:
        return []


def get_router(context: ApiContext) -> APIRouter:
    router = APIRouter()

    @router.get("/api/sites/{site_id}/forecast", response_model=List[SiteForecastPoint], name="site_forecast")
    def get_site_forecast(
        site_id: str,
        window: Optional[str] = None,
        days: Optional[int] = 7,
        format: Optional[str] = Query(None),
    ):
        format_value = (format or "json").lower()
        if format_value not in {"json", "csv"}:
            format_value = "json"
        default_end = _default_end_date(context)
        start_s, end_s = _parse_window(window, days, default_end)
        data = _load_site_forecast_demo(site_id, start_s, end_s, context)
        if format_value == "csv":
            buf = io.StringIO()
            writer = csv.DictWriter(buf, fieldnames=[
                "date",
                "pred_volume_m3",
                "fill_pct",
                "overflow_prob",
                "last_service_dt",
            ])
            writer.writeheader()
            for p in data:
                writer.writerow({
                    "date": p.date,
                    "pred_volume_m3": p.pred_volume_m3,
                    "fill_pct": p.fill_pct,
                    "overflow_prob": p.overflow_prob,
                    "last_service_dt": p.last_service_dt,
                })
            return Response(content=buf.getvalue(), media_type="text/csv")
        return data

    return router


router = get_router(ApiContext())
