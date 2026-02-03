"""
Rolling-cutoff forecast generator.

Wraps existing baseline.py and simulator.py to generate forecasts
with a rolling cutoff date. Supports caching for performance.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
import hashlib
import json
from typing import Optional

import pandas as pd

from .data_loader import load_data_bundle
from .baseline import estimate_weekday_rates
from .simulator import simulate_fill
from .forecast_cache import cache_exists, load_from_cache, save_to_cache
from .rolling_types import ForecastRequest, ForecastResult, MAX_CUTOFF_DATE


def validate_request(request: ForecastRequest) -> None:
    """
    Validate request parameters.

    Raises:
        ValueError: If cutoff_date > MAX_CUTOFF_DATE or horizon_days not in 1-365
    """
    if request.cutoff_date > MAX_CUTOFF_DATE:
        raise ValueError(f"cutoff_date cannot exceed {MAX_CUTOFF_DATE}")
    if not (1 <= request.horizon_days <= 365):
        raise ValueError("horizon_days must be 1-365")


def compute_accuracy_metrics(
    forecast_df: pd.DataFrame,
    service_df: pd.DataFrame,
    cutoff_date: date,
    horizon_days: int,
) -> tuple[pd.DataFrame, dict]:
    """
    Add actual values and compute accuracy metrics.

    Returns:
        (forecast_df with actuals, accuracy_summary dict)
    """
    if forecast_df.empty:
        return forecast_df, {
            "total_actual_m3": None,
            "accuracy_wape": None,
            "accuracy_coverage_pct": 0.0,
        }

    start = cutoff_date + timedelta(days=1)
    end = cutoff_date + timedelta(days=horizon_days)

    actuals = service_df[
        (service_df["service_dt"] >= start) &
        (service_df["service_dt"] <= end)
    ].groupby(["site_id", "service_dt"])["collect_volume_m3"].sum().reset_index()
    actuals["actual_m3"] = actuals["collect_volume_m3"]
    actuals = actuals.rename(columns={"service_dt": "date"})

    # Normalize dates for merge without mutating the original forecast date strings.
    forecast_df = forecast_df.copy()
    forecast_df["_merge_date"] = pd.to_datetime(forecast_df["date"], errors="coerce").dt.date
    actuals_keyed = actuals.rename(columns={"date": "_merge_date"})[["site_id", "_merge_date", "actual_m3"]]
    merged = forecast_df.merge(
        actuals_keyed,
        on=["site_id", "_merge_date"],
        how="left",
    )

    merged["error_pct"] = pd.NA
    merged["_pred_m3"] = merged["pred_volume_m3"]
    valid_rows = merged[merged["actual_m3"].notna()].copy()
    if not valid_rows.empty:
        valid_rows = valid_rows.sort_values(["site_id", "_merge_date"])
        pred_delta = valid_rows.groupby("site_id")["_pred_m3"].diff()
        pred_delta = pred_delta.fillna(valid_rows["_pred_m3"])
        valid_mask = valid_rows["actual_m3"] > 0
        if valid_mask.any():
            errors = (
                (pred_delta[valid_mask] - valid_rows.loc[valid_mask, "actual_m3"]).abs()
                / valid_rows.loc[valid_mask, "actual_m3"]
                * 100
            )
            merged.loc[valid_rows.loc[valid_mask].index, "error_pct"] = errors
        coverage_pct = (len(valid_rows) / len(merged) * 100) if len(merged) else 0.0
        actual_sum = valid_rows["actual_m3"].sum()
        error_sum = (pred_delta - valid_rows["actual_m3"]).abs().sum()
        wape = error_sum / actual_sum if actual_sum > 0 else 0.0
    else:
        coverage_pct = 0.0
        actual_sum = None
        wape = None

    summary = {
        "total_actual_m3": round(actual_sum, 2) if actual_sum is not None else None,
        "accuracy_wape": round(wape, 4) if wape is not None else None,
        "accuracy_coverage_pct": round(coverage_pct, 1),
    }

    merged = merged.drop(columns=["_pred_m3", "_merge_date"])
    return merged, summary


def build_cache_suffix(
    site_ids: Optional[list[str]],
    district_filter: str | None,
    search_term: str | None,
) -> str | None:
    filters: dict[str, object] = {}
    if site_ids:
        filters["site_ids"] = sorted({str(site_id) for site_id in site_ids})
    if district_filter:
        district_value = district_filter.strip().lower()
        if district_value:
            filters["district"] = district_value
    if search_term:
        search_value = search_term.strip().lower()
        if search_value:
            filters["search"] = search_value
    if not filters:
        return None
    payload = json.dumps(filters, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:12]
    return f"f{digest}"


def generate_rolling_forecast(
    request: ForecastRequest,
    use_cache: bool = True,
    window_days: int = 56,
    district_filter: str | None = None,
    search_term: str | None = None,
    apply_holiday_adjustments: bool = False,
    holiday_multiplier: float = 1.15,
    holiday_region: str | None = None,
) -> ForecastResult:
    """
    Generate forecast for all sites (or subset) using rolling cutoff.

    Pipeline:
    1. Validate request (cutoff <= MAX_CUTOFF_DATE, horizon in range)
    2. Check cache; return cached if exists and use_cache=True
    3. Load service data up to cutoff
    4. Compute weekday rates via baseline.estimate_weekday_rates(cutoff=cutoff)
    5. Simulate fill via simulator.simulate_fill(start, end)
    6. Filter by site_ids if provided
    7. Filter by district if provided
    8. Filter by search term if provided
    9. Cache result
    10. Return ForecastResult

    Args:
        request: ForecastRequest with cutoff_date, horizon_days, optional site_ids
        use_cache: If True, check/use cache
        window_days: Training window for rate estimation (default 56)
        district_filter: Optional district name (case-insensitive, startswith match)
        search_term: Optional search term (case-insensitive, contains match)
        apply_holiday_adjustments: When True, adjust weekday rates on holidays
        holiday_multiplier: Multiplier for holiday weekdays
        holiday_region: Optional region for holiday lookup

    Returns:
        ForecastResult with forecast DataFrame and metadata
    """
    # 1. Validate request
    validate_request(request)

    # Compute date range
    cutoff = request.cutoff_date
    start = cutoff + timedelta(days=1)
    end = start + timedelta(days=request.horizon_days - 1)
    cache_suffix = build_cache_suffix(request.site_ids, district_filter, search_term)

    # 2. Check cache
    if use_cache and cache_exists(cutoff, start, end, cache_suffix=cache_suffix):
        cached_df = load_from_cache(cutoff, start, end, cache_suffix=cache_suffix)
        if cached_df is not None:
            # Filter by site_ids if provided
            if request.site_ids is not None:
                site_set = set(str(s) for s in request.site_ids)
                cached_df = cached_df[cached_df["site_id"].isin(site_set)]

            registry = None
            if district_filter or search_term:
                registry = load_data_bundle(
                    start_date=None,
                    end_date=cutoff,
                ).registry_df

            # Filter by district if provided
            if district_filter:
                district_filter_lower = district_filter.lower()
                matching_sites = registry[
                    registry['district'].str.lower().str.startswith(district_filter_lower, na=False)
                ]['site_id'].tolist()
                cached_df = cached_df[cached_df['site_id'].isin(matching_sites)]

            # Filter by search term if provided
            if search_term:
                search_lower = search_term.lower()
                match_mask = registry["site_id"].str.lower().str.contains(search_lower, na=False)
                if "address" in registry.columns:
                    match_mask |= registry["address"].str.lower().str.contains(search_lower, na=False)
                matching_sites = registry[match_mask]["site_id"].tolist()
                cached_df = cached_df[cached_df["site_id"].isin(matching_sites)]

            site_count = cached_df["site_id"].nunique() if not cached_df.empty else 0
            return ForecastResult(
                cutoff_date=cutoff,
                start_date=start,
                end_date=end,
                site_count=site_count,
                forecast_df=cached_df,
                generated_at=datetime.now().isoformat(),
                cached=True,
            )

    # 3. Load service data up to cutoff
    bundle = load_data_bundle(
        start_date=None,
        end_date=cutoff,
        site_ids=request.site_ids,
    )

    service_df = bundle.service_df
    registry_df = bundle.registry_df

    # If no data, return empty result
    if service_df.empty:
        return ForecastResult(
            cutoff_date=cutoff,
            start_date=start,
            end_date=end,
            site_count=0,
            forecast_df=pd.DataFrame(
                columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
            ),
            generated_at=datetime.now().isoformat(),
            cached=False,
        )

    # 4. Compute weekday rates
    rates = estimate_weekday_rates(
        service_df,
        cutoff=cutoff,
        window_days=window_days,
        min_obs=4,
    )

    if apply_holiday_adjustments:
        from .holiday_calendar import adjust_baseline_for_holidays

        forecast_dates = [start + timedelta(days=i) for i in range(request.horizon_days)]
        rates = adjust_baseline_for_holidays(
            rates,
            forecast_dates,
            multiplier=holiday_multiplier,
            region=holiday_region,
        )

    # 5. Simulate fill
    forecast_df = simulate_fill(
        site_registry=registry_df,
        weekday_rates=rates,
        start_dt=start,
        end_dt=end,
        capacity_liters=1100,
        overflow_threshold=0.8,
    )

    # 6. Filter by site_ids if provided (in case load_data_bundle didn't do full filtering)
    if request.site_ids is not None and not forecast_df.empty:
        site_set = set(str(s) for s in request.site_ids)
        forecast_df = forecast_df[forecast_df["site_id"].isin(site_set)]

    # 7. Filter by district if provided
    if district_filter and not forecast_df.empty:
        district_filter_lower = district_filter.lower()
        matching_sites = registry_df[
            registry_df['district'].str.lower().str.startswith(district_filter_lower, na=False)
        ]['site_id'].tolist()
        forecast_df = forecast_df[forecast_df['site_id'].isin(matching_sites)]

    # 8. Filter by search term if provided
    if search_term and not forecast_df.empty:
        search_lower = search_term.lower()
        match_mask = registry_df["site_id"].str.lower().str.contains(search_lower, na=False)
        if "address" in registry_df.columns:
            match_mask |= registry_df["address"].str.lower().str.contains(search_lower, na=False)
        matching_sites = registry_df[match_mask]["site_id"].tolist()
        forecast_df = forecast_df[forecast_df["site_id"].isin(matching_sites)]

    # 9. Cache result
    site_count = forecast_df["site_id"].nunique() if not forecast_df.empty else 0
    if not forecast_df.empty:
        save_to_cache(
            forecast_df,
            cutoff=cutoff,
            start=start,
            end=end,
            site_count=site_count,
            cache_suffix=cache_suffix,
        )

    # 10. Return result
    return ForecastResult(
        cutoff_date=cutoff,
        start_date=start,
        end_date=end,
        site_count=site_count,
        forecast_df=forecast_df,
        generated_at=datetime.now().isoformat(),
        cached=False,
    )
