# Churn Research Overview (from archive/deepresearch/2025-10-18)

**Source:** `archive/deepresearch/2025-10-18/deep_research_2025-10-18_normalized_code_churn.md`

## Key Insights
- Normalized code churn correlates with defect density; tracking churn per feature helps anticipate stability issues.
- Suggested metric: churn per feature per week, normalized by total LOC and window length.
- Recommended to pair churn tracking with feature tags (e.g., `xfeat::`) to isolate real product work.

## Action Items
- Implement git stat reporting scoped to tracker directories and tied to Experiment 001 windows.
- Integrate churn metrics into methodology logs (`docs/System/methodologies/churn_measurement/metrics.md`).
- Consider a CLI helper to snapshot churn stats at the end of each window (future task).

## Open Questions
- How to distinguish archival churn vs feature churn (need filter lists).
- Whether to weight churn by provider (Codex vs Claude) for experiment comparisons.


## Top Sources
- archive/deepresearch/2025-10-18/deep_research_2025-10-18_normalized_code_churn.md
