# TASK-36: Phase 1 PRD

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 20min

## Goal
Document Phase 1 scope, features, and limitations for stakeholders.

## Output: docs/PHASE1_PRD.md

Create file with sections:

1. **Overview**
   - Purpose: Demo environment for Jury to validate forecasts
   - Users: Jury team (algorithm validation), Artem (product demo)

2. **In-Scope for Phase 1**
   - Rolling-cutoff forecasts (1-365 day horizons)
   - 24k waste collection sites
   - Blind validation protocol
   - Metrics upload + iteration tracking
   - Pre-generated bundles (CSV, Excel, JSON)
   - Static HTML report viewer
   - OpenAPI documentation

3. **Out-of-Scope**
   - ClickHouse migration (planned for Phase 2)
   - Feedback loop collection (Phase 2)
   - Rollout recommendations (Phase 2)
   - Multi-tenant support
   - Production SLA/monitoring

4. **Data Sources**
   - sites_service.csv: 5.6M rows (2023-2025)
   - sites_registry.csv: ~24k sites
   - Forecast cache: Parquet format

5. **Limitations**
   - Single-region demo (district filtering supported via API)
   - Top 500 sites only in HTML viewer
   - No real-time updates (batch forecasts)
   - ~15s generation time for 24k sites (per benchmark_rolling_forecast.py)

6. **Success Criteria**
   - **Overall WAPE**: < 15% (industry benchmark)
   - **Site Coverage**: ≥80% of sites achieve ≤20% individual error
   - **Iteration Improvement**: WAPE decreases each iteration (demonstrated learning)
   - **Blind Protocol**: Jury confirms no data leakage detected
   - **Forecast Horizon**: Successfully validates 30+ day predictions
   - **Go/No-Go Decision**: Jury declares "ready for production rollout"

7. **Dependencies**
   - Python 3.11.3
   - Parquet format (built-in caching, no external DB required)
   - Node.js 18+ (frontend)

---

## Acceptance Criteria
- [ ] File created at docs/PHASE1_PRD.md
- [ ] All 7 sections included
- [ ] Clear scope boundaries
- [ ] Realistic limitations stated

---

## On Completion

1. Review docs/PHASE1_PRD.md
2. Update `/Users/m/ai/progress.md`: Change TASK-36 from 🔴 TODO to 🟢 DONE
3. Commit: "Implement TASK-36: Phase 1 PRD"
