# Phase 1 PRD: Rolling-Cutoff Forecast Validation Demo

## Overview

**Purpose**: Phase 1 is a demo environment designed for the Jury team to validate forecast accuracy and conduct algorithm iteration experiments. This is NOT a production system—it prioritizes rapid iteration and blind validation over scale and operational robustness.

**Primary Users**:
- **Jury Team**: Algorithm validation, metrics analysis, iteration decisions
- **Artem**: Product demonstrations, stakeholder updates

**Timeline**: Validation window of ~4-6 weeks, with weekly iteration cycles on algorithm improvements.

---

## In-Scope for Phase 1

### Core Functionality
- **Rolling-cutoff forecasts** with 1-365 day horizons
- **24k waste collection sites** across the service region
- **Blind validation protocol** ensuring zero data leakage between iterations
- **Metrics tracking and upload** for iteration decision-making
- **Pre-generated bundles** in CSV, Excel, and JSON formats
- **Static HTML report viewer** for top 500 sites (read-only dashboard)
- **OpenAPI documentation** for programmatic forecast access

### Data Foundation
- **sites_service.csv**: 5.6M rows of historical service data (2023-2025)
- **sites_registry.csv**: Master registry of ~24k sites with metadata
- **Forecast cache**: Pre-computed forecasts in Parquet format (refreshed on demand)

### Key Features
- District-level filtering via API
- WAPE (Weighted Absolute Percentage Error) metrics per iteration
- Site-level error distributions
- Iteration comparison reports (before/after algorithm changes)
- CSV export for offline analysis

---

## Out-of-Scope for Phase 1

| Feature | Target Phase | Reason |
|---------|--------------|--------|
| ClickHouse migration | Phase 2 | Current Parquet cache sufficient for demo scale |
| Structured feedback collection | Phase 2 | Manual metrics upload currently adequate |
| Rollout recommendations | Phase 2 | Require production SLA analysis |
| Multi-tenant support | Phase 3+ | Single-region focus for Phase 1 |
| Production SLA/monitoring | Phase 3 | Demo-grade infrastructure acceptable |
| Real-time forecast updates | Phase 2 | Batch generation (24h cadence) sufficient |
| Web-based metrics upload UI | Phase 1.5 | CLI tools adequate for Jury |
| Advanced visualization | Phase 2 | Static HTML sufficient for initial validation |

---

## Data Sources

### Primary Datasets
1. **sites_service.csv** (5.6M rows)
   - Format: CSV with headers
   - Date range: 2023-01-01 to 2025-12-31
   - Columns: site_id, date, pickups, collect_volume_m3, region, district
   - Location: `data/sites_service.csv`

2. **sites_registry.csv** (~24k rows)
   - Format: CSV with headers
   - Columns: site_id, name, region, district, category, active_since
   - Location: `data/sites_registry.csv`

### Derived Data
- **Forecast cache**: Parquet files in `cache/forecasts/`
  - Format: Partitioned by site_id, date range
  - Updated by: `scripts/generate_rolling_forecasts.py`
  - Lifecycle: 24-hour refresh (manual trigger in Phase 1)

---

## Limitations

### Scalability
- **Single-region scope**: Demo covers one geographic region; sites in other regions not included
- **Top 500 sites in HTML viewer**: Full 24k coverage available via API/CSV export
- **~15s generation time**: Batch forecast generation for all 24k sites (observed in benchmarks)

### Data Freshness
- **No real-time updates**: Forecasts are batch-generated (on-demand, not continuous)
- **Cutoff date selection**: Jury selects past dates (up to 2025-05-31) to validate historical accuracy

### Validation Environment
- **Parquet-only persistence**: No relational database; forecast cache is Parquet files
- **Manual metrics upload**: CLI script to ingest validation results; no web UI
- **Limited alert/monitoring**: Phase 1 is observer-only; no automated escalations

### API & Access
- **Read-only forecast access**: No ability to create new forecast models in Phase 1
- **District filtering only**: Regional/site-level subsetting supported; custom cohorts not supported
- **No authentication**: Single-user demo environment

---

## Success Criteria

### Quantitative Targets
1. **Overall WAPE < 15%**
   - Industry benchmark for waste collection forecasts
   - Measured across all 24k sites, 365-day horizon
   - Evaluated by Jury after blind validation

2. **Site Coverage ≥80%**
   - At least 80% of sites achieve individual error ≤20%
   - Demonstrates consistent quality across diverse site types

3. **Forecast Horizon Coverage**
   - Successfully validates predictions 30+ days ahead
   - Jury confirms confidence in 60-90 day horizons for operational use

4. **Iteration Improvement**
   - WAPE metric decreases measurably each iteration
   - Demonstrates algorithm learning; validates blind validation protocol

### Qualitative Targets
5. **Blind Protocol Confirmation**
   - Jury certifies no data leakage detected between iterations
   - Validation dataset remains isolated from training data

6. **Go/No-Go Decision**
   - Jury issues formal decision: "Ready for production rollout" OR "Needs further refinement"
   - Clear criteria documented for advancement to Phase 2

---

## Dependencies

### Runtime
- **Python 3.11.3**: For backend (recently upgraded from 3.9.1 for type annotation compatibility)
- **Node.js 18+**: For frontend (optional; HTML viewer is static)
- **pip packages**: See `requirements.txt` (scikit-learn, pandas, pyarrow, fastapi, uvicorn, pytest)

### Data Dependencies
- **Parquet libraries**: `pyarrow` (built into pandas for Phase 1)
- **CSV parsing**: Standard library `csv` module
- **No external databases**: ClickHouse migration deferred to Phase 2

### Infrastructure
- **Compute**: Single machine capable of ~15s full dataset forecast generation
- **Storage**: ~2GB for forecast cache + source data
- **Network**: None required for batch processing; optional for API deployment

---

## Glossary

- **WAPE**: Weighted Absolute Percentage Error; weighted average of absolute percentage errors across sites
- **Rolling cutoff**: Forecast generated for a historical date, then validated against actual future data
- **Blind validation**: Jury team does not see algorithm details; focuses on metrics and patterns only
- **Parquet cache**: Compressed columnar storage format for forecast efficiency
- **Batch generation**: All-at-once forecast computation (vs. real-time streaming)
- **Site cohort**: Subset of 24k sites filtered by region, district, or custom criteria

---

## Contact & Questions

For Phase 1 PRD clarifications, contact Artem (product lead).
For technical implementation questions, see the task dependency graph in the project README.
