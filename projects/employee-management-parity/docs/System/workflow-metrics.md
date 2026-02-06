# Workflow Metrics (Process Health)

Cycle Time
- Target: Scout→Plan→Execute ≤ 3 days
- Alert: > 5 days for a single phase

Rework Rate
- Target: < 15% of plans require re‑planning
- Signal: growth under `docs/Archive/Plans/wrong-drafts/`

Documentation Freshness
- Target: no doc > 30 days without update
- Script idea: `docs/scripts/check-doc-freshness.sh`

Test Coverage
- Target: ≥ 80% for new code
- Alert: < 75%

Weekly Review
- [ ] Review STATUS_DASHBOARD.md
- [ ] Identify stale docs
- [ ] Archive/close out completed work

