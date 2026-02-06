from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
import sys
from typing import Iterable

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
FORECASTING_ROOT = ROOT / "projects/forecastingrepo"
sys.path.insert(0, str(FORECASTING_ROOT))

from src.sites.baseline import estimate_weekday_rates
from src.sites.data_loader import load_registry, load_service_data
from src.sites.simulator import simulate_fill


CUTOFF = date(2024, 10, 31)
HORIZON = 212
FORECAST_START = CUTOFF + timedelta(days=1)
FORECAST_END = FORECAST_START + timedelta(days=HORIZON - 1)
WINDOW_DAYS = 84
WINDOW_START = CUTOFF - timedelta(days=WINDOW_DAYS - 1)
WINDOW_DAYS_ALT = 365
WINDOW_START_ALT = CUTOFF - timedelta(days=WINDOW_DAYS_ALT - 1)
MIN_OBS = 4

REPORT_PATH = Path("reports/bias_investigation_20260112/agent_task3_medium_tier.md")


@dataclass
class SegmentMetrics:
    bias_pct: float
    wape_pct: float
    total_actual: float
    total_forecast: float
    site_count: int


def _tier_from_per30(value: float) -> str:
    if value < 10:
        return "small"
    if value <= 100:
        return "medium"
    return "large"


def _ensure_datetime(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def _events_per_week(event_counts: pd.Series) -> pd.Series:
    return event_counts / (HORIZON / 7.0)


def _bucket_counts(values: pd.Series, buckets: Iterable[tuple[str, float, float | None]]) -> dict[str, float]:
    out: dict[str, float] = {}
    total = len(values)
    for label, low, high in buckets:
        if high is None:
            mask = values >= low
        else:
            mask = (values >= low) & (values < high)
        out[label] = float(mask.sum()) / total * 100 if total else 0.0
    return out


def _weekday_event_coverage(train_df: pd.DataFrame, min_obs: int) -> pd.DataFrame:
    counts = (
        train_df
        .assign(weekday=train_df["service_dt"].dt.weekday)
        .groupby(["site_id", "weekday"])  # event counts per weekday
        .size()
        .reset_index(name="event_count")
    )
    coverage = counts[counts["event_count"] >= min_obs].groupby("site_id")["weekday"].nunique()
    return coverage.rename("weekdays_ge_min_obs").reset_index()


def _weekday_interval_counts(service_df: pd.DataFrame, window_start: date, cutoff: date) -> pd.DataFrame:
    rows = []
    sdf = service_df.copy()
    sdf["service_dt"] = pd.to_datetime(sdf["service_dt"]).dt.date

    for site_id, g in sdf.groupby("site_id"):
        g = g[(g["service_dt"] >= window_start) & (g["service_dt"] <= cutoff)]
        if g.empty:
            continue
        g = g.sort_values("service_dt")
        counts = {weekday: 0 for weekday in range(7)}
        prev_dt = None
        for dt in g["service_dt"].tolist():
            if prev_dt is None:
                gap = (dt - window_start).days
                default_gap = max(1, gap) if gap > 0 else 1
                for i in range(default_gap, 0, -1):
                    d = dt - timedelta(days=i)
                    counts[d.weekday()] += 1
                prev_dt = dt
                continue
            delta = (dt - prev_dt).days
            if delta <= 0:
                prev_dt = dt
                continue
            for i in range(1, delta + 1):
                d = prev_dt + timedelta(days=i)
                counts[d.weekday()] += 1
            prev_dt = dt
        for weekday, count in counts.items():
            rows.append((site_id, weekday, count))

    return pd.DataFrame(rows, columns=["site_id", "weekday", "day_count"])


def _classify_smoothing(counts_df: pd.DataFrame, min_obs: int) -> pd.DataFrame:
    def classify_row(row: pd.Series) -> str:
        if row["day_count"] >= min_obs:
            return "own"
        for offset in (1, -1, 2, -2):
            neighbor = (row["weekday"] + offset) % 7
            neighbor_count = row["neighbor_counts"].get(neighbor, 0)
            if neighbor_count >= min_obs:
                return "neighbor"
        return "overall"

    grouped = counts_df.groupby("site_id")
    rows = []
    for site_id, g in grouped:
        counts_map = g.set_index("weekday")["day_count"].to_dict()
        for _, row in g.iterrows():
            rows.append(
                {
                    "site_id": site_id,
                    "weekday": int(row["weekday"]),
                    "day_count": int(row["day_count"]),
                    "neighbor_counts": counts_map,
                }
            )
    out = pd.DataFrame(rows)
    out["smooth_source"] = out.apply(classify_row, axis=1)
    return out.drop(columns=["neighbor_counts"])


def _estimate_weekday_rates_blend(
    service_df: pd.DataFrame,
    cutoff: date,
    window_days: int,
    min_obs: int,
) -> pd.DataFrame:
    if service_df.empty:
        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype(
            {"weekday": int, "rate_m3_per_day": float}
        )

    start = cutoff - timedelta(days=window_days - 1)
    sdf = service_df.copy()
    sdf["service_dt"] = pd.to_datetime(sdf["service_dt"]).dt.date
    sdf = sdf.sort_values(["site_id", "service_dt"])

    rows = []
    per_site_event_rates: dict[str, list[float]] = {}
    for site_id, g in sdf.groupby("site_id"):
        g = g[(g["service_dt"] >= start) & (g["service_dt"] <= cutoff)]
        if g.empty:
            continue
        prev_dt = None
        for _, r in g.iterrows():
            dt = r["service_dt"]
            volume = r.get("collect_volume_m3")
            try:
                volume = float(volume) if volume is not None else None
            except Exception:
                volume = None
            if prev_dt is None:
                gap = (dt - start).days
                default_gap = max(1, gap) if gap > 0 else 1
                if volume is None:
                    prev_dt = dt
                    continue
                rate = volume / float(default_gap)
                per_site_event_rates.setdefault(str(site_id), []).append(rate)
                for i in range(default_gap, 0, -1):
                    d = dt - timedelta(days=i)
                    rows.append((site_id, d.weekday(), rate))
                prev_dt = dt
                continue
            delta = (dt - prev_dt).days
            if delta <= 0:
                prev_dt = dt
                continue
            if volume is None:
                prev_dt = dt
                continue
            rate = volume / float(delta)
            per_site_event_rates.setdefault(str(site_id), []).append(rate)
            for i in range(1, delta + 1):
                d = prev_dt + timedelta(days=i)
                rows.append((site_id, d.weekday(), rate))
            prev_dt = dt

    if not rows:
        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype(
            {"weekday": int, "rate_m3_per_day": float}
        )

    df = pd.DataFrame(rows, columns=["site_id", "weekday", "rate"])
    overall_items = []
    for sid, rates_list in per_site_event_rates.items():
        if rates_list:
            overall_items.append((sid, sum(rates_list) / len(rates_list)))
    overall = (
        pd.DataFrame(overall_items, columns=["site_id", "overall"])
        if overall_items
        else pd.DataFrame(columns=["site_id", "overall"])
    )
    agg = df.groupby(["site_id", "weekday"]).agg(sum_r=("rate", "sum"), cnt=("rate", "count")).reset_index()
    agg = agg.merge(overall, on="site_id", how="left")
    agg["overall"] = agg["overall"].fillna(0.0)

    smoothed_rows = []
    for site_id, site_df in agg.groupby("site_id"):
        counts = site_df.set_index("weekday")["cnt"].to_dict()
        weekday_rates = (site_df.set_index("weekday")["sum_r"] / site_df.set_index("weekday")["cnt"]).to_dict()
        overall_mean = float(site_df["overall"].iloc[0]) if not site_df["overall"].isna().all() else 0.0
        for weekday in range(7):
            if counts.get(weekday, 0) >= min_obs and weekday in weekday_rates:
                rate = weekday_rates[weekday]
            else:
                neighbor_rate = None
                for offset in (1, -1, 2, -2):
                    neighbor = (weekday + offset) % 7
                    if counts.get(neighbor, 0) >= min_obs and neighbor in weekday_rates:
                        neighbor_rate = weekday_rates[neighbor]
                        break
                if neighbor_rate is None:
                    rate = overall_mean
                else:
                    rate = 0.5 * neighbor_rate + 0.5 * overall_mean
            smoothed_rows.append((site_id, weekday, rate))

    return pd.DataFrame(smoothed_rows, columns=["site_id", "weekday", "rate_m3_per_day"])


def _compute_daily_forecast(forecast_df: pd.DataFrame) -> pd.DataFrame:
    fc = forecast_df.copy()
    fc["site_id"] = fc["site_id"].astype(str)
    fc["date"] = _ensure_datetime(fc["date"])
    fc = fc.sort_values(["site_id", "date"])
    fc["forecast_m3"] = (
        fc.groupby("site_id")["pred_volume_m3"]
        .diff()
        .fillna(fc["pred_volume_m3"])
        .clip(lower=0)
    )
    return fc[["site_id", "date", "forecast_m3"]]


def _evaluate_segment(
    forecast_df: pd.DataFrame,
    actual_df: pd.DataFrame,
    site_ids: list[str],
) -> SegmentMetrics:
    if not site_ids:
        return SegmentMetrics(0.0, 0.0, 0.0, 0.0, 0)
    fc = forecast_df[forecast_df["site_id"].isin(site_ids)]
    merged = fc.merge(actual_df[actual_df["site_id"].isin(site_ids)], on=["site_id", "date"], how="inner")
    total_forecast = merged["forecast_m3"].sum()
    total_actual = merged["actual_m3"].sum()
    if total_actual == 0:
        return SegmentMetrics(0.0, 0.0, total_actual, total_forecast, len(site_ids))
    bias_pct = (total_forecast - total_actual) / total_actual * 100
    wape_pct = (merged["forecast_m3"].sub(merged["actual_m3"]).abs().sum() / total_actual) * 100
    return SegmentMetrics(bias_pct, wape_pct, total_actual, total_forecast, len(site_ids))


def _run_variant_forecast(
    service_df: pd.DataFrame,
    registry_df: pd.DataFrame,
    site_ids: list[str],
    window_days: int,
    min_obs: int,
    smoothing: str = "baseline",
) -> pd.DataFrame:
    svc = service_df[service_df["site_id"].isin(site_ids)].copy()
    reg = registry_df[registry_df["site_id"].isin(site_ids)].copy()
    if smoothing == "baseline":
        rates = estimate_weekday_rates(svc, cutoff=CUTOFF, window_days=window_days, min_obs=min_obs)
    elif smoothing == "blend":
        rates = _estimate_weekday_rates_blend(svc, cutoff=CUTOFF, window_days=window_days, min_obs=min_obs)
    else:
        raise ValueError(f"Unknown smoothing={smoothing}")

    forecast_df = simulate_fill(
        site_registry=reg,
        weekday_rates=rates,
        start_dt=FORECAST_START,
        end_dt=FORECAST_END,
        capacity_liters=1100,
        overflow_threshold=0.8,
    )
    return forecast_df


def _format_percent(value: float, decimals: int = 1) -> str:
    return f"{value:.{decimals}f}%"


def _format_float(value: float, decimals: int = 2) -> str:
    return f"{value:.{decimals}f}"


def _month_label(ts: pd.Timestamp) -> str:
    return ts.strftime("%Y-%m")


def main() -> None:
    print("Loading service and registry data...")
    service_df = load_service_data(
        start_date=None,
        end_date=FORECAST_END,
        service_path=FORECASTING_ROOT / "data/sites_service.csv",
    )
    registry_df = load_registry(registry_path=FORECASTING_ROOT / "data/sites_registry.csv")
    service_df["site_id"] = service_df["site_id"].astype(str)
    registry_df["site_id"] = registry_df["site_id"].astype(str)
    service_df["service_dt"] = _ensure_datetime(service_df["service_dt"])

    svc_pre_cutoff = service_df[service_df["service_dt"] <= pd.Timestamp(CUTOFF)]
    all_sites = sorted(svc_pre_cutoff["site_id"].unique().tolist())

    # Tiering based on pre-cutoff volumes
    train_84 = service_df[(service_df["service_dt"] >= pd.Timestamp(WINDOW_START)) & (service_df["service_dt"] <= pd.Timestamp(CUTOFF))]
    vol_84 = train_84.groupby("site_id")["collect_volume_m3"].sum()
    train_365 = service_df[(service_df["service_dt"] >= pd.Timestamp(WINDOW_START_ALT)) & (service_df["service_dt"] <= pd.Timestamp(CUTOFF))]
    vol_365 = train_365.groupby("site_id")["collect_volume_m3"].sum()

    tier_df = pd.DataFrame({"site_id": all_sites})
    tier_df["per30_84"] = tier_df["site_id"].map(vol_84).fillna(0.0) / WINDOW_DAYS * 30
    tier_df["per30_365"] = tier_df["site_id"].map(vol_365).fillna(0.0) / WINDOW_DAYS_ALT * 30
    tier_df["tier_84"] = tier_df["per30_84"].apply(_tier_from_per30)
    tier_df["tier_365"] = tier_df["per30_365"].apply(_tier_from_per30)

    medium_ids = tier_df.loc[tier_df["tier_84"] == "medium", "site_id"].tolist()
    large_ids = tier_df.loc[tier_df["tier_84"] == "large", "site_id"].tolist()
    baseline_site_ids = sorted(set(medium_ids + large_ids))

    tier_shift = (tier_df["tier_84"] != tier_df["tier_365"]).mean() * 100

    # Actuals in forecast window
    actual_df = service_df[(service_df["service_dt"] >= pd.Timestamp(FORECAST_START)) & (service_df["service_dt"] <= pd.Timestamp(FORECAST_END))]
    actual_daily = (
        actual_df
        .groupby(["site_id", "service_dt"])  # one event per day
        ["collect_volume_m3"].sum()
        .reset_index()
        .rename(columns={"service_dt": "date", "collect_volume_m3": "actual_m3"})
    )
    actual_daily["date"] = _ensure_datetime(actual_daily["date"])

    # Frequency distribution
    event_counts = actual_df.groupby("site_id").size()
    events_per_week = _events_per_week(event_counts)
    freq_df = tier_df.set_index("site_id").join(events_per_week.rename("events_per_week"), how="left").fillna(0.0)

    freq_summary = {}
    for tier in ["medium", "large"]:
        subset = freq_df[freq_df["tier_84"] == tier]["events_per_week"]
        freq_summary[tier] = {
            "median": float(subset.median()) if not subset.empty else 0.0,
            "p25": float(subset.quantile(0.25)) if not subset.empty else 0.0,
            "p75": float(subset.quantile(0.75)) if not subset.empty else 0.0,
            "buckets": _bucket_counts(
                subset,
                [
                    ("<1/wk", 0.0, 1.0),
                    ("1-3/wk", 1.0, 3.0),
                    ("3+/wk", 3.0, None),
                ],
            ),
        }

    # Weekday coverage (event-based, for context)
    event_weekday_coverage = _weekday_event_coverage(train_84, MIN_OBS)
    event_coverage_df = tier_df.merge(event_weekday_coverage, on="site_id", how="left").fillna({"weekdays_ge_min_obs": 0})

    event_coverage_summary = {}
    for tier in ["medium", "large"]:
        subset = event_coverage_df[event_coverage_df["tier_84"] == tier]["weekdays_ge_min_obs"]
        event_coverage_summary[tier] = {
            "median": float(subset.median()) if not subset.empty else 0.0,
            "p25": float(subset.quantile(0.25)) if not subset.empty else 0.0,
            "p75": float(subset.quantile(0.75)) if not subset.empty else 0.0,
            "share_lt3": float((subset < 3).mean() * 100) if not subset.empty else 0.0,
            "share_lt5": float((subset < 5).mean() * 100) if not subset.empty else 0.0,
        }

    # Gap stats in forecast window
    gap_rows = []
    for site_id, g in actual_daily.groupby("site_id"):
        dates = g["date"].sort_values().tolist()
        if not dates:
            continue
        deltas = np.diff([d.toordinal() for d in dates])
        event_count = len(dates)
        mean_gap = float(np.mean(deltas)) if len(deltas) > 0 else np.nan
        median_gap = float(np.median(deltas)) if len(deltas) > 0 else np.nan
        total_vol = float(g["actual_m3"].sum())
        avg_vol_event = total_vol / event_count if event_count else np.nan
        gap_rows.append(
            {
                "site_id": site_id,
                "event_count": event_count,
                "mean_gap": mean_gap,
                "median_gap": median_gap,
                "avg_vol_event": avg_vol_event,
            }
        )
    gap_df = pd.DataFrame(gap_rows)

    def gap_bucket(mean_gap: float, event_count: int) -> str:
        if event_count <= 1 or np.isnan(mean_gap):
            return "single_event"
        if mean_gap < 3:
            return "<3d"
        if mean_gap < 7:
            return "3-7d"
        if mean_gap < 14:
            return "7-14d"
        if mean_gap < 28:
            return "14-28d"
        return "28d+"

    if not gap_df.empty:
        gap_df["gap_bucket"] = gap_df.apply(lambda r: gap_bucket(r["mean_gap"], r["event_count"]), axis=1)
        gap_df = gap_df.merge(tier_df[["site_id", "tier_84"]], on="site_id", how="left")

    # Baseline forecast (no cache), aligns with variant path.
    print("Computing baseline forecast (no cache)...")
    baseline_forecast_df = _run_variant_forecast(
        service_df,
        registry_df,
        baseline_site_ids,
        window_days=WINDOW_DAYS,
        min_obs=MIN_OBS,
        smoothing="baseline",
    )
    baseline_daily = _compute_daily_forecast(baseline_forecast_df)

    baseline_medium = _evaluate_segment(baseline_daily, actual_daily, medium_ids)
    baseline_large = _evaluate_segment(baseline_daily, actual_daily, large_ids)

    # Seasonal ratios (baseline)
    baseline_join = baseline_daily.merge(actual_daily, on=["site_id", "date"], how="inner")
    baseline_join["month"] = baseline_join["date"].dt.to_period("M").dt.to_timestamp()
    baseline_join = baseline_join.merge(tier_df[["site_id", "tier_84"]], on="site_id", how="left")

    monthly_rows = []
    for tier in ["medium", "large"]:
        sub = baseline_join[baseline_join["tier_84"] == tier]
        grouped = sub.groupby("month").agg(actual=("actual_m3", "sum"), forecast=("forecast_m3", "sum"))
        for month, row in grouped.iterrows():
            actual = float(row["actual"])
            forecast = float(row["forecast"])
            ratio = forecast / actual if actual else 0.0
            bias_pct = (forecast - actual) / actual * 100 if actual else 0.0
            monthly_rows.append(
                {
                    "tier": tier,
                    "month": _month_label(month),
                    "actual": actual,
                    "forecast": forecast,
                    "ratio": ratio,
                    "bias_pct": bias_pct,
                }
            )
    monthly_df = pd.DataFrame(monthly_rows)

    # Smoothing usage
    print("Computing smoothing usage...")
    interval_counts = _weekday_interval_counts(service_df, WINDOW_START, CUTOFF)
    interval_coverage = (
        interval_counts[interval_counts["day_count"] >= MIN_OBS]
        .groupby("site_id")["weekday"]
        .nunique()
        .rename("weekdays_ge_min_obs_days")
        .reset_index()
    )
    interval_coverage_df = tier_df.merge(interval_coverage, on="site_id", how="left").fillna({"weekdays_ge_min_obs_days": 0})

    interval_coverage_summary = {}
    for tier in ["medium", "large"]:
        subset = interval_coverage_df[interval_coverage_df["tier_84"] == tier]["weekdays_ge_min_obs_days"]
        interval_coverage_summary[tier] = {
            "median": float(subset.median()) if not subset.empty else 0.0,
            "p25": float(subset.quantile(0.25)) if not subset.empty else 0.0,
            "p75": float(subset.quantile(0.75)) if not subset.empty else 0.0,
            "share_lt3": float((subset < 3).mean() * 100) if not subset.empty else 0.0,
            "share_lt5": float((subset < 5).mean() * 100) if not subset.empty else 0.0,
        }
    smoothing_df = _classify_smoothing(interval_counts, MIN_OBS)
    smoothing_df = smoothing_df.merge(tier_df[["site_id", "tier_84"]], on="site_id", how="left")

    smoothing_summary = (
        smoothing_df
        .groupby(["tier_84", "smooth_source"]).size()
        .reset_index(name="count")
    )
    smoothing_total = smoothing_df.groupby("tier_84").size().rename("total")
    smoothing_summary = smoothing_summary.merge(smoothing_total, on="tier_84", how="left")
    smoothing_summary["share_pct"] = smoothing_summary["count"] / smoothing_summary["total"] * 100

    # Variant forecasts for medium tier
    print("Running medium-tier variants...")
    variants = []
    variant_specs = [
        ("baseline_84_4", 84, 4, "baseline"),
        ("window_112_4", 112, 4, "baseline"),
        ("minobs_84_6", 84, 6, "baseline"),
        ("blend_84_4", 84, 4, "blend"),
    ]

    for name, window_days, min_obs, smoothing in variant_specs:
        if name == "baseline_84_4":
            metrics = baseline_medium
        else:
            forecast_df = _run_variant_forecast(
                service_df,
                registry_df,
                medium_ids,
                window_days=window_days,
                min_obs=min_obs,
                smoothing=smoothing,
            )
            forecast_daily = _compute_daily_forecast(forecast_df)
            metrics = _evaluate_segment(forecast_daily, actual_daily, medium_ids)
        variants.append(
            {
                "variant": name,
                "window_days": window_days,
                "min_obs": min_obs,
                "smoothing": smoothing,
                "bias_pct": metrics.bias_pct,
                "wape_pct": metrics.wape_pct,
            }
        )

    variants_df = pd.DataFrame(variants)

    # Gap bucket bias summary
    gap_bias_rows = []
    if not gap_df.empty:
        site_totals = (
            baseline_daily
            .merge(actual_daily, on=["site_id", "date"], how="inner")
            .groupby("site_id")
            .agg(actual=("actual_m3", "sum"), forecast=("forecast_m3", "sum"))
            .reset_index()
        )
        gap_metrics = gap_df.merge(site_totals, on="site_id", how="left")
        gap_metrics = gap_metrics[gap_metrics["tier_84"].isin(["medium", "large"])]
        grouped = gap_metrics.groupby(["tier_84", "gap_bucket"]).agg(
            site_count=("site_id", "nunique"),
            actual=("actual", "sum"),
            forecast=("forecast", "sum"),
        )
        tier_actual_totals = gap_metrics.groupby("tier_84")["actual"].sum().to_dict()
        for (tier, bucket), row in grouped.iterrows():
            actual = float(row["actual"])
            forecast = float(row["forecast"])
            bias_pct = (forecast - actual) / actual * 100 if actual else 0.0
            actual_total = float(tier_actual_totals.get(tier, 0.0))
            actual_share_pct = actual / actual_total * 100 if actual_total else 0.0
            gap_bias_rows.append(
                {
                    "tier": tier,
                    "gap_bucket": bucket,
                    "site_count": int(row["site_count"]),
                    "actual_share_pct": actual_share_pct,
                    "actual": actual,
                    "forecast": forecast,
                    "bias_pct": bias_pct,
                }
            )
    gap_bias_df = pd.DataFrame(gap_bias_rows)

    # Select recommended variant
    baseline_row = variants_df[variants_df["variant"] == "baseline_84_4"].iloc[0]
    variants_df["bias_improvement_pp"] = variants_df["bias_pct"] - baseline_row["bias_pct"]
    variants_df["wape_change_pp"] = variants_df["wape_pct"] - baseline_row["wape_pct"]

    candidates = variants_df[(variants_df["variant"] != "baseline_84_4")]
    candidates = candidates[(candidates["bias_improvement_pp"] >= 2.0) & (candidates["wape_change_pp"] <= 0.5)]
    best_variant = None
    if not candidates.empty:
        best_variant = candidates.sort_values("bias_improvement_pp", ascending=False).iloc[0]

    # Calibration multiplier (fallback)
    calibration_multiplier = None
    if baseline_medium.total_forecast > 0:
        calibration_multiplier = baseline_medium.total_actual / baseline_medium.total_forecast

    # Write report
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    def table_from_df(df: pd.DataFrame, columns: list[str]) -> str:
        header = "| " + " | ".join(columns) + " |"
        sep = "|" + "|".join(["---"] * len(columns)) + "|"
        rows = []
        for _, row in df.iterrows():
            rows.append("| " + " | ".join(str(row[col]) for col in columns) + " |")
        return "\n".join([header, sep] + rows)

    freq_rows = []
    for tier, stats in freq_summary.items():
        freq_rows.append(
            {
                "tier": tier,
                "median_ev_wk": _format_float(stats["median"], 2),
                "p25": _format_float(stats["p25"], 2),
                "p75": _format_float(stats["p75"], 2),
                "<1/wk": _format_percent(stats["buckets"]["<1/wk"], 1),
                "1-3/wk": _format_percent(stats["buckets"]["1-3/wk"], 1),
                "3+/wk": _format_percent(stats["buckets"]["3+/wk"], 1),
            }
        )
    freq_table = table_from_df(pd.DataFrame(freq_rows), ["tier", "median_ev_wk", "p25", "p75", "<1/wk", "1-3/wk", "3+/wk"])

    event_coverage_rows = []
    for tier, stats in event_coverage_summary.items():
        event_coverage_rows.append(
            {
                "tier": tier,
                "median_weekdays": _format_float(stats["median"], 1),
                "p25": _format_float(stats["p25"], 1),
                "p75": _format_float(stats["p75"], 1),
                "<3 days": _format_percent(stats["share_lt3"], 1),
                "<5 days": _format_percent(stats["share_lt5"], 1),
            }
        )
    event_coverage_table = table_from_df(
        pd.DataFrame(event_coverage_rows),
        ["tier", "median_weekdays", "p25", "p75", "<3 days", "<5 days"],
    )

    interval_coverage_rows = []
    for tier, stats in interval_coverage_summary.items():
        interval_coverage_rows.append(
            {
                "tier": tier,
                "median_weekdays": _format_float(stats["median"], 1),
                "p25": _format_float(stats["p25"], 1),
                "p75": _format_float(stats["p75"], 1),
                "<3 days": _format_percent(stats["share_lt3"], 1),
                "<5 days": _format_percent(stats["share_lt5"], 1),
            }
        )
    interval_coverage_table = table_from_df(
        pd.DataFrame(interval_coverage_rows),
        ["tier", "median_weekdays", "p25", "p75", "<3 days", "<5 days"],
    )

    monthly_display = monthly_df.copy()
    monthly_display["ratio"] = monthly_display["ratio"].apply(lambda v: _format_float(v, 2))
    monthly_display["bias_pct"] = monthly_display["bias_pct"].apply(lambda v: _format_percent(v, 1))
    monthly_table = table_from_df(
        monthly_display.sort_values(["tier", "month"]),
        ["tier", "month", "ratio", "bias_pct"],
    )

    smoothing_rows = []
    for tier in ["medium", "large"]:
        tier_rows = smoothing_summary[smoothing_summary["tier_84"] == tier]
        for _, row in tier_rows.iterrows():
            smoothing_rows.append(
                {
                    "tier": tier,
                    "source": row["smooth_source"],
                    "share_pct": _format_percent(row["share_pct"], 1),
                }
            )
    smoothing_table = table_from_df(pd.DataFrame(smoothing_rows), ["tier", "source", "share_pct"])

    variants_display = variants_df.copy()
    variants_display["bias_pct"] = variants_display["bias_pct"].apply(lambda v: _format_percent(v, 1))
    variants_display["wape_pct"] = variants_display["wape_pct"].apply(lambda v: _format_percent(v, 1))
    variants_display["bias_improvement_pp"] = variants_display["bias_improvement_pp"].apply(lambda v: _format_float(v, 1))
    variants_display["wape_change_pp"] = variants_display["wape_change_pp"].apply(lambda v: _format_float(v, 1))
    variants_table = table_from_df(
        variants_display,
        ["variant", "window_days", "min_obs", "smoothing", "bias_pct", "wape_pct", "bias_improvement_pp", "wape_change_pp"],
    )

    gap_table = ""
    if not gap_bias_df.empty:
        gap_display = gap_bias_df.copy()
        gap_display["bias_pct"] = gap_display["bias_pct"].apply(lambda v: _format_percent(v, 1))
        gap_display["actual_share_pct"] = gap_display["actual_share_pct"].apply(lambda v: _format_percent(v, 1))
        gap_table = table_from_df(
            gap_display.sort_values(["tier", "gap_bucket"]),
            ["tier", "gap_bucket", "site_count", "actual_share_pct", "bias_pct"],
        )

    recommendation_lines = []
    if best_variant is not None:
        recommendation_lines.append(
            f"Adopt `{best_variant['variant']}` for medium tier: bias improves by {best_variant['bias_improvement_pp']:.1f}pp "
            f"with WAPE change {best_variant['wape_change_pp']:.1f}pp (baseline medium bias {baseline_medium.bias_pct:.1f}%)."
        )
    else:
        recommendation_lines.append("No variant met the >2pp bias improvement and <=0.5pp WAPE change rule.")
        if calibration_multiplier is not None:
            recommendation_lines.append(
                f"Fallback: apply a medium-tier calibration multiplier of {calibration_multiplier:.3f} "
                f"(brings baseline medium bias toward zero)."
            )

    report_lines = [
        "# Task 3: Medium-tier KP Tuning",
        "",
        "## Setup",
        f"- Cutoff: {CUTOFF}",
        f"- Horizon: {HORIZON} days ({FORECAST_START} to {FORECAST_END})",
        f"- Tiering window: {WINDOW_DAYS} days pre-cutoff (sensitivity {WINDOW_DAYS_ALT}d)",
        f"- Tier stability (84d vs 365d): {tier_shift:.1f}% of sites changed tiers",
        "",
        "## Diagnostics",
        "### Collection frequency (events/week, forecast window)",
        freq_table,
        "",
        "### Weekday coverage in training window (event counts, >=4 events per weekday)",
        event_coverage_table,
        "",
        "### Weekday coverage in training window (interval-day counts, >=4 days per weekday)",
        interval_coverage_table,
        "",
        "### Gap-length vs bias (baseline)",
        gap_table or "(insufficient data)",
        "",
        "### Seasonality (baseline monthly forecast/actual ratio)",
        monthly_table,
        "",
        "### Smoothing usage (baseline, interval-day counts)",
        smoothing_table,
        "",
        "## Medium-tier variants (bias/WAPE)",
        variants_table,
        "",
        "## Baseline reference (large tier)",
        f"- Large tier bias: {baseline_large.bias_pct:.1f}%",
        f"- Large tier WAPE: {baseline_large.wape_pct:.1f}%",
        "",
        "## Recommendation",
        *[f"- {line}" for line in recommendation_lines],
        "",
        "## Notes",
        "- Tiering uses pre-cutoff history (84d). Sensitivity to 365d noted in setup.",
        "- Baseline forecast recomputed without cache using estimate_weekday_rates + simulate_fill (84d/4).",
        "- Event-based weekday coverage is included for context; min_obs is evaluated on interval-day counts in the baseline logic.",
    ]

    REPORT_PATH.write_text("\n".join(report_lines))
    print(f"Report written to {REPORT_PATH}")


if __name__ == "__main__":
    main()
