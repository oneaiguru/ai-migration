# Rolling-Cutoff Demo Expansion Plan (TASK-09 onwards)

**Status**: Ready for Implementation
**Granularity**: 10 tasks (TASK-09 through TASK-18), 15-30min each
**Vision**: Complete demo with filtering, pagination, accuracy validation, and export

---

## Task Summary

| Task | File(s) | Complexity | Est | Description |
|------|---------|------------|-----|-------------|
| TASK-08 | `scripts/benchmark_rolling_forecast.py` | Easy | 15min | Run and verify benchmark (PENDING) |
| TASK-09 | `scripts/api_app.py` | Easy | 15min | Download endpoint for cached forecasts |
| TASK-10 | `scripts/api_app.py` | Medium | 25min | Pagination for all-sites mode |
| TASK-11 | `src/sites/rolling_forecast.py`, `api_app.py` | Medium | 25min | District filter parameter |
| TASK-12 | `src/sites/rolling_forecast.py`, `api_app.py` | Medium | 20min | Search parameter (site_id/address) |
| TASK-13 | `src/sites/rolling_forecast.py`, `api_app.py` | Medium | 30min | Accuracy metrics in response |
| TASK-14 | `scripts/api_app.py` | Medium | 30min | District aggregation endpoint |
| TASK-15 | `mytko-forecast-demo/src/` | Medium | 25min | Frontend district dropdown |
| TASK-16 | `mytko-forecast-demo/src/` | Medium | 30min | Frontend all-sites table |
| TASK-17 | `mytko-forecast-demo/src/` | Easy | 20min | Frontend site search |
| TASK-18 | `mytko-forecast-demo/src/` | Medium | 30min | Chart export (PNG/PDF) |

**Total Estimated Time**: ~4.5 hours

---

## Dependency Graph

```
TASK-08 ─────────────────────────────────> (independent, run first)

TASK-09 (download) ─┐
                    ├─> TASK-10 (pagination) ─> TASK-11 (district) ─> TASK-12 (search)
                    │                                                       │
                    └───────────────────────────────────────────────────────┤
                                                                            v
                                                        TASK-13 (accuracy) ─> TASK-14 (district agg)

TASK-10 ─> TASK-15 (FE district) ─> TASK-16 (FE table) ─> TASK-17 (FE search)

TASK-07 ─> TASK-18 (chart export) (can run in parallel)
```

---

## Phase Breakdown

### Phase 0: Verify MVP (TASK-08)
- Run benchmark script to verify all 8 original tasks work
- Document timing results

### Phase 1: API Completeness (TASK-09 through TASK-12)
**Goal**: Make rolling forecast API fully functional for production use.

1. **TASK-09**: Download endpoint (critical gap fix)
2. **TASK-10**: Pagination (limit/offset, X-Total-Count)
3. **TASK-11**: District filter
4. **TASK-12**: Site search

### Phase 2: Accuracy & Aggregation (TASK-13, TASK-14)
**Goal**: Enable accuracy validation and management views.

5. **TASK-13**: Accuracy metrics (WAPE, actual vs forecast)
6. **TASK-14**: District-level aggregation endpoint

### Phase 3: Frontend Usability (TASK-15 through TASK-18)
**Goal**: Make UI fully functional for exploring forecasts.

7. **TASK-15**: District filter dropdown
8. **TASK-16**: All-sites results table
9. **TASK-17**: Site search input
10. **TASK-18**: Chart export (PNG/PDF)

---

## Implementation Order (Recommended)

**Batch 1** (Backend foundation):
- TASK-08 (verify), TASK-09 (download), TASK-10 (pagination)

**Batch 2** (Backend filtering):
- TASK-11 (district), TASK-12 (search)

**Batch 3** (Backend accuracy):
- TASK-13 (accuracy), TASK-14 (district agg)

**Batch 4** (Frontend):
- TASK-15 (dropdown), TASK-16 (table), TASK-17 (search), TASK-18 (export)

---

## Success Criteria (After TASK-18)

The complete demo enables users to:

1. ✅ Select cutoff date + horizon (TASK-01-07)
2. ✅ View single-site forecast with fact/forecast split (TASK-01-07)
3. ✅ Download cached forecasts as CSV (TASK-09)
4. ✅ Browse paginated all-sites results (TASK-10, TASK-16)
5. ✅ Filter by district (TASK-11, TASK-15)
6. ✅ Search by site ID or address (TASK-12, TASK-17)
7. ✅ See accuracy metrics when actuals exist (TASK-13)
8. ✅ View district-level summaries (TASK-14)
9. ✅ Export charts as PNG/PDF (TASK-18)

---

## Test Coverage Requirements

Each task specifies tests in its `.md` file. Minimum coverage:

- **Backend**: pytest with real data integration tests
- **Frontend**: Manual testing checklist (no automated UI tests yet)
- **All new endpoints**: At least 3 test cases per endpoint

---

## Files Reference

Task specs location: `projects/forecastingrepo/docs-internal/archive/rolling-cutoff-demo/`

```
TASK-08_benchmarks.md           (existing, needs run)
TASK-09_download_endpoint.md    (new)
TASK-10_pagination.md           (new)
TASK-11_district_filter.md      (new)
TASK-12_search.md               (new)
TASK-13_accuracy_metrics.md     (new)
TASK-14_district_aggregation.md (new)
TASK-15_frontend_district_dropdown.md (new)
TASK-16_frontend_sites_table.md (new)
TASK-17_frontend_search.md      (new)
TASK-18_chart_export.md         (new)
```

---

## Next Steps

1. Run TASK-08 benchmark to verify MVP
2. Implement TASK-09 (critical gap: download endpoint)
3. Continue in batch order

---

## Future Stubs (TASK-19 onwards)

These tasks are mentioned in the transcript but need more exploration before full specification.

| Task | Description | Status | Blocker |
|------|-------------|--------|---------|
| TASK-19 | Backtest across multiple cutoff dates | STUB | Needs TASK-13 complete |
| TASK-20 | Holiday calendar integration | STUB | Needs MVP complete |
| TASK-21 | Weather data integration | STUB | Needs data source investigation |
| TASK-22+ | Tourism/events data | STUB | Future phase |
| TASK-23+ | Real estate data | STUB | Future phase |

**Key Insight from Transcript**:
> "I want to make you 365 forecasts, and that would be better than 34... forecast for first, on the second of June, then you do it based on the data for the first of June."

This is the ultimate validation goal: show that rolling forecasts improve as cutoff approaches target date. TASK-19 captures this but needs TASK-13 (accuracy metrics) first.

---

## Jury Demo Deliverables Checklist

From transcript analysis, what Jury expects:

| Requirement | Transcript Reference | Task(s) | Status |
|-------------|---------------------|---------|--------|
| Select cutoff date | "We set the date up to which point the system knows" | TASK-06 | ✅ DONE |
| Show fact vs forecast | "draw two graphs side by side" | TASK-07 | ✅ DONE |
| Rolling forecast by date | "set any date...January, February" | TASK-01-04 | ✅ DONE |
| CSV export for Excel | "CSV file that picks up Excel" | TASK-09 | 🔴 TODO |
| Accuracy validation | "I've been comparing...WAPE accuracy" | TASK-13 | 🔴 TODO |
| All-KP summary | "make the same table, 25 years" | TASK-10, TASK-16 | 🔴 TODO |
| District-level views | Regional examples transcript | TASK-14, TASK-15 | 🔴 TODO |
| Multiple cutoff comparison | "365 forecasts on different dates" | TASK-19 | STUB |

---

**Ready to execute. Say `work on TASK-08` or `work on TASK-09` to begin.**
