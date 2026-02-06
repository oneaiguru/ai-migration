# TASK-28: Query Patterns Documentation

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Document all data access patterns in the codebase to guide future ClickHouse schema design.

## Deliverable
Single markdown file: `docs/data/QUERY_PATTERNS.md`

## Structure

```markdown
# Query Patterns for Forecasting System

## Overview
This document describes how the forecasting system accesses data.
Used to design ClickHouse schema and migration strategy.

## Data Model

### Service Data
```
Columns: service_dt, site_id, collect_volume_m3
Granularity: Per collection event
Volume: ~5.6M rows for 2023-2025
Partitioning: By date
```

### Registry
```
Columns: site_id, address, district, bin_count, bin_size_liters
Granularity: One row per site
Volume: ~24,000 sites
Cardinality: Districts ~45
```

### Forecast Cache
```
Columns: site_id, date, fill_pct, pred_volume_m3, overflow_prob, [actual_m3, error_pct]
Granularity: Per site, per day
Indexed by: cutoff_date, start_date, end_date
```

## Query Patterns

### Pattern 1: Load Service Data (Date Range Filter)

**Name**: `load_service_data(start_date, end_date, site_ids?)`

**Purpose**: Load historical waste data for baseline estimation

**SQL Equivalent**:
```sql
SELECT service_dt, site_id, collect_volume_m3
FROM service_data
WHERE service_dt >= start_date
  AND service_dt <= end_date
  AND site_id IN (site_ids)  -- optional
ORDER BY service_dt, site_id
```

**Filter Order**: Date range (required), then site_ids (optional)

**Usage**:
- Baseline estimation (all data up to cutoff)
- Accuracy metrics computation (specific date range)
- Seasonal analysis

**ClickHouse Notes**:
- Use `Date` column type for service_dt
- Partition by toYYYYMM(service_dt)
- Primary key: (site_id, service_dt)

---

### Pattern 2: Load Registry (Site Lookup)

**Name**: `load_registry(site_ids?)`

**Purpose**: Load site metadata for joining with forecasts

**SQL Equivalent**:
```sql
SELECT site_id, address, district, bin_count, bin_size_liters
FROM registry
WHERE site_id IN (site_ids)  -- optional
```

**Filter Order**: site_ids (optional, all if not provided)

**Usage**:
- Join with service_data on site_id
- Filter forecast results by district or search
- Add metadata to forecast output

**ClickHouse Notes**:
- Use `ReplacingMergeTree` for updates
- Primary key: site_id
- Order by site_id
- No date-based partitioning needed

---

### Pattern 3: Aggregate Service Data (by Site-Date)

**Name**: `aggregate_by_site_date(service_df)`

**Purpose**: Daily totals per site for baseline estimation

**SQL Equivalent**:
```sql
SELECT
  site_id,
  toDate(service_dt) as service_date,
  SUM(collect_volume_m3) as daily_total
FROM service_data
WHERE service_dt BETWEEN start_date AND end_date
GROUP BY site_id, service_date
ORDER BY site_id, service_date
```

**Aggregation**: SUM(collect_volume_m3) per site-date

**Usage**:
- Compute daily rates for rate estimation
- Baseline input for simulation

**ClickHouse Notes**:
- Use `SumMergeTree` or aggregating function
- Consider pre-aggregated MV for common queries

---

### Pattern 4: Filter by District

**Name**: `filter_by_district(forecast_df, registry_df, district_prefix)`

**Purpose**: Restrict results to specific administrative region

**SQL Equivalent**:
```sql
SELECT f.*
FROM forecast f
JOIN registry r ON f.site_id = r.site_id
WHERE lower(r.district) LIKE lower(district_prefix) || '%'
```

**Filter**: Case-insensitive, prefix match on district name

**Usage**:
- All-sites endpoint with district filter (TASK-11)
- District aggregation endpoint (TASK-14)
- UI district dropdown

**ClickHouse Notes**:
- Join registry table (small, cacheable)
- Use `startsWith` function
- Consider denormalizing district to forecast table if high cardinality filtering

---

### Pattern 5: Search by Site ID or Address

**Name**: `search_sites(registry_df, search_term)`

**Purpose**: Find sites by ID or address substring

**SQL Equivalent**:
```sql
SELECT site_id
FROM registry
WHERE lower(site_id) LIKE '%' || lower(search_term) || '%'
   OR lower(address) LIKE '%' || lower(search_term) || '%'
```

**Filter**: Case-insensitive, substring match on site_id OR address

**Usage**:
- All-sites search input (TASK-12 / TASK-17)
- Find by address

**ClickHouse Notes**:
- Use `position(lower(site_id), lower(search_term)) > 0`
- Address likely needs full-text search index if high volume
- Consider `Array` column for tokenized address

---

### Pattern 6: Join Service + Registry

**Name**: `join_service_registry(service_df, registry_df)`

**Purpose**: Add site metadata (address, district) to service records

**SQL Equivalent**:
```sql
SELECT
  s.service_dt, s.site_id, s.collect_volume_m3,
  r.address, r.district
FROM service_data s
JOIN registry r ON s.site_id = r.site_id
```

**Join Key**: site_id (1:1 from registry side, many:1 from service side)

**Usage**:
- Forecast output generation
- Metadata in exports
- API response enrichment

**ClickHouse Notes**:
- Use `ANY` join strategy (registry is slowly changing)
- Consider `asof` join if timelines matter
- Registry is small (~24k rows), can be broadcast

---

### Pattern 7: Load Cached Forecast

**Name**: `load_cache(cutoff_date, start_date, end_date)`

**Purpose**: Retrieve previously computed forecast

**SQL Equivalent**:
```sql
SELECT *
FROM forecast_cache
WHERE cutoff_date = ?
  AND start_date = ?
  AND end_date = ?
LIMIT 1
```

**Filter**: Exact match on (cutoff_date, start_date, end_date)

**Usage**:
- Skip recomputation for same request
- API response caching

**ClickHouse Notes**:
- Primary key: (cutoff_date, start_date, end_date)
- ReplacingMergeTree for updates
- Keep separate from main forecast table (hot/cold data)

---

### Pattern 8: Group By District (Aggregation)

**Name**: `group_by_district(forecast_df, registry_df)`

**Purpose**: District-level summaries (TASK-14)

**SQL Equivalent**:
```sql
SELECT
  r.district,
  COUNT(DISTINCT f.site_id) as site_count,
  SUM(f.pred_volume_m3) as total_forecast,
  quantile(0.5)(f.pred_volume_m3) as median_forecast
FROM forecast f
JOIN registry r ON f.site_id = r.site_id
GROUP BY r.district
ORDER BY total_forecast DESC
```

**Group**: By district name

**Aggregations**: COUNT(DISTINCT site_id), SUM(pred_volume_m3), percentiles

**Usage**:
- District aggregation endpoint (TASK-14)
- District-level accuracy (TASK-13)
- Dashboard summaries

**ClickHouse Notes**:
- Slow aggregation if done per-query
- Pre-aggregated MV recommended: `forecast_by_district`
- Use `quantile` function for percentiles

---

## Recommendations for ClickHouse Migration

### Table Design

1. **service_data_ch**
   - Engine: `MergeTree`
   - Partition by: `toYYYYMM(service_dt)`
   - Order by: `(site_id, service_dt)`
   - Codecs: Delta(4) for timestamps, LZ4 for large values

2. **registry_ch**
   - Engine: `ReplacingMergeTree`
   - Order by: `site_id`
   - Version column: `updated_at`
   - Denormalize district if high-cardinality filtering

3. **forecast_cache_ch**
   - Engine: `ReplacingMergeTree`
   - Partition by: `toYYYYMM(cutoff_date)`
   - Order by: `(cutoff_date, start_date, end_date, site_id)`
   - Keep separate from service_data

### Materialized Views (Priority)

1. **High**: `daily_aggregate_by_site`
   - Pre-aggregates service data by site-date
   - Used frequently for baseline estimation

2. **Medium**: `forecast_by_district`
   - Pre-aggregates forecasts by district
   - Used for TASK-14 queries

3. **Low**: `site_search_index`
   - Tokenized address for faster text search
   - Consider only if search becomes bottleneck

### Performance Considerations

| Pattern | Frequency | Current Cost | ClickHouse Benefit |
|---------|-----------|--------------|-------------------|
| Load service (date range) | High | Pandas read + filter | Partition pruning |
| Aggregate by site-date | High | Pandas groupby | Materialized view |
| Filter by district | Medium | Pandas join + filter | Join optimization |
| Search sites | Medium | Pandas string ops | Full-text index |
| Group by district | Low | Pandas groupby | Pre-aggregated MV |

---

## Migration Checklist

- [ ] Validate all patterns work on ClickHouse (via TASK-27 abstraction)
- [ ] Benchmark: current CSV vs ClickHouse for each pattern
- [ ] Design materialized views (see above)
- [ ] Test failover: CSV fallback if ClickHouse unavailable
- [ ] Document ClickHouse schema in schema.sql
- [ ] Gradual rollout: CSV → Hybrid (read from CH, write to both) → ClickHouse only

---

## Related Files

- `/src/sites/data_access.py` - Abstract interface (TASK-27)
- `/src/sites/data_loader.py` - Current CSV implementation
- `/src/sites/rolling_forecast.py` - Query usage
- `/scripts/api_app.py` - API query patterns

```
