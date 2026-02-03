# Forecast Data Quality Readiness Report

**Generated:** 2025-12-31T06:23:59.027536
**Git Commit:** c89d5168
**Forecast Window:** 2025-06-01 to 2025-12-31
**Baseline Window:** 2024-06-01 to 2024-12-31

## Summary

| Check | Result | Severity |
|------|--------|----------|
| Registry coverage | 100.0% (23,413/23,413) | OK |
| Has any history | 100.0% (23,413/23,413) | OK |
| Date gaps | 0 sites (0 missing dates) | OK |
| Duplicates (site_id,date) | 0 | OK |
| Null/NaN values | 0 | OK |
| Malformed site_id | 6 | INFO |
| Forecast outliers (>3σ) | 96,535 (1.93%) | WARNING |
| Forecast vs 2024 avg extremes | 21,624 (99.06% of baseline-covered) | WARNING |

## 1. Coverage Check

- **Registry coverage:** 100.0% (0 missing).
- **No history in service:** 0 sites (0.0%).
- **Date gaps:** 0 sites with gaps (0 missing site-days).

**Examples**

- Missing in registry (sample): None
- No history (sample): None
- Date gaps (sample): None

Outputs: `coverage_missing_registry.csv`, `coverage_no_history.csv`, `coverage_date_gaps.csv`

## 2. Distribution Sanity

| Dataset | Count | Mean | Median | Std Dev | Min | Max |
|---------|-------|------|--------|---------|-----|-----|
| Forecast (Jun-Dec 2025) | 5,010,382 | 99.97 | 27.72 | 243.45 | 0.00 | 10151.26 |
| Actuals (Jun-Dec 2024) | 1,485,377 | 2.91 | 1.50 | 3.45 | 0.06 | 400.25 |

- **Forecast outliers (>3σ):** 96,535 (1.93% of forecast rows).
- **Sites with baseline for comparison:** 21,830 / 23,413 (missing baseline for 1,583 sites, 6.8%).
- **Extreme forecast vs 2024 avg:** 21,624 sites (99.06% of baseline-covered sites).

**Examples**

- Outliers (sample): 38109910 2025-12-31=10151.26, 38109910 2025-12-30=10126.07, 38109910 2025-12-29=10100.80, 38109910 2025-12-28=10042.88, 38109910 2025-12-27=9986.79, 38109910 2025-12-26=9920.08, 38109910 2025-12-25=9870.94, 38109910 2025-12-24=9818.36, 38109910 2025-12-23=9793.18, 38109910 2025-12-22=9767.90
- Extreme ratios (sample): 38128502 ratio=1228.57, 38109974 ratio=348.92, 38101761 ratio=288.17, 38121660 ratio=268.88, 38100573 ratio=240.45, 38105272 ratio=212.16, 38113103 ratio=211.04, 38111482 ratio=209.24, 38100267 ratio=204.48, 38104082 ratio=203.57

Outputs: `distribution_outliers_forecast.csv`, `distribution_baseline_ratio_extremes.csv`

## 3. Structural Issues

- **Duplicate (site_id,date):** 0 (OK).
- **Null/NaN rows:** 0 (OK).
- **Malformed site_id:** 6 (INFO).

**Examples**

- Duplicates (sample): None
- Nulls (sample): None
- Malformed IDs (sample): Вдоль дороги	Ржанова 1 (CONTROL_CHAR), Красноказачья 120/4	На КП (CONTROL_CHAR), Лыткина 54	Во дворе на КП (CONTROL_CHAR), " территория общего пользования, прилегающая к забору  Курорта ""Ангара"" (к шлагбауму со стороны ул. 2-я Железнодорожная, 4) в 09:00, 11:00, 13:00" (EXCESSIVE_QUOTES), Лыткина 54А	Вдоль дороги (CONTROL_CHAR), Маршала Жукова 72/1	Морская спасательная служба (CONTROL_CHAR)

Outputs: `structural_duplicates.csv`, `structural_nulls.csv`, `structural_malformed_ids.csv`

## Notes

- Forecast outliers are based on raw forecast_m3 values (> mean + 3σ).
- Extreme ratio check compares mean daily forecast (2025) against mean daily actuals in the same months of 2024.
- Missing baseline indicates sites without any 2024 service records in Jun-Dec, which limits ratio checks.
- forecast_m3 appears cumulative per site in this dataset; compare deltas vs daily actuals for apples-to-apples ratios.
