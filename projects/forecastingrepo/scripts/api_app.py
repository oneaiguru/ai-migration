"""
Read-only API for UI (filesystem-backed).

Endpoints:
- GET /api/metrics → region/district monthly WAPE percentiles from reports/backtest_consolidated_auto/metrics_summary.json
- GET /api/districts → simple SMAPE leaderboard from scoreboard_consolidated.csv (if present)
- GET /api/sites → sample site rows from reports/sites_demo/daily_fill_*.csv
- GET /api/routes?date=YYYY-MM-DD&policy=strict|showcase → reads routes CSV from reports/sites_demo/routes/

No runtime behavior changes; purely read-only.
"""
from __future__ import annotations

import csv
import json
import math
import numbers
import os
import re
import time
from datetime import date as date_cls, timedelta
from functools import lru_cache
from pathlib import Path
from typing import List, Tuple, Optional

import pandas as pd
from prometheus_client import Counter, Histogram, Gauge, generate_latest

try:
    from fastapi import FastAPI, Query, Response, HTTPException, UploadFile, File, Form, Request
    from fastapi.responses import JSONResponse, PlainTextResponse
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
except Exception:  # pragma: no cover
    FastAPI = None  # type: ignore
    UploadFile = None  # type: ignore
    File = None  # type: ignore
    Form = None  # type: ignore
    Request = None  # type: ignore

from src.accuracy import load_region_accuracy, load_district_accuracy, load_site_accuracy
from src.sites.forecast_cache import cache_key as build_cache_key
from src.sites.rolling_forecast import build_cache_suffix, generate_rolling_forecast
from src.sites.rolling_types import (
    DEFAULT_MIN_OBS,
    DEFAULT_WINDOW_DAYS,
    ForecastRequest,
    MAX_CUTOFF_DATE,
)


BASE_REPORTS_DIR = Path(os.getenv("REPORTS_DIR", "reports/backtest_consolidated_auto"))
SITES_DATA_DIR = Path(os.getenv("SITES_DATA_DIR", "reports/sites_demo"))
DELIVERIES_DIR = Path(os.getenv("DELIVERIES_DIR", "deliveries"))
ROLLING_FORECAST_KEY_RE = re.compile(
    r"^forecast_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}_w\d+_m\d+"
    r"(?:_[a-z0-9]+)?$"
)


def _sanitize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    return df.where(pd.notna(df), None)


def _sanitize_payload(value):
    if isinstance(value, dict):
        return {k: _sanitize_payload(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_sanitize_payload(v) for v in value]
    if value is pd.NA:
        return None
    if isinstance(value, numbers.Real) and not isinstance(value, bool):
        numeric = float(value)
        if not math.isfinite(numeric):
            return None
        if isinstance(value, int):
            return value
        return numeric
    return value


def _with_pred_delta_m3(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        df_out = df.copy()
        df_out["pred_delta_m3"] = pd.Series(dtype=float)
        return df_out
    df_sorted = df.sort_values(["site_id", "date"]).copy()
    pred_m3 = pd.to_numeric(df_sorted["pred_volume_m3"], errors="coerce").fillna(0.0)
    df_sorted["pred_delta_m3"] = pred_m3.groupby(df_sorted["site_id"]).diff().fillna(pred_m3)
    return df_sorted


def _total_forecast_m3(df: pd.DataFrame) -> float:
    if df.empty:
        return 0.0
    delta_df = _with_pred_delta_m3(df)
    return float(delta_df["pred_delta_m3"].sum())


def _metrics_path() -> Path:
    return BASE_REPORTS_DIR / "metrics_summary.json"


def _scoreboard_consolidated_path() -> Path:
    return BASE_REPORTS_DIR / "scoreboard_consolidated.csv"


def _sites_files() -> List[Path]:
    files = sorted(SITES_DATA_DIR.glob("daily_fill_*.csv"))
    if files:
        return [*files]
    import glob as _glob
    return [Path(p) for p in sorted(_glob.glob(str(DELIVERIES_DIR / "**/forecasts/sites/daily_fill_*.csv"), recursive=True))]


def _find_sites_csv_for_date(date_s: str) -> Optional[Path]:
    """Find a daily_fill_{start}_to_{end}.csv that covers the given date."""
    files = _sites_files()
    for p in files:
        name = p.name
        # expect daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv
        try:
            if "daily_fill_" in name and "_to_" in name:
                mid = name.split("daily_fill_")[-1].split(".csv")[0]
                start_s, end_s = mid.split("_to_")
                if start_s <= date_s <= end_s:
                    return p
        except Exception:
            continue
    # fallback to latest
    return files[-1] if files else None


def _routes_file(date: str, policy: str) -> Path:
    name = "recommendations_strict" if policy == "strict" else "recommendations_showcase"
    p = SITES_DATA_DIR / "routes" / f"{name}_{date}.csv"
    if p.exists():
        return p
    cands = list(Path(DELIVERIES_DIR).glob(f"**/routes/{name}_{date}.csv"))
    return cands[-1] if cands else p


def _iter_site_forecast_rows(site_id: str, start: date_cls, end: date_cls):
    sid = (site_id or "").strip()
    if not sid:
        return
    for csv_path in _sites_files():
        if not csv_path.exists():
            continue
        try:
            with csv_path.open(newline="", encoding="utf-8") as fh:
                reader = csv.DictReader(fh)
                for rec in reader:
                    row_site = (rec.get("site_id") or "").strip()
                    if row_site != sid:
                        continue
                    date_raw = (rec.get("date") or "").strip()
                    if not date_raw:
                        continue
                    try:
                        row_date = date_cls.fromisoformat(date_raw)
                    except Exception:
                        continue
                    if row_date < start or row_date > end:
                        continue
                    yield rec
        except Exception:
            continue


def _load_route_volume_map(date: str) -> dict[str, float]:
    volume_map: dict[str, float] = {}
    path = _routes_file(date, policy="strict")
    if not path.exists():
        return volume_map
    try:
        with path.open(newline="", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            for rec in reader:
                sid = (rec.get("site_id") or "").strip()
                vol = rec.get("volume_m3")
                if not sid or vol in (None, ""):
                    continue
                try:
                    volume_map[sid] = float(vol)
                except Exception:
                    continue
    except Exception:
        return {}
    return volume_map


def _load_registry() -> Tuple[dict, Path | None]:
    reg_path = Path("data/sites/sites_registry.csv")
    mapping: dict[str, str] = {}
    if reg_path.exists():
        with reg_path.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                sid = (rec.get("site_id") or "").strip()
                dist = (rec.get("district") or "").strip()
                if sid and dist:
                    mapping[sid] = dist
        return mapping, reg_path
    return {}, None


def _month_start(value: date_cls) -> date_cls:
    return date_cls(value.year, value.month, 1)


def _iter_month_starts(start: date_cls, end: date_cls):
    current = _month_start(start)
    last = _month_start(end)
    while current <= last:
        yield current
        if current.month == 12:
            current = date_cls(current.year + 1, 1, 1)
        else:
            current = date_cls(current.year, current.month + 1, 1)


def _month_key(value: date_cls) -> str:
    return value.strftime("%Y-%m")


def _normalize_year_month(value: str | None) -> str | None:
    if not value:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    if len(cleaned) >= 7:
        return cleaned[:7]
    return None


def _quarter_label_for_date(value: date_cls) -> str:
    quarter = ((value.month - 1) // 3) + 1
    return f"Q{quarter}_{value.year}"


def _safe_float(value) -> float:
    try:
        if value is None or value == "":
            return 0.0
        return float(value)
    except Exception:
        return 0.0


class QuantileTriplet(BaseModel):
    p50: float | None = None
    p75: float | None = None
    p90: float | None = None


class MetricsEnvelope(BaseModel):
    region_wape: QuantileTriplet
    district_wape: QuantileTriplet
    demo_default_date: str | None = None


class DistrictSMAPE(BaseModel):
    district: str
    smape: float | None = None


class SiteRow(BaseModel):
    site_id: str | None
    district: str | None
    date: str | None
    fill_pct: float
    overflow_prob: float
    pred_volume_m3: float


class RouteRow(BaseModel):
    site_id: str | None
    date: str | None
    policy: str | None
    visit: int | None
    volume_m3: float | None = None
    schedule: str | None = None
    fill_pct: float | None = None
    overflow_prob: float | None = None
    last_service_dt: str | None = None


class TrajectoryPoint(BaseModel):
    site_id: str | None
    date: str
    fill_pct: float
    overflow_prob: float
    pred_volume_m3: float


class MyTKOForecastPoint(BaseModel):
    date: str
    isFact: bool = False
    isEmpty: bool
    tripMeasurements: list[float] | float | None = None
    dividedToTrips: bool = False
    vehicleVolume: float
    overallVolume: float
    overallMileage: float | None = None
    isMixed: bool | None = None


class MyTKOSiteAccuracy(BaseModel):
    site_id: str
    wape: float | None = None
    actual_m3: float
    forecast_m3: float
    days: int


class AccuracyDistributionBin(BaseModel):
    bucket: str | None = None
    site_count: int | None = None
    percent: float | None = None


class RegionAccuracyResponse(BaseModel):
    quarter: str
    available_quarters: list[str]
    overall_wape: float
    median_site_wape: float
    site_count: int
    distribution: list[AccuracyDistributionBin]


class DistrictAccuracyRow(BaseModel):
    district: str | None = None
    accuracy_pct: float | None = None
    weighted_wape: float | None = None
    median_wape: float | None = None
    site_count: int | None = None


class DistrictAccuracyEnvelope(BaseModel):
    quarter: str
    available_quarters: list[str]
    total_districts: int
    limit: int
    offset: int
    rows: list[DistrictAccuracyRow]


class SiteAccuracyRow(BaseModel):
    site_id: str | None = None
    year_month: str | None = None
    actual: float | None = None
    forecast: float | None = None
    wape: float | None = None
    accuracy_pct: float | None = None
    abs_error: float | None = None


class SiteAccuracyEnvelope(BaseModel):
    quarter: str
    available_quarters: list[str]
    total_sites: int
    limit: int
    offset: int
    items: list[SiteAccuracyRow]


# Define Prometheus metrics
request_count = Counter(
    'forecast_requests_total',
    'Total forecast requests',
    ['method', 'endpoint', 'status'],
)

request_duration = Histogram(
    'forecast_request_duration_seconds',
    'Request duration in seconds',
    ['endpoint'],
)

forecast_generation_time = Histogram(
    'forecast_generation_seconds',
    'Time to generate forecast',
)

active_forecasts = Gauge(
    'forecast_active',
    'Currently generating forecasts',
)


def create_app():
    if FastAPI is None:  # pragma: no cover
        raise RuntimeError("FastAPI not installed; install fastapi to use the API app")
    app = FastAPI(title="Forecast Read-only API")

    # Setup structured logging
    from src.logging_config import setup_logging
    import uuid
    import structlog

    setup_logging()
    log = structlog.get_logger()

    # CORS (dev-friendly by default; restrict with API_CORS_ORIGIN)
    origin = os.getenv("API_CORS_ORIGIN", "*")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin] if origin != "*" else ["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Middleware for request ID
    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response

    # Optional: simple per-IP rate limiting for demo hardening
    try:  # pragma: no cover - exercised in API tests implicitly
        from slowapi import Limiter
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
        from slowapi.middleware import SlowAPIMiddleware

        limiter = Limiter(key_func=get_remote_address)
        app.state.limiter = limiter  # type: ignore[attr-defined]
        app.add_exception_handler(RateLimitExceeded, lambda req, exc: JSONResponse({"error": "rate limit exceeded"}, status_code=429))
        app.add_middleware(SlowAPIMiddleware)
    except Exception:
        limiter = None  # type: ignore

    # Security headers (basic hardening)
    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        return response

    # Middleware for metrics
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        """Track request metrics."""
        start_time = time.time()
        response = await call_next(request)
        duration = time.time() - start_time

        request_count.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code,
        ).inc()

        if 'rolling_forecast' in request.url.path:
            request_duration.labels(endpoint='rolling_forecast').observe(duration)

        return response

    @lru_cache(maxsize=16)
    def _read_metrics() -> dict | None:
        p = _metrics_path()
        if not p.exists():
            return None
        return json.loads(p.read_text(encoding="utf-8"))

    @app.get("/api/metrics", response_model=MetricsEnvelope)
    def metrics(format: str | None = None):
        data = _read_metrics()
        if data is None:
            return JSONResponse({"error": "metrics_summary.json not found"}, status_code=404)
        out = {
            "region_wape": {
                "p50": data.get("monthly", {}).get("region", {}).get("wape_median"),
                "p75": data.get("monthly", {}).get("region", {}).get("wape_p75"),
                "p90": data.get("monthly", {}).get("region", {}).get("wape_p90"),
            },
            "district_wape": {
                "p50": data.get("monthly", {}).get("district", {}).get("wape_median"),
                "p75": data.get("monthly", {}).get("district", {}).get("wape_p75"),
                "p90": data.get("monthly", {}).get("district", {}).get("wape_p90"),
            },
        }
        # Optional hint for UI to auto-pick a non-empty demo date
        # Priority: DEMO_DEFAULT_DATE env → first date in demo sites CSV → static fallback
        demo_env = os.getenv("DEMO_DEFAULT_DATE")
        if demo_env:
            out["demo_default_date"] = demo_env
        else:
            try:
                f = _find_sites_csv_for_date("9999-99-99") or (_sites_files()[-1] if _sites_files() else None)
                if f and f.exists():
                    with f.open(newline="", encoding="utf-8") as fh:
                        rr = csv.DictReader(fh)
                        for rec in rr:
                            dd = (rec.get("date") or "").strip()
                            if dd:
                                out["demo_default_date"] = dd
                                break
            except Exception:
                # Static known-good demo date (ships with repo)
                out["demo_default_date"] = "2024-08-03"
        if (format or "").lower() == "csv":
            # CSV via DictWriter to avoid CSV injection and ensure proper quoting
            from io import StringIO
            buf = StringIO()
            fieldnames = ["level", "p50", "p75", "p90"]
            w = csv.DictWriter(buf, fieldnames=fieldnames)
            w.writeheader()
            w.writerow({"level": "region", **out["region_wape"]})
            w.writerow({"level": "district", **out["district_wape"]})
            return PlainTextResponse(buf.getvalue(), media_type="text/csv")
        return out

    @app.get("/health")
    def health_check():
        """Health check endpoint for container orchestration."""
        return {
            "status": "healthy",
            "service": "forecast-api",
            "version": "1.0.0",
        }

    @app.get("/metrics")
    def prometheus_metrics():
        """Prometheus metrics endpoint."""
        return PlainTextResponse(generate_latest(), media_type="text/plain; charset=utf-8")

    @lru_cache(maxsize=16)
    def _read_scoreboard_consolidated() -> list[dict]:
        p = _scoreboard_consolidated_path()
        if not p.exists():
            return []
        rows: list[dict] = []
        with p.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                rows.append(rec)
        return rows

    @app.get("/api/districts", response_model=list[DistrictSMAPE])
    def districts(format: str | None = None):
        rows = _read_scoreboard_consolidated()
        if not rows:
            return [] if (format or "").lower() != "csv" else PlainTextResponse("district,smape\n", media_type="text/csv")
        sm: dict[str, List[float]] = {}
        for rec in rows:
            if (rec.get("level") or "").lower() != "district":
                continue
            d = rec.get("district") or ""
            try:
                a = abs(float(rec.get("actual") or 0.0))
                y = float(rec.get("forecast") or 0.0)
                v = (2 * abs(a - y)) / (abs(a) + abs(y) + 1e-9)
                sm.setdefault(d, []).append(v)
            except Exception:
                pass
        out = [{"district": k, "smape": (sum(vs) / len(vs) if vs else None)} for k, vs in sm.items()]
        out.sort(key=lambda x: (x["smape"] if x["smape"] is not None else 9e9))
        if (format or "").lower() == "csv":
            from io import StringIO
            buf = StringIO()
            fieldnames = ["district", "smape"]
            w = csv.DictWriter(buf, fieldnames=fieldnames)
            w.writeheader()
            for row in out[:50]:
                w.writerow({"district": row.get("district"), "smape": row.get("smape")})
            return PlainTextResponse(buf.getvalue(), media_type="text/csv")
        return out[:50]

    @app.get("/api/sites", response_model=list[SiteRow])
    def sites(limit: int = Query(50, ge=1, le=1000), date: str | None = None, district: str | None = None, offset: int = 0, format: str | None = None):
        files = _sites_files()
        if not files:
            return [] if (format or "").lower() != "csv" else PlainTextResponse("site_id,date,fill_pct,overflow_prob\n", media_type="text/csv")
        p = files[-1]
        reg_map, _ = _load_registry()
        out = []
        with p.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                if date and (rec.get("date") or "") != date:
                    continue
                sid = rec.get("site_id")
                dist = reg_map.get(sid or "") if reg_map else None
                if district and dist != district:
                    continue
                out.append({
                    "site_id": sid,
                    "district": dist,
                    "date": rec.get("date"),
                    "fill_pct": float(rec.get("fill_pct") or 0.0),
                    "overflow_prob": float(rec.get("overflow_prob") or 0.0),
                    "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
                })
        total = len(out)
        # Optional microfix (PR-19): compute fill_pct from volume when gated and volume is available for the date
        try:
            gate = (os.getenv("SITE_FILL_FROM_VOLUME", "").lower() in ("1", "true", "on"))
        except Exception:
            gate = False
        if gate and date and out:
            # Build per-site volume map from routes recommendations for the date (strict policy)
            try:
                rp = _routes_file(date, policy="strict")
                vol_map: dict[str, float] = {}
                if rp.exists():
                    with rp.open(newline="", encoding="utf-8") as f:
                        rr = csv.DictReader(f)
                        for rec in rr:
                            sid = (rec.get("site_id") or "").strip()
                            v = rec.get("volume_m3")
                            if sid and v not in (None, ""):
                                try:
                                    vol_map[sid] = float(v)
                                except Exception:
                                    pass
                # Compute capacity liters using registry if available, else default 1100 L
                cap_default = 1100.0
                # Best-effort: load bin_count and bin_size_liters if present
                cap_map: dict[str, float] = {}
                try:
                    reg_path = Path("data/sites/sites_registry.csv")
                    if reg_path.exists():
                        with reg_path.open(newline="", encoding="utf-8") as rf:
                            rr2 = csv.DictReader(rf)
                            for rec in rr2:
                                sid = (rec.get("site_id") or "").strip()
                                if not sid:
                                    continue
                                try:
                                    bc = float(rec.get("bin_count") or 1)
                                    bs = float(rec.get("bin_size_liters") or cap_default)
                                    cap_map[sid] = bc * bs
                                except Exception:
                                    pass
                except Exception:
                    cap_map = {}
                # Apply override when volume is available: prefer max(existing_fill, volume_fill)
                for row in out:
                    sid = (row.get("site_id") or "").strip()
                    if sid in vol_map:
                        try:
                            cap_l = cap_map.get(sid, cap_default)
                            vol_l = vol_map[sid] * 1000.0
                            vol_fill = max(0.0, min(1.0, vol_l / cap_l))
                            try:
                                existing = float(row.get("fill_pct") or 0.0)
                            except Exception:
                                existing = 0.0
                            row["fill_pct"] = max(existing, vol_fill)
                        except Exception:
                            pass
            except Exception:
                pass
        page = out[offset: offset + limit]
        if (format or "").lower() == "csv":
            from io import StringIO
            buf = StringIO()
            fieldnames = ["site_id", "district", "date", "fill_pct", "overflow_prob", "pred_volume_m3"]
            w = csv.DictWriter(buf, fieldnames=fieldnames)
            w.writeheader()
            for row in page:
                w.writerow(row)
            return PlainTextResponse(buf.getvalue(), media_type="text/csv", headers={"X-Total-Count": str(total)})
        # Expose unmapped-sites count for QA awareness
        unmapped = sum(1 for r in page if r.get("district") is None)
        return JSONResponse(page, headers={"X-Total-Count": str(total), "X-Unmapped-Sites": str(unmapped)})

    @app.get("/api/routes", response_model=list[RouteRow])
    def routes(date: str, policy: str = "strict", format: str | None = None):
        p = _routes_file(date, policy)
        if not p.exists():
            return [] if (format or "").lower() != "csv" else PlainTextResponse("site_id,date,policy,visit\n", media_type="text/csv")
        # Build per-site lookup for the requested date, if available
        site_map: dict[str, dict] = {}
        try:
            sf = _find_sites_csv_for_date(date)
            if sf and sf.exists():
                with sf.open(newline="", encoding="utf-8") as f2:
                    r2 = csv.DictReader(f2)
                    for rec in r2:
                        if (rec.get("date") or "") != date:
                            continue
                        sid = (rec.get("site_id") or "").strip()
                        if sid:
                            site_map[sid] = rec
        except Exception:
            site_map = {}

        rows = []
        with p.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                vol = rec.get("volume_m3")
                sch = rec.get("schedule") or rec.get("schedule_str")
                sid = rec.get("site_id")
                joined = site_map.get(sid or "", {})
                fill = joined.get("fill_pct")
                risk = joined.get("overflow_prob")
                last_service = joined.get("last_service_dt")  # present only if CSV includes
                rows.append({
                    "site_id": sid,
                    "date": rec.get("date"),
                    "policy": rec.get("policy"),
                    "visit": int(rec.get("visit") or 0),
                    "volume_m3": (float(vol) if vol not in (None, "") else None),
                    "schedule": sch,
                    "fill_pct": (float(fill) if fill not in (None, "") else None),
                    "overflow_prob": (float(risk) if risk not in (None, "") else None),
                    "last_service_dt": last_service,
                })
        if (format or "").lower() == "csv":
            from io import StringIO
            buf = StringIO()
            fieldnames = [
                "site_id",
                "date",
                "policy",
                "visit",
                "volume_m3",
                "schedule",
                "fill_pct",
                "overflow_prob",
                "last_service_dt",
            ]
            w = csv.DictWriter(buf, fieldnames=fieldnames)
            w.writeheader()
            for row in rows:
                w.writerow(row)
            return PlainTextResponse(buf.getvalue(), media_type="text/csv")
        return rows

    @app.get("/api/site/{site_id}/trajectory", response_model=list[TrajectoryPoint])
    def site_trajectory(site_id: str, start: str, end: str):
        files = _sites_files()
        if not files:
            return JSONResponse({"error": "no site CSVs found"}, status_code=404)
        p = files[-1]
        out = []
        with p.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                if (rec.get("site_id") or "") != site_id:
                    continue
                d = rec.get("date") or ""
                if d < start or d > end:
                    continue
                out.append({
                    "site_id": rec.get("site_id"),
                    "date": d,
                    "fill_pct": float(rec.get("fill_pct") or 0.0),
                    "overflow_prob": float(rec.get("overflow_prob") or 0.0),
                    "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
                })
        if not out:
            return JSONResponse({"error": "site not found or no data in range"}, status_code=404)
        return out

    @app.get("/api/accuracy/region", response_model=RegionAccuracyResponse)
    def region_accuracy(quarter: str | None = Query(default=None), format: str | None = None):
        try:
            payload = load_region_accuracy(quarter)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        if (format or "").lower() == "csv":
            from io import StringIO

            buf = StringIO()
            fieldnames = ["quarter", "overall_wape", "median_site_wape", "site_count", "bucket", "bucket_site_count", "percent"]
            writer = csv.DictWriter(buf, fieldnames=fieldnames)
            writer.writeheader()
            for dist in payload["distribution"]:
                writer.writerow(
                    {
                        "quarter": payload["quarter"],
                        "overall_wape": payload["overall_wape"],
                        "median_site_wape": payload["median_site_wape"],
                        "site_count": payload["site_count"],
                        "bucket": dist.get("bucket"),
                        "bucket_site_count": dist.get("site_count"),
                        "percent": dist.get("percent"),
                    }
                )
            return PlainTextResponse(buf.getvalue(), media_type="text/csv")
        return payload

    @app.get("/api/accuracy/districts", response_model=DistrictAccuracyEnvelope)
    def district_accuracy(
        quarter: str | None = Query(default=None),
        limit: int = Query(50, ge=1, le=500),
        offset: int = Query(0, ge=0),
        format: str | None = None,
    ):
        try:
            payload = load_district_accuracy(quarter)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        rows = list(payload["rows"])
        total = len(rows)
        page = rows[offset: offset + limit]
        body = {
            "quarter": payload["quarter"],
            "available_quarters": payload["available_quarters"],
            "total_districts": total,
            "limit": limit,
            "offset": offset,
            "rows": page,
        }
        if (format or "").lower() == "csv":
            from io import StringIO

            buf = StringIO()
            fieldnames = ["district", "accuracy_pct", "median_wape", "weighted_wape", "site_count"]
            writer = csv.DictWriter(buf, fieldnames=fieldnames)
            writer.writeheader()
            for row in page:
                writer.writerow(
                    {
                        "district": row.get("district"),
                        "accuracy_pct": row.get("accuracy_pct"),
                        "median_wape": row.get("median_wape"),
                        "weighted_wape": row.get("weighted_wape"),
                        "site_count": row.get("site_count"),
                    }
                )
            return PlainTextResponse(buf.getvalue(), media_type="text/csv", headers={"X-Total-Count": str(total)})
        return body

    @app.get("/api/accuracy/sites", response_model=SiteAccuracyEnvelope)
    def site_accuracy(
        quarter: str | None = Query(default=None),
        limit: int = Query(50, ge=1, le=500),
        offset: int = Query(0, ge=0),
        search: str | None = None,
        format: str | None = None,
    ):
        try:
            payload = load_site_accuracy(quarter)
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        rows = [dict(row) for row in payload["rows"]]
        if search:
            needle = search.strip().lower()
            rows = [row for row in rows if needle in (str(row.get("site_id") or "").lower())]
        total = len(rows)
        page = rows[offset: offset + limit]
        body = {
            "quarter": payload["quarter"],
            "available_quarters": payload["available_quarters"],
            "total_sites": total,
            "limit": limit,
            "offset": offset,
            "items": page,
        }
        headers = {"X-Total-Count": str(total)}
        if (format or "").lower() == "csv":
            from io import StringIO

            buf = StringIO()
            fieldnames = ["site_id", "year_month", "actual", "forecast", "wape", "accuracy_pct", "abs_error"]
            writer = csv.DictWriter(buf, fieldnames=fieldnames)
            writer.writeheader()
            for row in page:
                writer.writerow(
                    {
                        "site_id": row.get("site_id"),
                        "year_month": row.get("year_month"),
                        "actual": row.get("actual"),
                        "forecast": row.get("forecast"),
                        "wape": row.get("wape"),
                        "accuracy_pct": row.get("accuracy_pct"),
                        "abs_error": row.get("abs_error"),
                    }
                )
            return PlainTextResponse(buf.getvalue(), media_type="text/csv", headers=headers)
        return JSONResponse(body, headers=headers)

    @app.get("/api/mytko/site_accuracy", response_model=MyTKOSiteAccuracy)
    def mytko_site_accuracy(
        site_id: str = Query(..., min_length=1),
        start_date: str = Query(..., min_length=10, max_length=10),
        end_date: str = Query(..., min_length=10, max_length=10),
    ):
        try:
            start = date_cls.fromisoformat(start_date)
            end = date_cls.fromisoformat(end_date)
        except Exception:
            raise HTTPException(status_code=400, detail="start_date and end_date must be ISO dates (YYYY-MM-DD)")
        if start > end:
            raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
        sid = (site_id or "").strip()
        if not sid:
            raise HTTPException(status_code=400, detail="site_id must be non-empty")
        days = (end - start).days + 1
        month_starts = list(_iter_month_starts(start, end))
        month_keys = {_month_key(value) for value in month_starts}
        quarter_names = sorted({_quarter_label_for_date(value) for value in month_starts})
        site_rows: list[dict] = []
        for quarter in quarter_names:
            try:
                payload = load_site_accuracy(quarter)
            except FileNotFoundError:
                continue
            for row in payload.get("rows", []):
                row_site_value = row.get("site_id")
                row_site = str(row_site_value).strip() if row_site_value is not None else ""
                if row_site == sid:
                    site_rows.append(row)
        if not site_rows:
            return MyTKOSiteAccuracy(site_id=sid, wape=None, actual_m3=0.0, forecast_m3=0.0, days=days)
        filtered_rows = [
            row
            for row in site_rows
            if _normalize_year_month(row.get("year_month") or row.get("date")) in month_keys
        ]
        usable_rows = filtered_rows or site_rows
        actual_total = 0.0
        forecast_total = 0.0
        abs_error_total = 0.0
        for row in usable_rows:
            actual_value = _safe_float(row.get("actual"))
            forecast_value = _safe_float(row.get("forecast"))
            abs_error_field = row.get("abs_error")
            abs_value = _safe_float(abs_error_field) if abs_error_field not in (None, "") else abs(actual_value - forecast_value)
            actual_total += actual_value
            forecast_total += forecast_value
            abs_error_total += abs_value
        wape_value = abs_error_total / actual_total if actual_total > 0 else None
        return MyTKOSiteAccuracy(
            site_id=sid,
            wape=wape_value,
            actual_m3=actual_total,
            forecast_m3=forecast_total,
            days=days,
        )

    @app.get("/api/mytko/forecast", response_model=list[MyTKOForecastPoint])
    def mytko_forecast(
        site_id: str = Query(..., min_length=1),
        start_date: str = Query(..., min_length=10, max_length=10),
        end_date: str = Query(..., min_length=10, max_length=10),
        vehicle_volume: float = Query(22.0, gt=0),
    ):
        try:
            start = date_cls.fromisoformat(start_date)
            end = date_cls.fromisoformat(end_date)
        except Exception:
            raise HTTPException(status_code=400, detail="start_date and end_date must be ISO dates (YYYY-MM-DD)")
        if start > end:
            raise HTTPException(status_code=400, detail="start_date must be before or equal to end_date")
        sid = site_id.strip()
        rows = list(_iter_site_forecast_rows(sid, start, end))
        if not rows:
            raise HTTPException(status_code=404, detail="No forecast rows for site/date range")
        volume_cache: dict[str, dict[str, float]] = {}
        points: list[dict] = []
        for rec in sorted(rows, key=lambda r: (r.get("date") or "")):
            date_value = (rec.get("date") or "").strip()
            if not date_value:
                continue
            try:
                row_date = date_cls.fromisoformat(date_value)
            except Exception:
                continue
            if row_date < start or row_date > end:
                continue
            pred_mass = 0.0
            pm = rec.get("pred_volume_m3")
            if pm not in (None, ""):
                try:
                    pred_mass = float(pm)
                except Exception:
                    pred_mass = 0.0
            vol_map = volume_cache.get(date_value)
            if vol_map is None:
                vol_map = _load_route_volume_map(date_value)
                volume_cache[date_value] = vol_map
            volume_m3 = vol_map.get(sid)
            overall_volume = volume_m3 if volume_m3 is not None else pred_mass
            if not isinstance(overall_volume, float):
                try:
                    overall_volume = float(overall_volume)
                except Exception:
                    overall_volume = 0.0
            is_empty = (overall_volume <= 0) and (pred_mass <= 0)
            points.append(
                {
                    "date": date_value,
                    "isFact": False,
                    "isEmpty": is_empty,
                    "tripMeasurements": None,
                    "dividedToTrips": False,
                    "vehicleVolume": vehicle_volume,
                    "overallVolume": max(0.0, overall_volume),
                    "overallMileage": None,
                    "isMixed": None,
                }
            )
        if not points:
            raise HTTPException(status_code=404, detail="No forecast rows for site/date range")
        return points

    @app.get("/api/mytko/rolling_forecast")
    def rolling_forecast(
        request: Request,
        cutoff_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
        horizon_days: int = Query(..., ge=1, le=365),
        site_id: Optional[str] = None,
        format: str = Query("json"),
        limit: int = Query(50, ge=1, le=1000),
        offset: int = Query(0, ge=0),
        district: Optional[str] = None,
        search: Optional[str] = None,
    ):
        """
        Generate rolling-cutoff forecast for single site or all sites.

        Query Parameters:
          cutoff_date: YYYY-MM-DD (required, max 2025-05-31)
          horizon_days: 1-365 (required)
          site_id: optional, if omitted returns all-sites summary
          format: "json" or "csv" (default "json")
          limit: 1-1000, default 50 (for all-sites mode)
          offset: >= 0, default 0 (for all-sites mode)
          district: optional, case-insensitive prefix filter (all-sites mode)
          search: optional, case-insensitive contains match on site_id/address (all-sites mode)
        """
        request_id = request.state.request_id

        log.info(
            "forecast_started",
            request_id=request_id,
            cutoff_date=cutoff_date,
            horizon_days=horizon_days,
            site_id=site_id,
        )

        # Parse and validate cutoff
        try:
            cutoff = date_cls.fromisoformat(cutoff_date)
        except ValueError:
            log.error(
                "forecast_failed",
                request_id=request_id,
                error="Invalid cutoff_date format",
            )
            raise HTTPException(status_code=400, detail="Invalid cutoff_date format")

        if cutoff > MAX_CUTOFF_DATE:
            log.error(
                "forecast_failed",
                request_id=request_id,
                error=f"cutoff_date exceeds maximum allowed date",
            )
            raise HTTPException(status_code=400, detail=f"cutoff_date cannot exceed {MAX_CUTOFF_DATE}")

        # Validate format
        if format not in ("json", "csv"):
            log.error(
                "forecast_failed",
                request_id=request_id,
                error="Invalid format parameter",
            )
            raise HTTPException(status_code=400, detail="format must be 'json' or 'csv'")

        # Build request
        request_obj = ForecastRequest(
            cutoff_date=cutoff,
            horizon_days=horizon_days,
            site_ids=[site_id] if site_id else None,
        )

        # Generate forecast
        active_forecasts.inc()
        try:
            start = time.time()
            result = generate_rolling_forecast(
                request_obj,
                district_filter=district,
                search_term=search,
            )
            duration = time.time() - start
            forecast_generation_time.observe(duration)
            log.info(
                "forecast_generated",
                request_id=request_id,
                site_count=result.site_count,
            )
        except Exception as e:
            log.error(
                "forecast_failed",
                request_id=request_id,
                error=str(e),
            )
            raise
        finally:
            active_forecasts.dec()

        forecast_df = result.forecast_df
        accuracy_summary = None
        if cutoff + timedelta(days=horizon_days) <= MAX_CUTOFF_DATE:
            from src.sites.data_loader import load_service_data
            from src.sites.rolling_forecast import compute_accuracy_metrics

            service_df = load_service_data(
                start_date=cutoff + timedelta(days=1),
                end_date=cutoff + timedelta(days=horizon_days),
            )
            forecast_df, accuracy_summary = compute_accuracy_metrics(
                forecast_df,
                service_df,
                cutoff,
                horizon_days,
            )

        # Format response based on mode
        if site_id:
            # Single-site mode
            points = _sanitize_dataframe(forecast_df).to_dict('records')
            if not points:
                log.error(
                    "forecast_failed",
                    request_id=request_id,
                    error=f"No forecast data for site {site_id}",
                )
                raise HTTPException(status_code=404, detail=f"No forecast data for site {site_id}")
            log.info(
                "forecast_completed",
                request_id=request_id,
                site_id=site_id,
                point_count=len(points),
                format=format,
            )
            if format == "csv":
                # Return CSV for single site
                from io import StringIO
                buf = StringIO()
                fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
                w = csv.DictWriter(buf, fieldnames=fieldnames)
                w.writeheader()
                for point in points:
                    w.writerow({
                        "site_id": site_id,
                        "date": point["date"],
                        "fill_pct": point["fill_pct"],
                        "pred_volume_m3": point["pred_volume_m3"],
                        "overflow_prob": point["overflow_prob"],
                    })
                return PlainTextResponse(buf.getvalue(), media_type="text/csv")
            return _sanitize_payload({
                "site_id": site_id,
                "cutoff_date": cutoff_date,
                "horizon_days": horizon_days,
                "points": points,
            })
        else:
            # All-sites mode with pagination
            df = forecast_df
            total_rows = len(df)
            total_m3 = _total_forecast_m3(df)

            # Get unique sites in result
            unique_sites = df['site_id'].nunique()

            # Paginate dataframe
            paginated_df = df.iloc[offset:offset + limit]
            rows = _sanitize_dataframe(paginated_df).to_dict('records')

            # Add pagination headers
            response_headers = {
                "X-Total-Count": str(total_rows),
                "X-Site-Count": str(unique_sites),
            }

            log.info(
                "forecast_completed",
                request_id=request_id,
                site_count=unique_sites,
                total_rows=total_rows,
                total_m3=total_m3,
                format=format,
            )

            if format == "csv":
                # Return paginated CSV
                from io import StringIO
                buf = StringIO()
                fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
                w = csv.DictWriter(buf, fieldnames=fieldnames)
                w.writeheader()
                for _, row in paginated_df.iterrows():
                    w.writerow({
                        "site_id": row["site_id"],
                        "date": row["date"],
                        "fill_pct": row["fill_pct"],
                        "pred_volume_m3": row["pred_volume_m3"],
                        "overflow_prob": row["overflow_prob"],
                    })
                return PlainTextResponse(buf.getvalue(), media_type="text/csv", headers=response_headers)

            response_payload = {
                "cutoff_date": cutoff_date,
                "horizon_days": horizon_days,
                "site_count": result.site_count,
                "total_forecast_m3": round(total_m3, 2),
                "total_rows": total_rows,
                "limit": limit,
                "offset": offset,
                "rows": rows,
                "generated_at": result.generated_at,
                "download_url": None,
            }
            # Use site_id query param (None for all-sites), not request object
            cache_suffix = build_cache_suffix(
                [site_id] if site_id else None,
                district,
                search,
                DEFAULT_WINDOW_DAYS,
                DEFAULT_MIN_OBS,
            )
            cache_key_value = build_cache_key(
                cutoff,
                result.start_date,
                result.end_date,
                cache_suffix=cache_suffix,
                window_days=DEFAULT_WINDOW_DAYS,
                min_obs=DEFAULT_MIN_OBS,
            )
            response_payload["download_url"] = (
                f"/api/mytko/rolling_forecast/download?key={cache_key_value}"
            )
            if accuracy_summary is not None:
                response_payload.update(accuracy_summary)
            return JSONResponse(
                content=_sanitize_payload(response_payload),
                headers=response_headers,
            )

    @app.get("/api/mytko/districts")
    def list_districts():
        """Return all unique district names."""
        from src.sites.data_loader import load_registry

        registry = load_registry()
        if "district" not in registry.columns:
            return {"districts": [], "count": 0}

        districts = (
            registry["district"]
            .dropna()
            .astype(str)
            .map(str.strip)
        )
        districts = sorted({d for d in districts if d})
        return {"districts": districts, "count": len(districts)}

    @app.get("/api/mytko/rolling_forecast/by_district")
    def rolling_forecast_by_district(
        cutoff_date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
        horizon_days: int = Query(..., ge=1, le=365),
        limit: int = Query(50, ge=1, le=100),
        sort_by: str = Query("name", pattern="^(name|site_count|total_m3|wape)$"),
        sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    ):
        """
        Get district-level forecast aggregations.
        """
        try:
            cutoff = date_cls.fromisoformat(cutoff_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cutoff_date format")

        if cutoff > MAX_CUTOFF_DATE:
            raise HTTPException(status_code=400, detail=f"cutoff_date cannot exceed {MAX_CUTOFF_DATE}")

        request = ForecastRequest(cutoff_date=cutoff, horizon_days=horizon_days)
        result = generate_rolling_forecast(request)

        from src.sites.data_loader import load_registry, load_service_data
        from src.sites.rolling_forecast import compute_accuracy_metrics

        df = result.forecast_df.copy()
        accuracy_available = cutoff + timedelta(days=horizon_days) <= MAX_CUTOFF_DATE
        if accuracy_available:
            service_df = load_service_data(
                start_date=cutoff + timedelta(days=1),
                end_date=cutoff + timedelta(days=horizon_days),
            )
            df, _ = compute_accuracy_metrics(
                df,
                service_df,
                cutoff,
                horizon_days,
            )

        registry = load_registry()
        site_districts = dict(zip(registry["site_id"], registry["district"]))
        df["district"] = df["site_id"].map(site_districts).fillna("Unknown")

        delta_df = _with_pred_delta_m3(df)
        agg = delta_df.groupby("district").agg(
            site_count=("site_id", "nunique"),
            total_forecast_m3=("pred_delta_m3", "sum"),
        ).reset_index()

        if accuracy_available and "actual_m3" in df.columns:
            actuals = df[df["actual_m3"].notna()]
            actuals_delta = _with_pred_delta_m3(actuals)
            actuals_delta["abs_error_m3"] = (actuals_delta["pred_delta_m3"] - actuals_delta["actual_m3"]).abs()
            actuals_agg = actuals_delta.groupby("district").agg(
                total_actual_m3=("actual_m3", "sum"),
                forecast_actual_m3=("pred_delta_m3", "sum"),
                total_error_m3=("abs_error_m3", "sum"),
            ).reset_index()
            agg = agg.merge(actuals_agg, on="district", how="left")
            agg["accuracy_wape"] = pd.NA
            valid_actuals = agg["total_actual_m3"].notna() & (agg["total_actual_m3"] > 0)
            agg.loc[valid_actuals, "accuracy_wape"] = (
                agg.loc[valid_actuals, "total_error_m3"]
                / agg.loc[valid_actuals, "total_actual_m3"]
            )

        site_totals = delta_df.groupby(["district", "site_id"], as_index=False)["pred_delta_m3"].sum()

        districts = []
        for _, row in agg.iterrows():
            district_name = row["district"]
            district_sites = site_totals[site_totals["district"] == district_name]
            if not district_sites.empty:
                top_row = district_sites.loc[district_sites["pred_delta_m3"].idxmax()]
                bottom_row = district_sites.loc[district_sites["pred_delta_m3"].idxmin()]
                top_site = {
                    "site_id": top_row["site_id"],
                    "forecast_m3": round(top_row["pred_delta_m3"], 2),
                }
                bottom_site = {
                    "site_id": bottom_row["site_id"],
                    "forecast_m3": round(bottom_row["pred_delta_m3"], 2),
                }
            else:
                top_site = None
                bottom_site = None

            district_payload = {
                "district": district_name,
                "site_count": int(row["site_count"]),
                "total_forecast_m3": round(row["total_forecast_m3"], 2),
                "top_site": top_site,
                "bottom_site": bottom_site,
            }
            if accuracy_available and "total_actual_m3" in row:
                district_payload["total_actual_m3"] = (
                    round(row["total_actual_m3"], 2)
                    if row.get("total_actual_m3") is not None and pd.notna(row["total_actual_m3"])
                    else None
                )
                district_payload["accuracy_wape"] = (
                    round(row["accuracy_wape"], 4)
                    if row.get("accuracy_wape") is not None and pd.notna(row["accuracy_wape"])
                    else None
                )
            districts.append(district_payload)

        sort_key = {
            "name": lambda x: x["district"],
            "site_count": lambda x: x["site_count"],
            "total_m3": lambda x: x["total_forecast_m3"],
            "wape": lambda x: x.get("accuracy_wape") if x.get("accuracy_wape") is not None else 999,
        }[sort_by]
        districts.sort(key=sort_key, reverse=(sort_order == "desc"))
        districts = districts[:limit]

        return _sanitize_payload({
            "cutoff_date": cutoff_date,
            "horizon_days": horizon_days,
            "district_count": len(agg),
            "districts": districts,
        })

    @app.get("/api/mytko/rolling_forecast/download")
    def rolling_forecast_download(
        key: str = Query(...),
    ):
        """
        Download cached forecast as CSV.

        Key format: forecast_{cutoff}_{start}_{end}_w{window_days}_m{min_obs}[_suffix]
        Example: forecast_2025-03-15_2025-03-16_2025-03-22_w84_m4_f1a2b3c4d5e6
        """
        from src.sites.forecast_cache import load_from_cache

        if not ROLLING_FORECAST_KEY_RE.match(key):
            raise HTTPException(status_code=400, detail="Invalid key format")

        # Parse key to extract dates
        try:
            parts = key.split("_")
            cutoff = date_cls.fromisoformat(parts[1])
            start = date_cls.fromisoformat(parts[2])
            end = date_cls.fromisoformat(parts[3])
            window_part = parts[4]
            min_part = parts[5]
            if not window_part.startswith("w") or not min_part.startswith("m"):
                raise ValueError("Invalid key format")
            window_days = int(window_part[1:])
            min_obs = int(min_part[1:])
        except (IndexError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid key format")

        cache_suffix = "_".join(parts[6:]) if len(parts) > 6 else None
        if cache_suffix == "":
            cache_suffix = None

        # Load from cache
        df = load_from_cache(
            cutoff,
            start,
            end,
            cache_suffix=cache_suffix,
            window_days=window_days,
            min_obs=min_obs,
        )
        if df is None:
            raise HTTPException(status_code=404, detail="Forecast not found in cache")

        # Stream CSV
        from io import StringIO
        buf = StringIO()
        fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
        w = csv.DictWriter(buf, fieldnames=fieldnames)
        w.writeheader()
        for _, row in df.iterrows():
            w.writerow({
                "site_id": row["site_id"],
                "date": row["date"],
                "fill_pct": row["fill_pct"],
                "pred_volume_m3": row["pred_volume_m3"],
                "overflow_prob": row["overflow_prob"],
            })

        filename = f"{key}.csv"
        return PlainTextResponse(
            buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    @app.post("/api/mytko/ingest_metrics")
    async def ingest_metrics(
        metrics_file: UploadFile = File(...),
        iteration: int = Form(...),
        notes: str = Form(""),
        per_site_file: UploadFile | None = File(None),
    ):
        """Ingest metrics CSV from Jury's validation script."""
        import tempfile
        from pathlib import Path
        from src.sites.metrics_tracker import MetricsTracker

        # Validate file type
        if not metrics_file.filename or not metrics_file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="File must be CSV format (.csv extension required)"
            )

        # Save to temp file
        with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as f:
            content = await metrics_file.read()
            f.write(content)
            temp_path = Path(f.name)
        per_site_path = None
        try:
            if per_site_file is not None:
                if not per_site_file.filename or not per_site_file.filename.endswith('.csv'):
                    raise HTTPException(
                        status_code=400,
                        detail="Per-site file must be CSV format (.csv extension required)"
                    )
                with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as pf:
                    per_site_content = await per_site_file.read()
                    pf.write(per_site_content)
                    per_site_path = Path(pf.name)

            tracker = MetricsTracker()
            try:
                tracker.ingest_validation_csv(
                    metrics_csv=temp_path,
                    iteration=iteration,
                    notes=notes,
                )
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

            if per_site_path is not None:
                try:
                    tracker.ingest_per_site_csv(
                        per_site_csv=per_site_path,
                        iteration=iteration,
                    )
                except ValueError as e:
                    raise HTTPException(status_code=400, detail=f"Invalid per-site CSV: {str(e)}")

            history = tracker.get_history()
            filtered = history[history['iteration'] == iteration]
            if filtered.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"Iteration {iteration} not found after ingestion"
                )
            latest = filtered.iloc[0]

            return {
                "status": "ok",
                "iteration": iteration,
                "wape": float(latest['overall_wape']),
                "within_20_pct": float(latest['within_20_pct']),
            }
        finally:
            temp_path.unlink(missing_ok=True)
            if per_site_path is not None:
                per_site_path.unlink(missing_ok=True)

    @app.get("/api/mytko/metrics_history")
    def get_metrics_history():
        """Get iteration history for dashboard."""
        from src.sites.metrics_tracker import MetricsTracker

        tracker = MetricsTracker()
        history = tracker.get_history()
        improvement = tracker.get_improvement()

        return {
            "rows": history.to_dict(orient='records') if not history.empty else [],
            "improvement": improvement if improvement else None,
        }

    @app.get("/api/mytko/site_scores")
    def get_site_scores():
        """Get quality scores for all sites."""
        from src.sites.quality_score import QualityScorer
        from src.sites.metrics_tracker import MetricsTracker
        from src.sites.feedback_tracker import FeedbackTracker

        scorer = QualityScorer()
        metrics_tracker = MetricsTracker()
        feedback_tracker = FeedbackTracker()

        site_metrics_df = metrics_tracker.get_latest_site_metrics()
        feedback_summary_df = feedback_tracker.get_summary()

        scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
        if scores.empty or 'score' not in scores.columns:
            return {"scores": [], "average_score": None}

        return {
            "scores": scores.to_dict(orient='records'),
            "average_score": float(scores['score'].mean()),
        }

    @app.post("/api/mytko/feedback")
    async def submit_feedback(
        request: Request,
        site_id: str | None = Form(None),
        date: str | None = Form(None),
        useful: bool | None = Form(None),
        reason: str | None = Form(""),
        dispatcher_note: str | None = Form(""),
    ):
        """Submit feedback with dispatcher annotation."""
        from src.sites.feedback_tracker import FeedbackTracker

        if site_id is None:
            site_id = request.query_params.get("site_id")
        if date is None:
            date = request.query_params.get("date")
        if useful is None:
            useful_raw = request.query_params.get("useful")
            if useful_raw is not None:
                useful = useful_raw.strip().lower() in {"1", "true", "yes", "y", "on"}
        if reason == "":
            reason = request.query_params.get("reason", "")
        if dispatcher_note == "":
            dispatcher_note = request.query_params.get("dispatcher_note", "")

        if site_id is None or date is None or useful is None:
            raise HTTPException(status_code=400, detail="site_id, date, and useful are required")

        tracker = FeedbackTracker()
        feedback_id = tracker.add_feedback(
            site_id=site_id,
            date=date,
            useful=useful,
            reason=reason,
            note=dispatcher_note,
        )

        return {"status": "ok", "feedback_id": feedback_id}

    @app.get("/api/mytko/feedback_summary")
    def get_feedback_summary():
        """Get feedback summary by site."""
        from src.sites.feedback_tracker import FeedbackTracker

        tracker = FeedbackTracker()
        summary = tracker.get_summary()
        stats = tracker.get_stats()

        return {
            "summary": summary.to_dict(orient='records') if not summary.empty else [],
            "stats": stats,
        }

    @app.get("/api/mytko/rollout_recommendations")
    def get_rollout_recommendations():
        """Get sites recommended for rollout."""
        from src.sites.quality_score import QualityScorer
        from src.sites.rollout_recommender import RolloutRecommender
        from src.sites.metrics_tracker import MetricsTracker
        from src.sites.feedback_tracker import FeedbackTracker

        scorer = QualityScorer()
        recommender = RolloutRecommender()

        metrics_tracker = MetricsTracker()
        feedback_tracker = FeedbackTracker()

        site_metrics_df = metrics_tracker.get_latest_site_metrics()
        feedback_summary_df = feedback_tracker.get_summary()

        scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
        recommendations = recommender.get_recommendations(scores)
        summary = recommender.get_summary(recommendations)

        return {
            "recommendations": recommendations,
            "summary": summary,
        }

    @app.get("/api/mytko/district_readiness")
    def get_district_readiness():
        """Get readiness summary by district."""
        from src.sites.district_readiness import DistrictReadiness
        from src.sites.quality_score import QualityScorer
        from src.sites.metrics_tracker import MetricsTracker
        from src.sites.feedback_tracker import FeedbackTracker
        from src.sites.data_loader import load_registry

        scorer = QualityScorer()
        readiness_analyzer = DistrictReadiness()

        metrics_tracker = MetricsTracker()
        feedback_tracker = FeedbackTracker()

        site_metrics_df = metrics_tracker.get_latest_site_metrics()
        feedback_summary_df = feedback_tracker.get_summary()
        registry_df = load_registry()

        scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
        readiness = readiness_analyzer.compute_readiness(scores, registry_df)

        return {
            "readiness": readiness.to_dict(orient='records'),
            "csv_download_url": "/api/mytko/district_readiness/download",
        }

    @app.get("/api/mytko/district_readiness/download")
    def download_district_readiness():
        """Download district readiness as CSV."""
        from fastapi.responses import PlainTextResponse
        from src.sites.district_readiness import DistrictReadiness
        from src.sites.quality_score import QualityScorer
        from src.sites.metrics_tracker import MetricsTracker
        from src.sites.feedback_tracker import FeedbackTracker
        from src.sites.data_loader import load_registry

        scorer = QualityScorer()
        readiness_analyzer = DistrictReadiness()

        metrics_tracker = MetricsTracker()
        feedback_tracker = FeedbackTracker()

        site_metrics_df = metrics_tracker.get_latest_site_metrics()
        feedback_summary_df = feedback_tracker.get_summary()
        registry_df = load_registry()

        scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
        readiness = readiness_analyzer.compute_readiness(scores, registry_df)

        csv_body = readiness_analyzer.export_csv(readiness)
        return PlainTextResponse(
            csv_body,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=district_readiness.csv"},
        )

    # Include additional read-only routers (PR-18 / PR-17)
    try:
        from src.sites.api_context import ApiContext  # type: ignore
        from src.sites.api_site_forecast import get_router as get_site_forecast_router  # type: ignore
        app.include_router(get_site_forecast_router(ApiContext(
            sites_data_dir=SITES_DATA_DIR,
            deliveries_dir=DELIVERIES_DIR,
        )))
    except Exception:
        pass
    try:
        from src.sites.api_routes_forecast import router as routes_forecast_router  # type: ignore
        app.include_router(routes_forecast_router)
    except Exception:
        pass

    return app


# Uvicorn entrypoint: uvicorn scripts.api_app:app
app = create_app() if FastAPI is not None else None  # type: ignore
