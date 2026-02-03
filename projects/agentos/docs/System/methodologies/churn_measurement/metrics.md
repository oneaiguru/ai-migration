# Metrics

- **Feature churn:** `git log --grep="^xfeat::" --numstat` filtered by methodology directory.
- **Archive churn excluded:** track commits touching `archive/` separately and exclude from feature totals.
- **Scenario count vs churn:** correlate `docs/Tasks/tracker_feature_log.md` entries with `git diff --stat` to compute churn per scenario.
- **Alias impact:** measure JSONL changes triggered by aliases vs manual ingestion.
