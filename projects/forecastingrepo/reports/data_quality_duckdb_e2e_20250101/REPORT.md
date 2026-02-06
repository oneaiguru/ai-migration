# Data Quality Analysis Report

**Generated:** 2025-12-30T22:55:56.019608
**Git Commit:** c89d5168
**Forecast Window:** 2025-06-01 to 2025-12-31

## Verdict: 🟢 READY
Data quality acceptable for validation

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 BLOCKER | 0 | None |
| 🟡 WARNING | 0 | None |
| 🔵 INFO | 1 | malformed_ids_any=6 |

---

## 1. Coverage Analysis

| Metric | Value | Status |
|--------|-------|--------|
| Forecast Sites | 23,413 | - |
| Registry Overlap | 100.0% | ✅ OK |
| Has Service History | 100.0% | ✅ OK |
| Date Completeness | 100.0% | ✅ OK |

**Sites with No History:** 0 → See `coverage_no_history.csv`
**Sites with Date Gaps:** 0 → See `coverage_date_gaps.csv`

---

## 2. Distribution Analysis

| Statistic | Value |
|-----------|-------|
| Mean (daily delta) | 0.93 m³ |
| Median | 0.30 m³ |
| Std Dev | 1.96 m³ |
| Range | 0.00 - 66.71 m³ |

**3-Sigma Outliers:** 107569 (2.1%) → See `distribution_outliers.csv`
**Baseline Deviations:** 1003 sites → See `distribution_baseline.csv`

---

## 3. Structural Integrity

| Check | Count | Severity |
|-------|-------|----------|
| Duplicates | 0 | ✅ OK |
| Null Values | 0 | ✅ OK |
| Negative Values | 0 | ✅ OK |
| Malformed IDs | 6 | 🔵 INFO |

---

## Output Files

| File | Rows | Description |
|------|------|-------------|
| coverage_no_history.csv | 0 | Sites with no service history |
| coverage_date_gaps.csv | 0 | Sites missing forecast dates |
| distribution_stats.csv | 1 | Summary statistics |
| distribution_outliers.csv | 100 | 3-sigma outliers (top 100) |
| distribution_baseline.csv | 1003 | Extreme baseline deviations |
| structural_duplicates.csv | 0 | Duplicate rows |
| structural_nulls.csv | 0 | Rows with null values |
| structural_negatives.csv | 0 | Negative forecast values |
| structural_malformed.csv | 6 | Malformed site IDs |

---
