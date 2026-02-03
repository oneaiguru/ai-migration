# Data Quality Analysis for Forecast Validation Readiness

## Overview

A DuckDB-based Python script (`scripts/analyze_data_quality.py`) that analyzes forecast data quality across three dimensions:
1. **Coverage** - Registry overlap, service history, date completeness
2. **Distribution** - Statistics, outliers, baseline comparison
3. **Structural Integrity** - Duplicates, nulls, negative values, malformed IDs

## Script Location

`/projects/forecastingrepo/scripts/analyze_data_quality.py`

## Usage

```bash
cd /projects/forecastingrepo

# Basic usage
python scripts/analyze_data_quality.py --outdir reports/data_quality

# With overrides (paths + baseline year + window)
python scripts/analyze_data_quality.py \
  --forecast-path jury_blind_forecast/forecast_jun_dec_2025.csv \
  --service-path data/sites_service.csv \
  --registry-path data/sites_registry.csv \
  --forecast-start 2025-06-01 \
  --forecast-end 2025-12-31 \
  --baseline-year 2023 \
  --outdir reports/data_quality_2023
```

## Analysis Components

### 1. Coverage Analysis
Checks data completeness across three vectors:

**Registry Overlap**
- Verifies forecast sites exist in sites_registry.csv
- Expected: 100% (all forecast sites should be in registry)
- Output: `coverage_missing_registry.csv` (if any issues)

**Service History**
- Checks if forecast sites have historical service data
- Expected: High percentage (sites with no history cannot be validated)
- Severity: **WARNING** if any sites lack history
- Output: `coverage_no_history.csv`

**Date Completeness**
- Verifies all forecast dates present for each site (Jun 1 - Dec 31, 214 days)
- Expected: 100% per site (no gaps)
- Severity: **INFO** if gaps exist
- Output: `coverage_date_gaps.csv`

### 2. Distribution Analysis
Analyzes forecast value distribution and reasonableness:

**Forecast Statistics**
- Computes min/max/median/mean/std/percentiles from daily deltas
- Daily deltas: converts cumulative forecast to incremental values
- Output: `distribution_stats.csv`

**3-Sigma Outliers**
- Identifies extreme values: forecast_m3 > (mean + 3 * stdev)
- Severity: **WARNING** if any outliers
- Output: `distribution_outliers.csv` (top 100)

**Baseline Comparison**
- Compares Jun-Dec forecast totals to Jun-Dec baseline year actuals
- Flags extreme deviations: ratio >5.0 (5x) or <0.2 (1/5x)
- Percentages are calculated against forecast sites with baseline coverage
- Severity: **WARNING** if any deviations
- Output: `distribution_baseline.csv`

### 3. Structural Integrity Analysis
Checks data quality and consistency:

**Duplicates**
- Identifies duplicate (site_id, date) pairs
- Severity: **BLOCKER** if any found
- Output: `structural_duplicates.csv`

**Null Values**
- Checks for missing values in critical columns
- Severity: **BLOCKER** if any nulls in site_id/date/forecast_m3
- Output: `structural_nulls.csv`

**Negative Values**
- Flags negative forecast_m3 values (invalid)
- Severity: **BLOCKER** if any found
- Output: `structural_negatives.csv`

**Malformed Site IDs**
- Detects excessive quoting (>4 consecutive quotes)
- Detects control characters
- Severity: **INFO**
- Output: `structural_malformed.csv`

## Output Files

### Main Report
- **REPORT.md** - Executive summary with:
  - Overall verdict: 🟢 READY / 🟡 PROCEED WITH CAUTION / 🔴 NOT READY
  - Severity counts (BLOCKER/WARNING/INFO)
  - Detailed analysis sections
  - Recommendations

### Methodology Documentation
- **METHODOLOGY.md** - Reproducibility information:
  - Parameters used
  - Data source SHA256 hashes
  - Command to reproduce
  - Algorithm descriptions

### Detailed CSV Outputs
- `coverage_missing_registry.csv` - Sites not in registry
- `coverage_no_history.csv` - Sites with no service history
- `coverage_date_gaps.csv` - Sites missing forecast dates
- `distribution_stats.csv` - Overall forecast statistics
- `distribution_outliers.csv` - Extreme outliers
- `distribution_baseline.csv` - Baseline deviations
- `structural_duplicates.csv` - Duplicate rows
- `structural_nulls.csv` - Rows with null values
- `structural_negatives.csv` - Negative forecast values
- `structural_malformed.csv` - Malformed site IDs

## Severity Classification

| Level | Icon | Meaning | Action Required |
|-------|------|---------|-----------------|
| BLOCKER | 🔴 | Critical issue | Fix before use |
| WARNING | 🟡 | Accuracy concern | Use with caution |
| INFO | 🔵 | Minor issue | Awareness only |

## Verdict Examples

**🟢 READY** - No BLOCKER or WARNING issues found
- Safe to use forecast for validation
- Minor INFO issues only

**🟡 PROCEED WITH CAUTION** - WARNING issues present
- Forecast can be used but some sites may have accuracy issues
- Review warning details carefully

**🔴 NOT READY** - BLOCKER issues present
- Cannot use forecast until issues resolved
- Examples: duplicates, null values, negative values

## Performance Considerations

### Current Implementation
- DuckDB scans CSVs once and executes SQL checks in seconds to low-minutes on 5M-row datasets.
- If runtime is slow, consider reducing I/O overhead or running on faster disk.

### Optimization Options (Future)
1. **Database**: Migrate to ClickHouse/PostgreSQL for heavier workloads
2. **Partitioning**: Pre-partition by site/date for faster window scans
3. **Sampling**: Use representative samples for exploratory stats

## Example Report Output

```
# Data Quality Analysis Report

**Generated:** 2025-12-30T10:30:00

### Verdict: 🟡 PROCEED WITH CAUTION
**Status:** Forecast can be used but some sites may have accuracy issues

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 BLOCKER | 0 | None |
| 🟡 WARNING | 2 | Sites with no service history (5) | Extreme deviations (2) |
| 🔵 INFO | 1 | Malformed site_ids (3) |

## Coverage Analysis
Registry Overlap: 100.0%
Service History: 99.8% (23,410/23,413 sites)
Date Completeness: 99.9%

## Distribution Analysis
Forecast Statistics (Daily Deltas):
- Mean: 1.23 m3
- Median: 0.85 m3
- Range: 0.01 to 152.45 m3
```

## Integration with Jury Validation

This analysis is designed to precede the blind validation workflow:

1. Run `analyze_data_quality.py` → Get quality report
2. Review severity findings
3. If ready: Proceed to `validate_forecast.py` (blind validation)
4. Use `ingest_validation_metrics.py` to track iteration improvements

## Technical Details

### Data Sources
- **Forecast**: `jury_blind_forecast/forecast_jun_dec_2025.csv` (5M rows, 189 MB)
- **Service**: `data/sites_service.csv` (5.6M rows, 711 MB)
- **Registry**: `data/sites_registry.csv` (26k sites, 12 MB)

### Memory Efficiency
- DuckDB streams CSVs with typed columns and pushes filtering to SQL.
- No pandas DataFrames are kept in memory.
- CSVs are loaded once into temporary tables.

### Command Example
```bash
python scripts/analyze_data_quality.py \
    --baseline-year 2024 \
    --outdir reports/data_quality
```

## Troubleshooting

**Script runs slowly**
- Check disk I/O; CSV scans are fastest on SSD.
- Narrow the forecast window for quick diagnostics.

**Missing duckdb**
- Install the dependency: `python3.11 -m pip install \"duckdb>=1.0.0\"`

**Missing output files**
- Check that outdir exists and is writable
- Verify input CSV files are accessible
- Check for errors in console output

## Related Documentation

- [Blind Validation Protocol](docs/data/BLIND_VALIDATION_PROTOCOL.md)
- [Query Patterns](docs/data/QUERY_PATTERNS.md)
- [API Accuracy](src/sites/api_accuracy.py)
