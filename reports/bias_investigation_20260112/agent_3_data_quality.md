## Agent 3: Data Quality Check

**File:** `reports/bias_investigation_20260112/agent_3_data_quality.md`

## Findings
- Coverage: sites_service.csv spans 2023-01-01 → 2025-05-31; backtest window (2024-11-01 → 2025-05-31) has 1.454M rows, 24,178 sites, total 4.237M m³.
- Yearly volumes stable/increasing: event rows by year {2023: 2.146M, 2024: 2.453M, 2025 (through May): 1.043M}. Median events per site: 2023=39, 2024=50 (more frequent, not sparser).
- Nov–Dec volumes: 2023=1.076M m³; 2024=1.181M m³ (+~9.7%). No obvious drop that would explain under-bias.
- Outliers: 1,230 events >50 m³, 229 >100 m³; none <0.01. Suggests units are in m³; few extreme highs exist but are rare vs 5.6M rows.
- Registry coverage: 0 missing; all 25,583 service site_ids appear in data/sites_registry.csv (bin capacities absent, defaulted to 1100 L).

## Data issue identified? NO (no glaring missing-actuals or unit problems).

## Recommended action
- Keep using provided actuals; optionally winsorize extreme events (>100 m³) in sensitivity tests to see if they skew WAPE, but they are too few to drive -29% bias.
- Note that actuals stop at 2025-05-31; any future windows beyond that will show zero coverage.

## Impact estimate
- Data quality unlikely to explain the -29% bias; proceed to model/rate fixes.
