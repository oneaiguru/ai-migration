## Metadata
- Task: Hard switch to m3 column names and units (collect_volume_m3 / pred_volume_m3)
- Discovery: docs/Tasks/UNITS_M3_SWITCH_DISCOVERY.md
- Related docs: docs/data/SITE_DATA_CONTRACT.md, docs/data/QUERY_PATTERNS.md, docs/data/DATA_CONTRACTS.md, docs/System/API_Endpoints.md, docs/api/openapi.json, docs/Tasks/PR-API-Sites-v1.md, docs/Tasks/PR-17_routes_forecast_be.md, docs/Tasks/PR-18_site_forecast_be.md, docs/Tasks/PR-19_volume_first_fillpct_be.md, docs/Tasks/PR-S1_sites_ingest.md, docs/Tasks/PR-S2_site_baseline_and_sim.md, docs/Tasks/PR-S6_site_backtest.md, docs/Tasks/PR-17_routes_forecast_ui.md, docs/Tasks/PR-DEMO_dual_ui_complete.md, docs/Tasks/TESTS_PHASE_B_PLAN.md, ai-docs/pro_messages/PRO2.md, ai-docs/pro_messages/PRO3.md

## Desired End State
- Service ingestion and internal computations use collect_volume_m3 (m3) only.
- Forecast outputs use pred_volume_m3 everywhere (simulator, API, exports, scripts).
- Validation/accuracy use actual_m3 derived directly from collect_volume_m3 (no /1000 conversions).
- API schemas/CSV headers/docs/tests reference pred_volume_m3 and collect_volume_m3 only.
- No tonnes or mass-unit fallback paths remain in the data loader or forecast pipeline.

### Key Discoveries
- /Users/m/ai/projects/forecastingrepo/data/sites_service.csv:1 uses collect_volume_m3.
- /Users/m/ai/projects/forecastingrepo/src/sites/data_loader.py:74-158 reads the 3rd column into collect_volume_m3.
- /Users/m/ai/projects/forecastingrepo/src/sites/baseline.py:16-90 computes rates from collect_volume_m3.
- /Users/m/ai/projects/forecastingrepo/src/sites/simulator.py:20-60 outputs pred_volume_m3 and uses rate_m3_per_day.
- /Users/m/ai/projects/forecastingrepo/src/sites/rolling_forecast.py:58-77 converts collect_volume_m3 and pred_volume_m3 via /1000.
- /Users/m/ai/projects/forecastingrepo/scripts/api_app.py:75-83, 591-598 emit pred_volume_m3 and convert to m3.

## Decisions Locked
- Strict m3 only; no legacy pred_volume_m3/collect_volume_m3 or ton-based fallback.
- Remove tonnes handling from data loader (no waste_tonnes fallback).
- Update API response fields to m3-only naming; remove weight-labeled fields.
- Fully rewrite scripts/convert_volume_report.py for m3 outputs (no manual follow-up).

## What We're NOT Doing
- No model/algorithm changes beyond unit naming and unit-consistent math.
- No backward compatibility shims for mass/ton fields.
- No UI changes outside this repo (flag any downstream UI adjustments separately).

## Implementation Approach
- Rename canonical columns to collect_volume_m3 and pred_volume_m3 across pipeline, API, scripts, tests, and docs.
- Remove /1000 conversions tied to legacy mass math and align fill_pct computation with capacity_m3 (capacity_liters / 1000).
- Rename district forecast outputs to forecast_m3 so reconcile uses consistent units.
- Regenerate OpenAPI output after code changes.

## Phase 1: Core Data Model + Forecast Pipeline
### Overview
Align loader, baseline, simulator, rolling forecast, schema, and reconcile logic to m3-only.

### Changes Required
1) **File**: src/sites/data_loader.py
   **Changes**: remove tonnes fallback; parse collect_volume_m3 only.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/data_loader.py
   @@
   -DISTRICT_DAILY_PATH = Path("data/daily_waste_by_district.csv")
   @@
   -def _empty_service_df() -> pd.DataFrame:
   -    return pd.DataFrame(columns=["site_id", "service_dt", "collect_volume_m3"])
   +def _empty_service_df() -> pd.DataFrame:
   +    return pd.DataFrame(columns=["site_id", "service_dt", "collect_volume_m3"])
   @@
   -def _load_district_service_data(path: Path) -> pd.DataFrame:
   -    if not path.exists():
   -        return _empty_service_df()
   -    df = pd.read_csv(path, usecols=["date", "district", "waste_tonnes"])
   -    df["service_dt"] = pd.to_datetime(df["date"], errors="coerce").dt.date
   -    df["collect_volume_m3"] = pd.to_numeric(df["waste_tonnes"], errors="coerce").fillna(0.0) * 1000.0
   -    df["site_id"] = df["district"].astype(str)
   -    df = df.dropna(subset=["service_dt", "site_id"])
   -    return df[["site_id", "service_dt", "collect_volume_m3"]]
   -
   -
   -def _load_district_registry(path: Path) -> pd.DataFrame:
   -    service_df = _load_district_service_data(path)
   -    if service_df.empty:
   -        return _empty_registry_df()
   -    districts = sorted(service_df["site_id"].dropna().astype(str).unique())
   -    return pd.DataFrame(
   -        {
   -            "site_id": districts,
   -            "district": districts,
   -            "address": pd.NA,
   -            "bin_count": 1,
   -            "bin_size_liters": 1100.0,
   -        }
   -    )
   @@
   -    Returns DataFrame with columns: site_id, service_dt (as date), collect_volume_m3 (as float)
   +    Returns DataFrame with columns: site_id, service_dt (as date), collect_volume_m3 (as float)
   @@
   -        # Parse collect_volume_m3 as float (may have been read as string due to dtype handling)
   -        df["collect_volume_m3"] = pd.to_numeric(df.iloc[:, 2], errors="coerce").astype(float)
   +        # Parse collect_volume_m3 as float (may have been read as string due to dtype handling)
   +        df = df.rename(columns={df.columns[2]: "collect_volume_m3"})
   +        df["collect_volume_m3"] = pd.to_numeric(df["collect_volume_m3"], errors="coerce").astype(float)
   @@
   -        if SERVICE_ENV_PATH is None and service_path == DEFAULT_SERVICE_PATH:
   -            df = _load_district_service_data(DISTRICT_DAILY_PATH)
   -            if not df.empty:
   -                logger.warning(
   -                    "Default service data not found; using district daily waste data from %s.",
   -                    DISTRICT_DAILY_PATH,
   -                )
   -        if df.empty:
   -            return _empty_service_df()
   +        if df.empty:
   +            return _empty_service_df()
   @@
   -    if not registry_path.exists():
   -        if REGISTRY_ENV_PATH is None and registry_path == DEFAULT_REGISTRY_PATH:
   -            df = _load_district_registry(DISTRICT_DAILY_PATH)
   -            if not df.empty:
   -                logger.warning(
   -                    "Default registry data not found; using district daily waste data from %s.",
   -                    DISTRICT_DAILY_PATH,
   -                )
   -                if site_ids is not None:
   -                    site_set = set(str(s) for s in site_ids)
   -                    df = df[df["site_id"].isin(site_set)]
   -                return df.reset_index(drop=True)
   -        return _empty_registry_df()
   +    if not registry_path.exists():
   +        return _empty_registry_df()
   *** End Patch
   PATCH
   ```

2) **File**: src/sites/rolling_types.py
   **Changes**: update column annotations for collect_volume_m3 and pred_volume_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/rolling_types.py
   @@
   -    service_df: pd.DataFrame  # columns: site_id, service_dt, collect_volume_m3
   +    service_df: pd.DataFrame  # columns: site_id, service_dt, collect_volume_m3
   @@
   -    forecast_df: pd.DataFrame  # columns: site_id, date, fill_pct, pred_volume_m3, overflow_prob
   +    forecast_df: pd.DataFrame  # columns: site_id, date, fill_pct, pred_volume_m3, overflow_prob
   @@
   -    pred_volume_m3: float
   +    pred_volume_m3: float
   *** End Patch
   PATCH
   ```

3) **File**: src/sites/schema.py
   **Changes**: rename collect_volume_m3 -> collect_volume_m3; pred_volume_m3 -> pred_volume_m3; rename validation helper.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/schema.py
   @@
   -class SiteServiceRow:
   +class SiteServiceRow:
       site_id: str
       service_dt: date
       service_time: Optional[str] = None
       emptied_flag: Optional[bool] = None
   -    collect_volume_m3: Optional[float] = None
   +    collect_volume_m3: Optional[float] = None
       district: Optional[str] = None
   @@
   -def ensure_nonnegative_mass(rows: Iterable[SiteServiceRow]) -> None:
   +def ensure_nonnegative_volume(rows: Iterable[SiteServiceRow]) -> None:
       for r in rows:
   -        if r.collect_volume_m3 is not None and r.collect_volume_m3 < 0:
   -            raise ValueError("Negative collect_volume_m3 not allowed")
   +        if r.collect_volume_m3 is not None and r.collect_volume_m3 < 0:
   +            raise ValueError("Negative collect_volume_m3 not allowed")
   @@
   -class SiteForecastPoint(BaseModel):
   +class SiteForecastPoint(BaseModel):
       date: str
   -    pred_volume_m3: Optional[float] = None
   +    pred_volume_m3: Optional[float] = None
       fill_pct: Optional[float] = None
       overflow_prob: Optional[float] = None
       last_service_dt: Optional[str] = None
   @@
   -class RouteStopForecast(BaseModel):
   +class RouteStopForecast(BaseModel):
       site_id: str
       address: Optional[str] = None
       volume_m3: Optional[float] = None
       schedule: Optional[str] = None
       fill_pct: Optional[float] = None
       overflow_prob: Optional[float] = None
   -    pred_volume_m3: Optional[float] = None
   +    pred_volume_m3: Optional[float] = None
       last_service_dt: Optional[str] = None
   *** End Patch
   PATCH
   ```

4) **File**: src/sites/baseline.py
   **Changes**: use collect_volume_m3 and rate_m3_per_day.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/baseline.py
   @@
   -    Event-to-rate: for each service event (site_id, service_dt, collect_volume_m3),
   -    compute r = mass / Δdays since previous service and attribute r to each weekday
   +    Event-to-rate: for each service event (site_id, service_dt, collect_volume_m3),
   +    compute r = volume / Δdays since previous service and attribute r to each weekday
       in that interval. Aggregate sums & counts per weekday; rate = sum/count.
   @@
   -    Returns DataFrame with columns: site_id, weekday (0..6), rate_m3_per_day.
   +    Returns DataFrame with columns: site_id, weekday (0..6), rate_m3_per_day.
   @@
   -        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype({"weekday": int, "rate_m3_per_day": float})
   +        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype({"weekday": int, "rate_m3_per_day": float})
   @@
   -            mass = r.get("collect_volume_m3")
   +            volume = r.get("collect_volume_m3")
               try:
   -                mass = float(mass) if mass is not None else None
   +                volume = float(volume) if volume is not None else None
               except Exception:
   -                mass = None
   +                volume = None
               if prev_dt is None:
   @@
   -                if mass is None:
   +                if volume is None:
                       prev_dt = dt
                       continue
   -                rate = mass / float(default_gap)
   +                rate = volume / float(default_gap)
   @@
   -            if mass is None:
   +            if volume is None:
                   prev_dt = dt
                   continue
   -            rate = mass / float(delta)
   +            rate = volume / float(delta)
   @@
   -        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype({"weekday": int, "rate_m3_per_day": float})
   +        return pd.DataFrame(columns=["site_id", "weekday", "rate_m3_per_day"]).astype({"weekday": int, "rate_m3_per_day": float})
   @@
   -    agg["rate_m3_per_day"] = agg.apply(
   +    agg["rate_m3_per_day"] = agg.apply(
           lambda r: (r["sum_r"] / r["cnt"]) if r["cnt"] >= min_obs else r["overall"], axis=1
       )
   -    return agg[["site_id", "weekday", "rate_m3_per_day"]]
   +    return agg[["site_id", "weekday", "rate_m3_per_day"]]
   *** End Patch
   PATCH
   ```

5) **File**: src/sites/simulator.py
   **Changes**: use rate_m3_per_day and pred_volume_m3; compute fill_pct with capacity_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/simulator.py
   @@
   -    - weekday_rates: columns site_id, weekday, rate_m3_per_day
   +    - weekday_rates: columns site_id, weekday, rate_m3_per_day
       - capacity per site: (bin_count * bin_size_liters) if available else capacity_liters
   @@
   -    Output columns: site_id,date,fill_pct,pred_volume_m3,overflow_prob (0/1)
   +    Output columns: site_id,date,fill_pct,pred_volume_m3,overflow_prob (0/1)
       """
       if weekday_rates.empty:
   -        return pd.DataFrame(columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
   +        return pd.DataFrame(columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
   @@
   -    wr = weekday_rates.pivot(index="site_id", columns="weekday", values="rate_m3_per_day").fillna(0.0)
   +    wr = weekday_rates.pivot(index="site_id", columns="weekday", values="rate_m3_per_day").fillna(0.0)
   @@
   -        cap_l = float(reg.set_index("site_id").get("capacity_liters", pd.Series(dtype=float)).get(site_id, capacity_liters))
   -        fill_m3 = 0.0
   +        cap_l = float(reg.set_index("site_id").get("capacity_liters", pd.Series(dtype=float)).get(site_id, capacity_liters))
   +        cap_m3 = cap_l / 1000.0 if cap_l > 0 else 0.0
   +        fill_m3 = 0.0
           for d in dates:
               wd = wd_map[d]
               rate = float(rates_row.get(wd, 0.0))
   -            fill_m3 = max(0.0, fill_m3 + rate)
   -            if reset_on_near_capacity and cap_l > 0 and fill_m3 >= cap_l * 0.98:
   -                fill_m3 = 0.0
   -            fill_pct = 0.0 if cap_l <= 0 else min(1.0, fill_m3 / cap_l)
   +            fill_m3 = max(0.0, fill_m3 + rate)
   +            if reset_on_near_capacity and cap_m3 > 0 and fill_m3 >= cap_m3 * 0.98:
   +                fill_m3 = 0.0
   +            fill_pct = 0.0 if cap_m3 <= 0 else min(1.0, fill_m3 / cap_m3)
               overflow = 1 if fill_pct >= overflow_threshold else 0
   -            out_rows.append((site_id, d.isoformat(), fill_pct, fill_m3, overflow))
   +            out_rows.append((site_id, d.isoformat(), fill_pct, fill_m3, overflow))
   
   -    return pd.DataFrame(out_rows, columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
   +    return pd.DataFrame(out_rows, columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
   *** End Patch
   PATCH
   ```

6) **File**: src/sites/rolling_forecast.py
   **Changes**: use collect_volume_m3 and pred_volume_m3; remove /1000 conversions.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/rolling_forecast.py
   @@
   -    ].groupby(["site_id", "service_dt"])["collect_volume_m3"].sum().reset_index()
   -    actuals["actual_m3"] = actuals["collect_volume_m3"] / 1000.0
   +    ].groupby(["site_id", "service_dt"])["collect_volume_m3"].sum().reset_index()
   +    actuals["actual_m3"] = actuals["collect_volume_m3"]
   @@
   -    merged["_pred_m3"] = merged["pred_volume_m3"] / 1000.0
   +    merged["_pred_m3"] = merged["pred_volume_m3"]
   @@
   -                columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   +                columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
               ),
   *** End Patch
   PATCH
   ```

7) **File**: src/sites/reconcile.py
   **Changes**: switch to pred_volume_m3 + forecast_m3; adjust fill_pct with capacity_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/reconcile.py
   @@
   -    Reconcile per-site predicted volume to district forecasts (m3) per (date,district).
   +    Reconcile per-site predicted volume (m3) to district forecasts (m3) per (date,district).
   @@
   -      - site_df: columns [site_id, date, pred_volume_m3, fill_pct, overflow_prob]
   +      - site_df: columns [site_id, date, pred_volume_m3, fill_pct, overflow_prob]
       - registry_df: columns [site_id, district, bin_count, bin_size_liters]
   -      - district_fc_df: columns [date, district, forecast_tonnes]
   +      - district_fc_df: columns [date, district, forecast_m3]
   @@
   -      - adjusted_sites_df: same columns as site_df with pred_volume_m3 and fill_pct possibly scaled
   -      - debug_df: columns [date, district, sites_sum_before_m3, district_fc_m3, scale_applied, sites_sum_after_m3, delta_pct]
   +      - adjusted_sites_df: same columns as site_df with pred_volume_m3 and fill_pct possibly scaled
   +      - debug_df: columns [date, district, sites_sum_before_m3, district_fc_m3, scale_applied, sites_sum_after_m3, delta_pct]
   @@
   -        return site_df.copy(), pd.DataFrame(columns=[
   -            "date","district","sites_sum_before_m3","district_fc_m3","scale_applied","sites_sum_after_m3","delta_pct"
   -        ]), []
   +        return site_df.copy(), pd.DataFrame(columns=[
   +            "date","district","sites_sum_before_m3","district_fc_m3","scale_applied","sites_sum_after_m3","delta_pct"
   +        ]), []
   @@
   -    # Normalize district forecast to m3 and ensure date is string
   +    # Normalize district forecast to m3 and ensure date is string
       dfc = district_fc_df.copy()
   -    dfc["district_fc_m3"] = dfc["forecast_tonnes"].astype(float) * 1000.0
   +    dfc["district_fc_m3"] = dfc["forecast_m3"].astype(float)
       dfc["date"] = dfc["date"].astype(str)
   @@
   -    sums = sites.groupby(["date","district"], dropna=False)["pred_volume_m3"].sum().reset_index(name="sites_sum_before_m3")
   -    joined = sums.merge(dfc[["date","district","district_fc_m3"]], on=["date","district"], how="left")
   +    sums = sites.groupby(["date","district"], dropna=False)["pred_volume_m3"].sum().reset_index(name="sites_sum_before_m3")
   +    joined = sums.merge(dfc[["date","district","district_fc_m3"]], on=["date","district"], how="left")
   @@
   -        s_before = float(r["sites_sum_before_m3"] or 0.0)
   -        fc = float(r.get("district_fc_m3") or 0.0)
   +        s_before = float(r["sites_sum_before_m3"] or 0.0)
   +        fc = float(r.get("district_fc_m3") or 0.0)
   @@
   -            "sites_sum_before_m3": s_before,
   -            "district_fc_m3": fc,
   +            "sites_sum_before_m3": s_before,
   +            "district_fc_m3": fc,
               "scale_applied": scale,
   -            "sites_sum_after_m3": s_after,
   +            "sites_sum_after_m3": s_after,
               "delta_pct": delta_pct,
           })
   @@
   -    sites["pred_volume_m3"] = sites["pred_volume_m3"].astype(float) * sites["scale"].astype(float)
   +    sites["pred_volume_m3"] = sites["pred_volume_m3"].astype(float) * sites["scale"].astype(float)
   @@
   -    cap_series = sites.apply(_cap_l, axis=1).astype(float)
   -    sites["fill_pct"] = (sites["pred_volume_m3"].astype(float) / cap_series).clip(lower=0.0, upper=1.0)
   +    cap_series = sites.apply(_cap_l, axis=1).astype(float)
   +    cap_m3 = cap_series / 1000.0
   +    sites["fill_pct"] = (sites["pred_volume_m3"].astype(float) / cap_m3).clip(lower=0.0, upper=1.0)
   *** End Patch
   PATCH
   ```

8) **File**: src/sites/rolling_backtest.py
   **Changes**: use pred_volume_m3 directly for forecast_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/rolling_backtest.py
   @@
   -        merged["forecast_m3"] = merged["pred_volume_m3"] / 1000.0
   +        merged["forecast_m3"] = merged["pred_volume_m3"].astype(float)
   *** End Patch
   PATCH
   ```

9) **File**: src/sites/data_access.py
   **Changes**: update docstring column names.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/data_access.py
   @@
   -            DataFrame with columns: service_dt, site_id, collect_volume_m3
   +            DataFrame with columns: service_dt, site_id, collect_volume_m3
   *** End Patch
   PATCH
   ```

10) **File**: src/sites/aliases_ru.py
    **Changes**: change canonical service field to collect_volume_m3 and remove mass/ton aliases.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/aliases_ru.py
   @@
   -Canonical fields (service):
   -  - site_id, service_dt, service_time, emptied_flag, collect_volume_m3, district
   +Canonical fields (service):
   +  - site_id, service_dt, service_time, emptied_flag, collect_volume_m3, district
   @@
   -    "collect_volume_m3": (
   -        "collect_volume_m3",
   -        "масса, кг",
   -        "масса (кг)",
   -        "вес, кг",
   -        "масса",
   -        "вес",
   -        # ton-based headers (handled with unit conversion in code)
   -        "масса, т",
   -        "масса, тонн",
   -        "вес, т",
   -        "вес, тонн",
   -    ),
   +    "collect_volume_m3": (
   +        "collect_volume_m3",
   +        "volume_m3",
   +        "объем, м3",
   +        "объём, м3",
   +        "объем, м³",
   +        "объём, м³",
   +        "объем (м3)",
   +        "объём (м3)",
   +        "объем",
   +        "объём",
   +        "volume",
   +    ),
   *** End Patch
   PATCH
   ```

11) **File**: scripts/ingest_sites.py
    **Changes**: align to collect_volume_m3; remove ton-header logic; use ensure_nonnegative_volume.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/ingest_sites.py
   @@
   -from src.sites.aliases_ru import map_headers, is_ton_header
   -from src.sites.schema import SiteRegistryRow, SiteServiceRow, ensure_unique_keys, ensure_nonnegative_mass, coerce_date
   +from src.sites.aliases_ru import map_headers
   +from src.sites.schema import SiteRegistryRow, SiteServiceRow, ensure_unique_keys, ensure_nonnegative_volume, coerce_date
   @@
   -    # Capture any mass columns given in tons for later unit conversion
   -    ton_orig_headers = [orig for orig, canon in mapping.items() if canon == "collect_volume_m3" and is_ton_header(orig)]
   @@
   -    # Store original ton headers for unit conversion logic downstream
   -    try:
   -        out.attrs["__ton_headers"] = ton_orig_headers
   -    except Exception:
   -        pass
       return out
   @@
   -    # Detect if any original mass header indicated tons (captured in attrs by _standardize_columns)
   -    ton_headers = df.attrs.get("__ton_headers", [])
   @@
   -        mass = r.get("collect_volume_m3")
   -        mass_val = _opt_float(mass)
   -        # Heuristic: if any mass-like original header was in tons, convert numeric mass by *1000
   -        if mass_val is not None and ton_headers:
   -            mass_val *= 1000.0
   +        volume = r.get("collect_volume_m3")
   +        volume_val = _opt_float(volume)
   @@
   -                collect_volume_m3=mass_val,
   +                collect_volume_m3=volume_val,
   @@
   -    ensure_nonnegative_mass(svc_rows)
   +    ensure_nonnegative_volume(svc_rows)
   @@
   -    svc_df = pd.DataFrame(_to_dicts(svc_rows)) if svc_rows else pd.DataFrame(columns=[
   -        "site_id","service_dt","service_time","emptied_flag","collect_volume_m3","district"
   -    ])
   +    svc_df = pd.DataFrame(_to_dicts(svc_rows)) if svc_rows else pd.DataFrame(columns=[
   +        "site_id","service_dt","service_time","emptied_flag","collect_volume_m3","district"
   +    ])
   *** End Patch
   PATCH
   ```

12) **File**: scripts/convert_reports_to_sites_data.py
    **Changes**: write collect_volume_m3 instead of collect_volume_m3; remove legacy mass conversion.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/convert_reports_to_sites_data.py
   @@
   -  - data/sites_service.csv    (site_id, service_dt, collect_volume_m3)
   +  - data/sites_service.csv    (site_id, service_dt, collect_volume_m3)
   @@
   -M3_TO_KG = 1000.0
   @@
   -        service_writer.writerow(["site_id", "service_dt", "collect_volume_m3"])
   +        service_writer.writerow(["site_id", "service_dt", "collect_volume_m3"])
   @@
   -                        collect_volume_m3 = volume * M3_TO_KG
   -                        service_writer.writerow([site_id, service_dt, f"{collect_volume_m3:.3f}"])
   +                        service_writer.writerow([site_id, service_dt, f"{volume:.3f}"])
   *** End Patch
   PATCH
   ```

## Phase 2: API, Exports, and Scripts
### Overview
Update API schemas/handlers and helper scripts to emit/consume pred_volume_m3; remove weight-labelled API fields.

### Changes Required
1) **File**: src/sites/export_validation.py
   **Changes**: remove pred_units conversion; require pred_volume_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/export_validation.py
   @@
   -    pred_units: str = "m3",
   +    pred_units: str = "m3",
   @@
   -        pred_units: Unit for pred_volume_m3 column (default: m3)
   +        pred_units: Unit for pred_volume_m3 column (default: m3)
   @@
   -        if "pred_volume_m3" in df.columns:
   -            pred_mass = pd.to_numeric(df["pred_volume_m3"], errors="coerce")
   -            if pred_units == "m3":
   -                pred_m3 = pred_mass
   -            else:
   -                pred_m3 = pred_mass / 1000.0
   -        elif "pred_volume_m3" in df.columns:
   +        if "pred_volume_m3" in df.columns:
               pred_m3 = pd.to_numeric(df["pred_volume_m3"], errors="coerce")
         else:
   -            raise RuntimeError("Forecast frame must contain 'pred_volume_m3' or 'pred_volume_m3'.")
   +            raise RuntimeError("Forecast frame must contain 'pred_volume_m3'.")
   *** End Patch
   PATCH
   ```

2) **File**: scripts/export_validation_forecast.py
   **Changes**: drop --pred-units flag; update call signature.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/export_validation_forecast.py
   @@
   -    parser.add_argument(
   -        '--pred-units',
   -        choices=['m3'],
   -        default='m3',
   -        help='Units for pred_volume_m3 when exporting (m3 only)',
   -    )
   @@
   -        pred_units=args.pred_units,
   +        pred_units="m3",
   *** End Patch
   PATCH
   ```

3) **File**: scripts/make_site_forecast_from_actuals.py
   **Changes**: output pred_volume_m3, update variable names and headers.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/make_site_forecast_from_actuals.py
   @@
   -Output format matches the pipeline's daily_fill CSV:
   -level,site_id,date,fill_pct,pred_volume_m3,overflow_prob
   +Output format matches the pipeline's daily_fill CSV:
   +level,site_id,date,fill_pct,pred_volume_m3,overflow_prob
   @@
   -                mass = float(rec.get("collect_volume_m3") or 0.0)
   +                volume = float(rec.get("collect_volume_m3") or 0.0)
   @@
   -            if mass <= 0:
   +            if volume <= 0:
                   continue
   -            site_day_mass[site_id][dt] += mass
   +            site_day_mass[site_id][dt] += volume
   @@
   -        fill_m3 = 0.0
   +        fill_m3 = 0.0
   @@
   -            fill_m3 = max(0.0, fill_m3 + rate)
   -            fill_pct = 0.0 if cap <= 0 else min(1.0, fill_m3 / cap)
   +            cap_m3 = cap / 1000.0 if cap > 0 else 0.0
   +            fill_m3 = max(0.0, fill_m3 + rate)
   +            fill_pct = 0.0 if cap_m3 <= 0 else min(1.0, fill_m3 / cap_m3)
   @@
   -                    fill_m3,
   +                    fill_m3,
   @@
   -        writer.writerow(["level", "site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
   +        writer.writerow(["level", "site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
   *** End Patch
   PATCH
   ```

4) **File**: scripts/api_app.py
   **Changes**: rename pred_volume_m3 -> pred_volume_m3; remove overallWeight field from MyTKOForecastPoint payload.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/api_app.py
   @@
   -    pred_m3 = pd.to_numeric(df_sorted["pred_volume_m3"], errors="coerce").fillna(0.0) / 1000.0
   +    pred_m3 = pd.to_numeric(df_sorted["pred_volume_m3"], errors="coerce").fillna(0.0)
   @@
   -class SiteRow(BaseModel):
   +class SiteRow(BaseModel):
       site_id: str | None
       district: str | None
       date: str | None
       fill_pct: float
       overflow_prob: float
   -    pred_volume_m3: float
   +    pred_volume_m3: float
   @@
   -class TrajectoryPoint(BaseModel):
   +class TrajectoryPoint(BaseModel):
       site_id: str | None
       date: str
       fill_pct: float
       overflow_prob: float
   -    pred_volume_m3: float
   +    pred_volume_m3: float
   @@
   -class MyTKOForecastPoint(BaseModel):
   +class MyTKOForecastPoint(BaseModel):
       date: str
       isFact: bool = False
       isEmpty: bool
       tripMeasurements: list[float] | float | None = None
       dividedToTrips: bool = False
       vehicleVolume: float
       overallVolume: float
   -    overallWeight: float
       overallMileage: float | None = None
       isMixed: bool | None = None
   @@
   -                    "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
   +                    "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
   @@
   -            fieldnames = ["site_id", "district", "date", "fill_pct", "overflow_prob", "pred_volume_m3"]
   +            fieldnames = ["site_id", "district", "date", "fill_pct", "overflow_prob", "pred_volume_m3"]
   @@
   -                    "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
   +                    "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
   @@
   -                out.append({
   +                out.append({
                       "site_id": rec.get("site_id"),
                       "date": d,
                       "fill_pct": float(rec.get("fill_pct") or 0.0),
                       "overflow_prob": float(rec.get("overflow_prob") or 0.0),
   -                   "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
   +                   "pred_volume_m3": float(rec.get("pred_volume_m3") or 0.0),
                   })
   @@
   -            pm = rec.get("pred_volume_m3") or rec.get("pred_mass")
   +            pm = rec.get("pred_volume_m3")
   @@
   -            overall_volume = volume_m3 if volume_m3 is not None else (pred_mass / 1000.0)
   +            overall_volume = volume_m3 if volume_m3 is not None else pred_mass
   @@
   -                    "overallWeight": max(0.0, pred_mass),
   @@
   -                fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   +                fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   @@
   -                        "pred_volume_m3": point["pred_volume_m3"],
   +                        "pred_volume_m3": point["pred_volume_m3"],
   @@
   -                fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   +                fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   @@
   -                        "pred_volume_m3": row["pred_volume_m3"],
   +                        "pred_volume_m3": row["pred_volume_m3"],
   @@
   -        fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   +        fieldnames = ["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
   @@
   -                "pred_volume_m3": row["pred_volume_m3"],
   +                "pred_volume_m3": row["pred_volume_m3"],
   *** End Patch
   PATCH
   ```

5) **File**: src/sites/api_site_forecast.py
   **Changes**: use pred_volume_m3 in JSON/CSV output.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/api_site_forecast.py
   @@
   -                pred_raw = rec.get("pred_volume_m3")
   -                if pred_raw in (None, ""):
   -                    pred_raw = rec.get("pred_volume_m3")
   +                pred_raw = rec.get("pred_volume_m3")
   @@
   -                    pred_volume_m3=(float(pred_raw) if pred_raw not in (None, "") else None),
   +                    pred_volume_m3=(float(pred_raw) if pred_raw not in (None, "") else None),
   @@
   -                "pred_volume_m3",
   +                "pred_volume_m3",
   @@
   -                    "pred_volume_m3": p.pred_volume_m3,
   +                    "pred_volume_m3": p.pred_volume_m3,
   *** End Patch
   PATCH
   ```

6) **File**: src/sites/api_routes_forecast.py
   **Changes**: update CSV headers to pred_volume_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: src/sites/api_routes_forecast.py
   @@
   -            "pred_volume_m3",
   +            "pred_volume_m3",
   @@
   -                "pred_volume_m3": getattr(p, "pred_volume_m3", None),
   +                "pred_volume_m3": getattr(p, "pred_volume_m3", None),
   *** End Patch
   PATCH
   ```

7) **File**: scripts/generate_forecast_bundle.py
   **Changes**: use pred_volume_m3 directly.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/generate_forecast_bundle.py
   @@
   -    df['pred_m3'] = df['pred_volume_m3'] / 1000.0
   +    df['pred_m3'] = df['pred_volume_m3']
   *** End Patch
   PATCH
   ```

8) **File**: scripts/generate_html_report.py
   **Changes**: use pred_volume_m3 directly.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/generate_html_report.py
   @@
   -    df['pred_m3'] = df['pred_volume_m3'] / 1000.0
   +    df['pred_m3'] = df['pred_volume_m3']
   *** End Patch
   PATCH
   ```

9) **File**: scripts/create_demo_bundle.py
   **Changes**: sum collect_volume_m3 for volume ranking.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/create_demo_bundle.py
   @@
   -    site_volumes = service.groupby('site_id')['collect_volume_m3'].sum().sort_values(ascending=False)
   +    site_volumes = service.groupby('site_id')['collect_volume_m3'].sum().sort_values(ascending=False)
   *** End Patch
   PATCH
   ```

10) **File**: scripts/create_demo_subset.py
    **Changes**: read pred_volume_m3; no /1000 conversion.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/create_demo_subset.py
   @@
   -            pred_mass_raw = row.get("pred_volume_m3") or row.get("pred_mass") or ""
   +            pred_mass_raw = row.get("pred_volume_m3") or ""
   @@
   -            if pred_mass is not None:
   -                forecast_m3 = pred_mass / 1000.0
   +            if pred_mass is not None:
   +                forecast_m3 = pred_mass
   *** End Patch
   PATCH
   ```

11) **File**: scripts/backtest_sites.py
    **Changes**: rename columns to collect_volume_m3 / pred_volume_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/backtest_sites.py
   @@
   -    """Return {(site_id,date): collect_volume_m3} for service events.
   +    """Return {(site_id,date): collect_volume_m3} for service events.
   @@
   -    Expected columns: site_id, service_dt, collect_volume_m3.
   +    Expected columns: site_id, service_dt, collect_volume_m3.
   @@
   -                v = float(rec.get("collect_volume_m3") or rec.get("volume_m3") or 0.0)
   +                v = float(rec.get("collect_volume_m3") or 0.0)
   @@
   -    """Return {(site_id,date): pred_volume_m3} from daily_fill CSV.
   +    """Return {(site_id,date): pred_volume_m3} from daily_fill CSV.
   @@
   -    Expected columns: site_id,date,pred_volume_m3 (fill_pct,overflow_prob present).
   +    Expected columns: site_id,date,pred_volume_m3 (fill_pct,overflow_prob present).
   @@
   -                yhat = float(rec.get("pred_volume_m3") or 0.0)
   +                yhat = float(rec.get("pred_volume_m3") or 0.0)
   *** End Patch
   PATCH
   ```

12) **File**: scripts/ingest_and_forecast.py
    **Changes**: rename district forecast column to forecast_m3; update QA fieldnames and docs.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/ingest_and_forecast.py
   @@
   -  - forecasts/daily_forecast_30d.csv           (date,forecast_tonnes)
   -  - forecasts/monthly_forecast_3m.csv          (year_month,forecast_tonnes)
   +  - forecasts/daily_forecast_30d.csv           (date,forecast_m3)
   +  - forecasts/monthly_forecast_3m.csv          (year_month,forecast_m3)
   @@
   -        w.writerow(['date', 'forecast_tonnes'])
   +        w.writerow(['date', 'forecast_m3'])
   @@
   -        w.writerow(['year_month', 'forecast_tonnes'])
   +        w.writerow(['year_month', 'forecast_m3'])
   @@
   -                    rows_out.append({"level": "district", "district": dist, "date": d.isoformat(), "forecast_tonnes": yhat})
   +                    rows_out.append({"level": "district", "district": dist, "date": d.isoformat(), "forecast_m3": yhat})
   @@
   -                s = sum(r['forecast_tonnes'] for r in rows_out if r['level'] == 'district' and r['date'] == d.isoformat())
   -                rows_out.append({"level": "region", "district": "__region__", "date": d.isoformat(), "forecast_tonnes": s})
   +                s = sum(r['forecast_m3'] for r in rows_out if r['level'] == 'district' and r['date'] == d.isoformat())
   +                rows_out.append({"level": "region", "district": "__region__", "date": d.isoformat(), "forecast_m3": s})
   @@
   -        bad_nums = any((r['forecast_tonnes'] is None or math.isinf(r['forecast_tonnes']) or math.isnan(r['forecast_tonnes'])) for r in rows_out)
   -        has_negative = any(r['forecast_tonnes'] < 0 for r in rows_out)
   -        all_zero = sum(r['forecast_tonnes'] for r in rows_out) == 0
   +        bad_nums = any((r['forecast_m3'] is None or math.isinf(r['forecast_m3']) or math.isnan(r['forecast_m3'])) for r in rows_out)
   +        has_negative = any(r['forecast_m3'] < 0 for r in rows_out)
   +        all_zero = sum(r['forecast_m3'] for r in rows_out) == 0
   @@
   -            w = csv.DictWriter(f, fieldnames=["level", "district", "date", "forecast_tonnes"])
   +            w = csv.DictWriter(f, fieldnames=["level", "district", "date", "forecast_m3"])
   @@
   -                    rows_out.append({"level": "district", "district": dist, "year_month": ym, "forecast_tonnes": yhat})
   +                    rows_out.append({"level": "district", "district": dist, "year_month": ym, "forecast_m3": yhat})
   @@
   -                s = sum(r['forecast_tonnes'] for r in rows_out if r['level'] == 'district' and r['year_month'] == ym)
   -                rows_out.append({"level": "region", "district": "__region__", "year_month": ym, "forecast_tonnes": s})
   +                s = sum(r['forecast_m3'] for r in rows_out if r['level'] == 'district' and r['year_month'] == ym)
   +                rows_out.append({"level": "region", "district": "__region__", "year_month": ym, "forecast_m3": s})
   @@
   -        bad_nums = any((r['forecast_tonnes'] is None or math.isinf(r['forecast_tonnes']) or math.isnan(r['forecast_tonnes'])) for r in rows_out)
   -        has_negative = any(r['forecast_tonnes'] < 0 for r in rows_out)
   -        all_zero = sum(r['forecast_tonnes'] for r in rows_out) == 0
   +        bad_nums = any((r['forecast_m3'] is None or math.isinf(r['forecast_m3']) or math.isnan(r['forecast_m3'])) for r in rows_out)
   +        has_negative = any(r['forecast_m3'] < 0 for r in rows_out)
   +        all_zero = sum(r['forecast_m3'] for r in rows_out) == 0
   @@
   -            w = csv.DictWriter(f, fieldnames=["level", "district", "year_month", "forecast_tonnes"])
   +            w = csv.DictWriter(f, fieldnames=["level", "district", "year_month", "forecast_m3"])
   @@
   -                    rows_fc.append({"date": d.isoformat(), "district": dist, "forecast_tonnes": yhat})
   +                    rows_fc.append({"date": d.isoformat(), "district": dist, "forecast_m3": yhat})
   @@
   -                        "nonnegative": (bool(adj_df["pred_volume_m3"].min() >= 0) if not adj_df.empty else True),
   +                        "nonnegative": (bool(adj_df["pred_volume_m3"].min() >= 0) if not adj_df.empty else True),
   @@
   -  - Columns: level [district|region], district [district name or __region__], date [YYYY-MM-DD], forecast_tonnes [float]
   -  - Columns: level [district|region], district [district name or __region__], year_month [YYYY-MM], forecast_tonnes [float]
   +  - Columns: level [district|region], district [district name or __region__], date [YYYY-MM-DD], forecast_m3 [float]
   +  - Columns: level [district|region], district [district name or __region__], year_month [YYYY-MM], forecast_m3 [float]
   *** End Patch
   PATCH
   ```

13) **File**: scripts/routes_recommend.py
    **Changes**: update docstring input columns.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/routes_recommend.py
   @@
   -- --sites-csv: daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv (columns: site_id,date,fill_pct,pred_volume_m3,overflow_prob)
   +- --sites-csv: daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv (columns: site_id,date,fill_pct,pred_volume_m3,overflow_prob)
   *** End Patch
   PATCH
   ```

14) **File**: scripts/convert_volume_report.py
    **Changes**: rewrite to emit collect_volume_m3 and remove volume_m3 fields.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/convert_volume_report.py
   @@
   -  * data/sites/sites_service.csv   — site_id, service_dt, collect_volume_m3, volume_m3, source
   +  * data/sites/sites_service.csv   — site_id, service_dt, collect_volume_m3, volume_m3, source
   @@
   -class DailyRecord:
   +class DailyRecord:
       site_id: str
       service_dt: date
   -    volume_m3: float
   -    volume_m3: float
   +    volume_m3: float
   +    collect_volume_m3: float
       source: str
   @@
   -                        volume_m3=mass,
   +                        collect_volume_m3=volume,
   @@
   -                    volume_m3=parse_float(rec.get("collect_volume_m3") or "") or 0.0,
   +                    collect_volume_m3=parse_float(rec.get("collect_volume_m3") or "") or 0.0,
   @@
   -            existing.volume_m3 += rec.volume_m3
   +            existing.collect_volume_m3 += rec.collect_volume_m3
   @@
   -        writer.writerow(["site_id", "service_dt", "collect_volume_m3", "volume_m3", "source"])
   +        writer.writerow(["site_id", "service_dt", "collect_volume_m3", "volume_m3", "source"])
   @@
   -                    f"{rec.volume_m3:.6f}",
   +                    f"{rec.collect_volume_m3:.6f}",
   *** End Patch
   PATCH
   ```

15) **File**: scripts/run_accuracy_backtest.py
    **Changes**: remove mass units from candidates and auto units; enforce m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/run_accuracy_backtest.py
   @@
   -VALUE_COL_CANDIDATES = ("collect_volume_m3", "collect_volume_m3", "volume_m3")
   +VALUE_COL_CANDIDATES = ("collect_volume_m3", "volume_m3")
   @@
   -    if service_units == "auto":
   -        return "m3"
   +    if service_units == "auto":
   +        return "m3"
   @@
   -        choices=["auto", "m3"],
   -        default="auto",
   +        choices=["auto", "m3"],
   +        default="m3",
   *** End Patch
   PATCH
   ```

16) **File**: scripts/backtest_eval.py
    **Changes**: rename forecast_tonnes -> forecast_m3 and waste_tonnes -> actual_m3.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/backtest_eval.py
   @@
   -                v = float(rec.get("waste_tonnes", 0) or 0.0)
   +                v = float(rec.get("actual_m3", 0) or 0.0)
   @@
   -                v = float(rec.get("waste_tonnes", 0) or 0.0)
   +                v = float(rec.get("actual_m3", 0) or 0.0)
   @@
   -                    v = float(rec.get("forecast_tonnes", 0) or 0.0)
   +                    v = float(rec.get("forecast_m3", 0) or 0.0)
   @@
   -                    v = float(rec.get("forecast_tonnes", 0) or 0.0)
   +                    v = float(rec.get("forecast_m3", 0) or 0.0)
   *** End Patch
   PATCH
   ```

17) **File**: scripts/quicklook_report.py
    **Changes**: rename waste_tonnes -> actual_m3; forecast_tonnes -> forecast_m3; update labels.
   ```commands
   apply_patch <<'PATCH'
   *** Begin Patch
   *** Update File: scripts/quicklook_report.py
   @@
   -                v = float(rec.get("waste_tonnes", 0) or 0.0)
   +                v = float(rec.get("actual_m3", 0) or 0.0)
   @@
   -                v = float(rec.get("waste_tonnes", 0) or 0.0)
   +                v = float(rec.get("actual_m3", 0) or 0.0)
   @@
   -                    v = float(rec.get("forecast_tonnes", 0) or 0.0)
   +                    v = float(rec.get("forecast_m3", 0) or 0.0)
   @@
   -                    v = float(rec.get("forecast_tonnes", 0) or 0.0)
   +                    v = float(rec.get("forecast_m3", 0) or 0.0)
   @@
   -    ax.set_ylabel("Tonnes")
   +    ax.set_ylabel("m3")
   @@
   -    ax.set_ylabel("Tonnes (sum)")
   +    ax.set_ylabel("m3 (sum)")
   *** End Patch
   PATCH
   ```

## Phase 3: Tests, Docs, and OpenAPI
### Overview
Update tests and docs to the new column names and regenerate OpenAPI.

### Changes Required
1) **Tests**: rename pred_volume_m3 -> pred_volume_m3 and collect_volume_m3 -> collect_volume_m3; update unit math.
   - Files to update (rg list):
     - tests/conftest.py
     - tests/routes/test_recommend.py
     - tests/test_data_access.py
     - tests/test_html_report.py
     - tests/test_bundle_cli.py
     - tests/test_export_validation.py
     - tests/api/test_api_app.py
     - tests/api/test_api_sites_v1.py
     - tests/api/test_rolling_forecast_endpoint.py
     - tests/api/test_site_forecast_v1.py
     - tests/api/test_site_forecast_edges.py
     - tests/api/test_api_routes_forecast.py
     - tests/api/test_sites_headers_filters_csv.py
     - tests/api/test_sites_empty_csv_header_only.py
     - tests/api/test_sites_paging_large_offset.py
     - tests/api/test_sites_fill_from_volume_gate.py
     - tests/api/test_sites_fill_from_volume_gate_csv.py
     - tests/api/test_routes_collection_join_and_csv.py
     - tests/api/test_routes_policy_parity.py
     - tests/api/test_csv_injection_safety.py
     - tests/api/test_pydantic_model_roundtrip.py
     - tests/api/test_env_demo_default_date_propagation.py
     - tests/api/test_mytko_adapter.py
     - tests/sites/test_data_loader.py
     - tests/sites/test_site_baseline.py
     - tests/sites/test_site_baseline_branches.py
     - tests/sites/test_site_simulator.py
     - tests/sites/test_forecast_cache.py
     - tests/sites/test_rolling_forecast.py
     - tests/sites/test_reconcile.py
     - tests/sites/test_reconcile_branches.py
     - tests/sites/test_sites_qa_counters.py
     - tests/sites/test_sites_e2e_smoke.py
     - tests/sites/test_backtest_sites_unit.py
     - tests/sites/test_backtest_sites_e2e.py
   - Bulk rename (then adjust logic):
   ```commands
   python - <<'PY'
   from pathlib import Path
   files = [
       Path("tests/conftest.py"),
       Path("tests/routes/test_recommend.py"),
       Path("tests/test_data_access.py"),
       Path("tests/test_html_report.py"),
       Path("tests/test_bundle_cli.py"),
       Path("tests/test_export_validation.py"),
       Path("tests/api/test_api_app.py"),
       Path("tests/api/test_api_sites_v1.py"),
       Path("tests/api/test_rolling_forecast_endpoint.py"),
       Path("tests/api/test_site_forecast_v1.py"),
       Path("tests/api/test_site_forecast_edges.py"),
       Path("tests/api/test_api_routes_forecast.py"),
       Path("tests/api/test_sites_headers_filters_csv.py"),
       Path("tests/api/test_sites_empty_csv_header_only.py"),
       Path("tests/api/test_sites_paging_large_offset.py"),
       Path("tests/api/test_sites_fill_from_volume_gate.py"),
       Path("tests/api/test_sites_fill_from_volume_gate_csv.py"),
       Path("tests/api/test_routes_collection_join_and_csv.py"),
       Path("tests/api/test_routes_policy_parity.py"),
       Path("tests/api/test_csv_injection_safety.py"),
       Path("tests/api/test_pydantic_model_roundtrip.py"),
       Path("tests/api/test_env_demo_default_date_propagation.py"),
       Path("tests/api/test_mytko_adapter.py"),
       Path("tests/sites/test_data_loader.py"),
       Path("tests/sites/test_site_baseline.py"),
       Path("tests/sites/test_site_baseline_branches.py"),
       Path("tests/sites/test_site_simulator.py"),
       Path("tests/sites/test_forecast_cache.py"),
       Path("tests/sites/test_rolling_forecast.py"),
       Path("tests/sites/test_reconcile.py"),
       Path("tests/sites/test_reconcile_branches.py"),
       Path("tests/sites/test_sites_qa_counters.py"),
       Path("tests/sites/test_sites_e2e_smoke.py"),
       Path("tests/sites/test_backtest_sites_unit.py"),
       Path("tests/sites/test_backtest_sites_e2e.py"),
   ]
   for path in files:
       text = path.read_text()
       text = text.replace("pred_volume_m3", "pred_volume_m3")
       text = text.replace("collect_volume_m3", "collect_volume_m3")
       path.write_text(text)
   PY
   ```
   - Then fix unit math in:
     - tests/test_html_report.py (remove /1000).
     - tests/api/test_mytko_adapter.py (remove overallWeight assertions).
     - tests/api/test_rolling_forecast_endpoint.py (remove /1000 conversions for pred_m3 and actual_m3 derivation).
     - tests/sites/test_reconcile.py and tests/sites/test_reconcile_branches.py (update comments and expected sums to m3).

2) **District forecast tests**: rename forecast_tonnes -> forecast_m3; waste_tonnes -> actual_m3.
   - Files:
     - tests/unit/test_daily_semantics.py
     - tests/unit/test_monthly_semantics.py
     - tests/viz/test_quicklook_unit.py
     - tests/e2e/test_cli_and_outputs.py
   - Bulk rename:
   ```commands
   python - <<'PY'
   from pathlib import Path
   files = [
       Path("tests/unit/test_daily_semantics.py"),
       Path("tests/unit/test_monthly_semantics.py"),
       Path("tests/viz/test_quicklook_unit.py"),
       Path("tests/e2e/test_cli_and_outputs.py"),
   ]
   for path in files:
       text = path.read_text()
       text = text.replace("forecast_tonnes", "forecast_m3")
       text = text.replace("waste_tonnes", "actual_m3")
       path.write_text(text)
   PY
   ```

3) **Docs**: rename pred_volume_m3 -> pred_volume_m3 and collect_volume_m3 -> collect_volume_m3; update forecast_tonnes to forecast_m3.
   - Files to update:
     - docs/data/SITE_DATA_CONTRACT.md
     - docs/data/QUERY_PATTERNS.md
     - docs/data/DATA_CONTRACTS.md
     - docs/System/API_Endpoints.md
     - docs/Tasks/PR-API-Sites-v1.md
     - docs/Tasks/PR-17_routes_forecast_be.md
     - docs/Tasks/PR-18_site_forecast_be.md
     - docs/Tasks/PR-19_volume_first_fillpct_be.md
     - docs/Tasks/PR-S1_sites_ingest.md
     - docs/Tasks/PR-S2_site_baseline_and_sim.md
     - docs/Tasks/PR-S6_site_backtest.md
     - docs/Tasks/PR-17_routes_forecast_ui.md
     - docs/Tasks/PR-DEMO_dual_ui_complete.md
     - docs/Tasks/TESTS_PHASE_B_PLAN.md
     - ai-docs/pro_messages/PRO2.md
     - ai-docs/pro_messages/PRO3.md
   - Bulk rename:
   ```commands
   python - <<'PY'
   from pathlib import Path
   files = [
       Path("docs/data/SITE_DATA_CONTRACT.md"),
       Path("docs/data/QUERY_PATTERNS.md"),
       Path("docs/data/DATA_CONTRACTS.md"),
       Path("docs/System/API_Endpoints.md"),
       Path("docs/Tasks/PR-API-Sites-v1.md"),
       Path("docs/Tasks/PR-17_routes_forecast_be.md"),
       Path("docs/Tasks/PR-18_site_forecast_be.md"),
       Path("docs/Tasks/PR-19_volume_first_fillpct_be.md"),
       Path("docs/Tasks/PR-S1_sites_ingest.md"),
       Path("docs/Tasks/PR-S2_site_baseline_and_sim.md"),
       Path("docs/Tasks/PR-S6_site_backtest.md"),
       Path("docs/Tasks/PR-17_routes_forecast_ui.md"),
       Path("docs/Tasks/PR-DEMO_dual_ui_complete.md"),
       Path("docs/Tasks/TESTS_PHASE_B_PLAN.md"),
       Path("ai-docs/pro_messages/PRO2.md"),
       Path("ai-docs/pro_messages/PRO3.md"),
   ]
   for path in files:
       text = path.read_text()
       text = text.replace("pred_volume_m3", "pred_volume_m3")
       text = text.replace("collect_volume_m3", "collect_volume_m3")
       text = text.replace("forecast_tonnes", "forecast_m3")
       text = text.replace("waste_tonnes", "actual_m3")
       path.write_text(text)
   PY
   ```

4) **OpenAPI**: regenerate after code changes.
   ```commands
   python scripts/export_openapi.py --write
   ```

## Tests & Validation
- Core site pipeline:
  - python -m pytest -q tests/sites/test_data_loader.py tests/sites/test_site_baseline.py tests/sites/test_site_simulator.py tests/sites/test_rolling_forecast.py tests/sites/test_reconcile.py tests/sites/test_reconcile_branches.py
- API:
  - python -m pytest -q tests/api/test_rolling_forecast_endpoint.py tests/api/test_site_forecast_v1.py tests/api/test_api_routes_forecast.py tests/api/test_api_sites_v1.py tests/api/test_sites_headers_filters_csv.py tests/api/test_sites_empty_csv_header_only.py tests/api/test_sites_paging_large_offset.py tests/api/test_routes_collection_join_and_csv.py tests/api/test_mytko_adapter.py
- Exports/scripts:
  - python -m pytest -q tests/test_export_validation.py tests/test_bundle_cli.py tests/test_html_report.py tests/test_data_access.py tests/routes/test_recommend.py
- District pipeline:
  - python -m pytest -q tests/unit/test_daily_semantics.py tests/unit/test_monthly_semantics.py tests/viz/test_quicklook_unit.py tests/e2e/test_cli_and_outputs.py
- OpenAPI export:
  - python scripts/export_openapi.py --write
  - python -m pytest -q tests/test_openapi_export.py

## Rollback
- Revert code/doc changes:
  - git checkout -- src/sites scripts tests docs ai-docs
- Clear caches generated with new columns (if needed):
  - rm -f data/cache/forecasts/*.parquet data/cache/forecasts/*.meta.json

## Handoff
- Update docs/SESSION_HANDOFF.md with summary and test results once execution completes.
