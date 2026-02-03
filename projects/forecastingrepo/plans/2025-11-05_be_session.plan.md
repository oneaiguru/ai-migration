## Metadata
- Task: Backend demo freeze follow-ups (core pipeline, site backtest summary, scenario/docs cleanup, demo smokes)
- Discovery: `../docs/Tasks/BE_AGENT_SESSION.md` (scope + gates), `docs/Tasks/NEXT_AGENT_SCOUT.md` (file anchors), review bundles under `reviews/20251105/`
- Related docs: `reviews/DEMO_FREEZE.md`, `reviews/NOTES/api.md`, `reviews/20251105/core_pipeline/2_followup/backend_sites.md`, `reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md`, `reviews/20251105/postreview/shared/IMPLEMENTATION_GUIDE.md`, `reviews/20251105/docs_and_schema/2_followup/docs_scenarios_data.md`

## Desired End State
The core site pipeline honours the reviewer patches (flagged simulator reset, safe baseline fallback, unmapped-site warnings) without changing the default forecast, the site backtest SUMMARY reports aggregate site-level WAPE plus per-site distribution, scenario/docs lint issues are eliminated, demo env smoke outputs are refreshed in `reviews/NOTES/api.md`, and regression gates stay green with review registry updated.

### Key Discoveries
- `../docs/Tasks/BE_AGENT_SESSION.md:13-38` enumerates the required fixes, demo env and registry updates for this session.
- `docs/Tasks/NEXT_AGENT_SCOUT.md:9-118` maps exact line anchors for simulator/baseline/reconcile, site backtest summary, and scenario/docs cleanup.
- `reviews/20251105/core_pipeline/2_followup/backend_sites.md:1-68` confirms the simulator reset, baseline fallback, and unmapped-site warning were not present at review time and block a sites-enabled demo.
- `reviews/20251105/backtesting_eval/2_followup/backend_site_backtest.md:1-44` plus `reviews/20251105/postreview/shared/IMPLEMENTATION_GUIDE.md:1-200` document the missing aggregate site-level WAPE summary and provide the accepted implementation pattern.
- `reviews/20251105/docs_and_schema/2_followup/docs_scenarios_data.md:1-86` highlights the malformed `scenarios/site_level.yml` and hardcoded path in `docs/data/DATA_INVENTORY.md` that must be fixed for demo readiness.
- `reviews/DEMO_FREEZE.md:1-29` defines the env vars and four curl smokes required pre-demo.
- `reviews/NOTES/api.md:1-33` shows where to record the latest smoke outputs for reviewer visibility.

## What We're NOT Doing
- No changes to forecasting behaviour, golden hashes, or default scenarios; the simulator reset remains behind the new flag.
- No edits to UI code beyond verifying smokes; UI handoff already complete.
- No new data ingestion or weather feature work (flag remains off); weather/study tasks stay deferred.
- No modifications to API endpoints beyond env configuration; rate limiting, DictWriter, and security headers already landed.

## Implementation Approach
Work in review-driven phases: first ensure core pipeline helpers align with reviewer patches and add guardrail tests, then implement the site backtest summary upgrade with accompanying unit coverage, clean up scenario/docs per docs review, run demo env checks (env vars + curls) while capturing outputs, and finally run regression suites plus update the review registry and handoff log.

## Phase 1: Core Pipeline Guardrails
### Overview
Align simulator, baseline, and reconcile helpers with reviewer expectations while keeping defaults unchanged (flag off).
### Changes Required
1. Reorder the near-capacity reset in the simulator to trigger before computing fill percentage when the flag is enabled, mirroring the reviewer patch.
   **File**: `src/sites/simulator.py`
   **Changes**: Move the `reset_on_near_capacity` block ahead of `fill_pct` calculation and guard against zero capacity.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: src/sites/simulator.py
   @@
   -        for d in dates:
   -            wd = wd_map[d]
   -            rate = float(rates_row.get(wd, 0.0))
   -            fill_volume_m3 = max(0.0, fill_volume_m3 + rate)
   -            fill_pct = 0.0 if cap_l <= 0 else min(1.0, fill_volume_m3 / cap_l)
   -            overflow = 1 if fill_pct >= overflow_threshold else 0
   -            out_rows.append((site_id, d.isoformat(), fill_pct, fill_volume_m3, overflow))
   -            if reset_on_near_capacity and fill_pct >= 0.98:
   -                fill_volume_m3 = 0.0
   +        for d in dates:
   +            wd = wd_map[d]
   +            rate = float(rates_row.get(wd, 0.0))
   +            fill_volume_m3 = max(0.0, fill_volume_m3 + rate)
   +            if reset_on_near_capacity and cap_l > 0 and fill_volume_m3 >= cap_l * 0.98:
   +                fill_volume_m3 = 0.0
   +            fill_pct = 0.0 if cap_l <= 0 else min(1.0, fill_volume_m3 / cap_l)
   +            overflow = 1 if fill_pct >= overflow_threshold else 0
   +            out_rows.append((site_id, d.isoformat(), fill_pct, fill_volume_m3, overflow))
   PATCH
   ```
2. Add a regression-focused unit test that enables the reset flag and asserts the final day resets to zero mass, avoiding behavioural surprises.
   **File**: `tests/sites/test_site_simulator.py` (new)
   **Changes**: Introduce a focused test covering the flag path.
   ```commands
   cat <<'EOF' > tests/sites/test_site_simulator.py
   import pandas as pd
   from datetime import date
   
   from src.sites.simulator import simulate_fill
   
   def test_simulate_fill_resets_near_capacity():
       reg = pd.DataFrame([
           {"site_id": "S1", "bin_count": 1, "bin_size_liters": 1100},
       ])
       weekday_rates = pd.DataFrame([
           {"site_id": "S1", "weekday": wd, "rate_m3_per_day": 250.0}
           for wd in range(7)
       ])
       out = simulate_fill(
           reg,
           weekday_rates,
           start_dt=date(2024, 10, 1),
           end_dt=date(2024, 10, 4),
           capacity_liters=1000,
           overflow_threshold=0.8,
           reset_on_near_capacity=True,
       )
       last_row = out[out["date"] == "2024-10-04"].iloc[0]
       assert float(last_row["pred_volume_m3"]) == 0.0
       assert float(last_row["fill_pct"]) == 0.0
   EOF
   ```
3. Ensure the baseline fallback remains explicit by adding a clarifying comment (reviewers expect the `.fillna(0.0)` safeguard).
   **File**: `src/sites/baseline.py`
   **Changes**: Document the fallback rationale while keeping behaviour unchanged.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: src/sites/baseline.py
   @@
   -    agg = agg.merge(overall, on="site_id", how="left")
   -    agg["overall"] = agg["overall"].fillna(0.0)
   +    agg = agg.merge(overall, on="site_id", how="left")
   +    # Review follow-up: missing overall means must fallback to 0.0 instead of propagating NaN
   +    agg["overall"] = agg["overall"].fillna(0.0)
   PATCH
   ```
4. Confirm the reconcile helper warns on unmapped sites with a unit test capturing the warning and default district assignment.
   **File**: `tests/sites/test_site_reconcile.py` (new)
   **Changes**: Add test scaffolding around `reconcile_sites_to_district` to assert warning + fill value.
   ```commands
   cat <<'EOF' > tests/sites/test_site_reconcile.py
   import pandas as pd
   import pytest
   
   from src.sites.reconcile import reconcile_sites_to_district
   
   def test_reconcile_warns_and_marks_unmapped_sites():
       site_df = pd.DataFrame([
           {"site_id": "S1", "date": "2024-10-01", "pred_volume_m3": 10.0, "fill_pct": 0.5, "overflow_prob": 0.0},
       ])
       registry_df = pd.DataFrame([], columns=["site_id", "district"])
       district_fc_df = pd.DataFrame([
           {"date": "2024-10-01", "district": "D1", "forecast_tonnes": 0.01},
       ])
       with pytest.warns(RuntimeWarning):
           adjusted, debug_df, warns = reconcile_sites_to_district(site_df, registry_df, district_fc_df)
       assert "__unmapped__" in adjusted["district"].unique()
   EOF
   ```

## Phase 2: Site Backtest Summary Upgrade
### Overview
Implement the aggregate WAPE helper and enhanced summary, with tests asserting the new metrics.
### Changes Required
1. Add `compute_site_aggregate_wapes` and replace `write_summary` per the reviewer guide.
   **File**: `scripts/backtest_sites.py`
   **Changes**: Insert new helper after `mae` and replace `write_summary` with the aggregate implementation, ensuring imports remain at top.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: scripts/backtest_sites.py
   @@
   -def mae(a: float, yhat: float) -> float:
   -    return abs(a - yhat)
   +def mae(a: float, yhat: float) -> float:
   +    return abs(a - yhat)
   +
   +
   +def compute_site_aggregate_wapes(monthly_path: str) -> tuple[float, dict[str, float]]:
   +    """Compute overall and per-site aggregate WAPE from the monthly scoreboard."""
   +    site_errors = defaultdict(float)
   +    site_actuals = defaultdict(float)
   +    total_error = 0.0
   +    total_actual = 0.0
   +    with open(monthly_path, newline="", encoding="utf-8") as f:
   +        reader = csv.DictReader(f)
   +        for rec in reader:
   +            sid = rec.get("site_id", "").strip()
   +            if not sid:
   +                continue
   +            a = float(rec.get("actual", 0.0) or 0.0)
   +            yhat = float(rec.get("forecast", 0.0) or 0.0)
   +            error = abs(a - yhat)
   +            site_errors[sid] += error
   +            site_actuals[sid] += abs(a)
   +            total_error += error
   +            total_actual += abs(a)
   +    overall = total_error / (total_actual if total_actual > 0 else EPS)
   +    site_wapes: dict[str, float] = {}
   +    for sid, err_sum in site_errors.items():
   +        denom = site_actuals[sid]
   +        site_wapes[sid] = err_sum / (denom if denom > 0 else EPS)
   +    return overall, site_wapes
   @@
   -def write_summary(outdir: str, monthly_path: str) -> str:
   -    # Compute simple quantiles over per-row WAPE
   -    wapes = []
   -    with open(monthly_path, newline="", encoding="utf-8") as f:
   -        r = csv.DictReader(f)
   -        for rec in r:
   -            try:
   -                wapes.append(float(rec.get("wape") or 0.0))
   -            except Exception:
   -                pass
   -    if not wapes:
   -        wapes = [0.0]
   -    wapes_sorted = sorted(wapes)
   -    def q(p: float) -> float:
   -        if not wapes_sorted:
   -            return 0.0
   -        k = int(p * (len(wapes_sorted) - 1))
   -        return wapes_sorted[k]
   -    text = [
   -        "# Site Backtest Summary",
   -        "",
   -        f"Rows (monthly): {len(wapes_sorted)}",
   -        f"WAPE median: {q(0.5):.4f}",
   -        f"WAPE P75: {q(0.75):.4f}",
   -        f"WAPE P90: {q(0.90):.4f}",
   -    ]
   +def write_summary(outdir: str, monthly_path: str) -> str:
   +    """Write SUMMARY.md with aggregate WAPE plus distribution stats."""
   +    overall_wape, site_wapes = compute_site_aggregate_wapes(monthly_path)
   +    row_errors = []
   +    with open(monthly_path, newline="", encoding="utf-8") as f:
   +        reader = csv.DictReader(f)
   +        for rec in reader:
   +            try:
   +                row_errors.append(float(rec.get("wape") or 0.0))
   +            except Exception:
   +                continue
   +    if not row_errors:
   +        row_errors = [0.0]
   +    row_errors.sort()
   +    site_values = sorted(site_wapes.values())
   +    def quantile(values: list[float], p: float) -> float:
   +        if not values:
   +            return 0.0
   +        k = int(p * (len(values) - 1))
   +        return values[k]
   +    text = [
   +        "# Site Backtest Summary",
   +        "",
   +        "## Aggregate WAPE (True Micro-Average)",
   +        f"**Overall site-level WAPE: {overall_wape:.4f} ({overall_wape*100:.2f}%)**",
   +        f"Sites evaluated: {len(site_wapes)}",
   +        f"Monthly observations: {len(row_errors)}",
   +        "",
   +        "## Per-Site WAPE Distribution",
   +        f"Median per-site WAPE: {quantile(site_values, 0.5):.4f}",
   +        f"P75 per-site WAPE: {quantile(site_values, 0.75):.4f}",
   +        f"P90 per-site WAPE: {quantile(site_values, 0.90):.4f}",
   +        "",
   +        "## Row-Level Error Statistics (Reference)",
   +        f"Median normalized error: {quantile(row_errors, 0.5):.4f}",
   +    ]
   +    sorted_sites = sorted(site_wapes.items(), key=lambda x: x[1])
   +    if sorted_sites:
   +        text.append("")
   +        text.append("## Best Sites (Lowest WAPE)")
   +        for sid, val in sorted_sites[:5]:
   +            text.append(f"- {sid}: {val:.4f} ({val*100:.2f}%)")
   +        text.append("")
   +        text.append("## Worst Sites (Highest WAPE)")
   +        for sid, val in reversed(sorted_sites[-5:]):
   +            text.append(f"- {sid}: {val:.4f} ({val*100:.2f}%)")
   PATCH
   ```
2. Extend the site backtest unit test to assert the new SUMMARY contents and add a fixture-driven check for overall WAPE.
   **File**: `tests/sites/test_backtest_sites_unit.py`
   **Changes**: After running the script, read SUMMARY.md and assert presence of aggregate WAPE lines, plus simple numeric sanity checks.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: tests/sites/test_backtest_sites_unit.py
   @@
       summary = outdir / "SUMMARY.md"
       assert daily.exists() and monthly.exists() and summary.exists()
   @@
       assert pytest.approx(df["rate_m3_per_day"].unique()[0], rel=1e-6) == 1.5
   +    text = summary.read_text(encoding="utf-8")
   +    assert "Overall site-level WAPE" in text
   +    assert "Median per-site WAPE" in text
   +    assert "Best Sites (Lowest WAPE)" in text
   PATCH
   ```
3. Add a lightweight assertion in the E2E test to confirm SUMMARY is identical across runs and still contains the aggregate section.
   **File**: `tests/sites/test_backtest_sites_e2e.py`
   **Changes**: After hash comparison, read SUMMARY once and assert the aggregate header exists.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: tests/sites/test_backtest_sites_e2e.py
   @@
       for name in ["scoreboard_site_daily.csv", "scoreboard_site_monthly.csv", "SUMMARY.md"]:
           p1 = (out1 / name)
           p2 = (out2 / name)
           assert p1.exists() and p2.exists()
           assert _hash(p1) == _hash(p2)
   +    assert "Overall site-level WAPE" in (out1 / "SUMMARY.md").read_text(encoding="utf-8")
   PATCH
   ```

## Phase 3: Scenario & Documentation Cleanup
### Overview
Fix YAML/doc issues blocking demo sign-off.
### Changes Required
1. Trim the markdown tail, set explicit tolerance, and expose the simulator flag default in the scenario.
   **File**: `scenarios/site_level.yml`
   **Changes**: Remove content after the `qa` block, set `tolerance_pct: 0.005  # 0.5% tolerance`, and add `reset_on_near_capacity: false`.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: scenarios/site_level.yml
   @@
     simulator:
       overflow_threshold_pct: 0.8
       lookahead_days: 3
       capacity_default_liters: 1100
+      reset_on_near_capacity: false
     reconciliation:
       method: proportional   # or 'warn_only'
-      tolerance_pct: 0.5
+      tolerance_pct: 0.005  # 0.5% tolerance
@@
-qa:
-  enforce_unique_keys: true
-  nonnegative: true
-
----
-```
-
----
-
-## How we’ll use *your* Excel immediately
-
-We can ingest your two files (H1 & H2 2024) in **PR‑S1** via the new loader:
-
-* **Sheet autodetect:** scan sheets for Russian header aliases; no more hard‑coding `sheet2.xml`.
-* **Header aliasing:** resolve “Площадка/Район/Дата/Вес, тонн/…” to canonical fields.
-* **Keying & capacity:** build a stable `site_id`; if capacities are missing, default by bin_type or `1100 L × bin_count` until we enrich the registry.
-* **Geospatial join:** if coordinates are missing, map sites to districts by polygon to keep reconciliation working.
-
-We keep **district/region outputs untouched** (flagged site scope). Once we have site forecasts, **PR‑S4** makes a simple route‑day CSV for dispatch.
-
----
-
-## When would we *consider* deeper research or a method reset?
-
-Only if **site service histories are too sparse** (e.g., ≤2 services per weekday in 8 weeks) *and* measured mass is missing for most sites. Even then, we can still launch with:
-
-* per‑site **apportionment** of district totals by bin capacity & land‑use,
-* and a **risk rule** based on days since last empty + deposit priors.
-
-Otherwise, the above S‑series is sufficient.
-
----
-
-## What to tell the coding agent (TL;DR)
-
-* **Do not** change default forecasts or golden; everything behind `--scopes sites` or `--scenario-path scenarios/site_level.yml`.
-* Implement **PR‑S1 → PR‑S4** in order using the docs in this patch.
-* Add tiny synthetic fixtures; keep coverage and spec‑sync green.
-* After S2, we’ll preview **per‑site daily forecasts**; after S4, we’ll get **visit/no‑visit CSVs** for D‑day.
-
----
-
-If you want, I can also supply mini **synthetic test fixtures** (CSV) to unblock S1/S2 while your Excel columns are confirmed, but this plan works with the files you uploaded and **doesn’t require a restart**.
+qa:
+  enforce_unique_keys: true
+  nonnegative: true
   PATCH
   ```
2. Neutralize the hardcoded local download path in the data inventory doc.
   **File**: `docs/data/DATA_INVENTORY.md`
   **Changes**: Replace the user-specific path with a generic instruction.
   ```commands
   apply_patch <<'PATCH'
   *** Update File: docs/data/DATA_INVENTORY.md
   @@
   -  - Unzip `/Users/m/Downloads/Telegram Desktop/wr352420a1 (1).zip` here → `data/raw/weather/wr352420a1/`
+  - Unzip the downloaded `wr352420a1.zip` archive into `data/raw/weather/wr352420a1/`
   PATCH
   ```

## Phase 4: Demo Env & API Smokes
### Overview
Lock env vars, verify routes data availability, and capture fresh curl outputs.
### Changes Required
1. Confirm routes CSVs exist for the demo date.
   **Command**: `ls reports/sites_demo/routes/recommendations_*_2024-08-03.csv`
2. Export the demo env vars and run the four curls, recording outputs in `reviews/NOTES/api.md` under a new dated heading.
   **Commands**:
   ```commands
   export API_CORS_ORIGIN="https://mytko-forecast-ui.vercel.app"
   export DEMO_DEFAULT_DATE="2024-08-03"
   BASE="<replace-with-current-tunnel>"
   curl -fsS "$BASE/api/metrics" | jq '{demo_default_date, region_wape, district_wape}'
   curl -fsS "$BASE/api/districts" | jq '.[0:5]'
   curl -fsS "$BASE/api/sites?date=2024-08-03&limit=5" | jq '.[0:5]'
   curl -fsS "$BASE/api/routes?date=2024-08-03&policy=strict" | jq '.[0:5]'
   ```
   After running, append the JSON snippets to `reviews/NOTES/api.md` with a `## Smoke run (<new timestamp>)` heading.

## Phase 5: Regression Gates & Review Registry
### Overview
Validate the repo and document the work for reviewers.
### Changes Required
1. Run test/documentation gates.
   **Commands**:
   ```commands
   pytest -q
   python .tools/spec_sync.py
   python .tools/docs_check.py
   ```
2. Re-run the API curls if any fixes touched data paths to confirm they still pass.
3. Update `reviews/REVIEWED_FILES.yml` with fresh hashes/status entries for each touched file (simulator, baseline, reconcile, backtest_sites, scenario, data inventory, new tests). After committing, run `git rev-parse --short HEAD -- <path>` for each file and replace the `hash` value while noting the reviewer initials per the follow-up packet.
4. Add a new entry to `docs/SESSION_HANDOFF.md` summarizing the completed plan and pointing to this plan file.

## Tests & Validation
- `pytest -q`
- `python .tools/spec_sync.py`
- `python .tools/docs_check.py`
- Four curl smokes against the demo tunnel with updated env vars.
- Optional: targeted `pytest tests/sites` if runtime becomes an issue, but full suite expected to pass quickly.

## Rollback
- To undo code/doc changes: `git checkout -- src/sites/simulator.py src/sites/baseline.py src/sites/reconcile.py scripts/backtest_sites.py scenarios/site_level.yml docs/data/DATA_INVENTORY.md tests/sites/test_backtest_sites_unit.py tests/sites/test_backtest_sites_e2e.py tests/sites/test_site_simulator.py tests/sites/test_site_reconcile.py`.
- To remove plan/test files entirely: delete the newly added files and reset the git index (`git clean -f tests/sites/test_site_simulator.py tests/sites/test_site_reconcile.py plans/2025-11-05_be_session.plan.md`).
- Revert review notes/registry updates with `git checkout -- reviews/NOTES/api.md reviews/REVIEWED_FILES.yml` if needed.

## Handoff
- Store this plan at `plans/2025-11-05_be_session.plan.md` and reference it in `docs/SESSION_HANDOFF.md` for the executor.
- Provide the executor with the latest BASE tunnel URL alongside the curl commands, and remind them to keep the simulator flag default OFF.
