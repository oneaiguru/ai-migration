# TASK-49: District Readiness Report

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
Aggregate quality scores by district with CSV export.

## Code Changes

### 1. File: src/sites/district_readiness.py (NEW)

```python
"""District-level readiness analysis."""
import pandas as pd
from io import StringIO


class DistrictReadiness:
    """Analyze readiness by district."""

    def compute_readiness(
        self,
        scores_df: pd.DataFrame,
        registry_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """
        Aggregate scores by district.

        Returns DataFrame with:
        - district
        - site_count
        - avg_score
        - ready_now_pct
        - wape_median
        """
        # Merge scores with registry
        merged = scores_df.merge(
            registry_df[['site_id', 'district']],
            on='site_id',
            how='left',
        )

        # Group by district
        readiness = merged.groupby('district').agg({
            'site_id': 'count',
            'score': ['mean', lambda s: (s >= 85).mean() * 100],
            'wape': 'median',
        }).reset_index()

        readiness.columns = ['district', 'site_count', 'avg_score', 'ready_now_pct', 'wape_median']

        return readiness.sort_values('avg_score', ascending=False)

    def export_csv(self, readiness_df: pd.DataFrame) -> str:
        """Export readiness to CSV string."""
        buffer = StringIO()
        readiness_df.to_csv(buffer, index=False)
        return buffer.getvalue()
```

### 2. File: scripts/api_app.py

Add endpoint:
```python
@app.get("/api/mytko/district_readiness")
def get_district_readiness():
    """Get readiness summary by district."""
    from src.sites.district_readiness import DistrictReadiness
    from src.sites.quality_score import QualityScorer
    from src.sites.metrics_tracker import MetricsTracker
    from src.sites.feedback_tracker import FeedbackTracker
    from src.sites.data_loader import load_registry

    scorer = QualityScorer()
    readiness_analyzer = DistrictReadiness()

    metrics_tracker = MetricsTracker()
    feedback_tracker = FeedbackTracker()

    site_metrics_df = metrics_tracker.get_latest_site_metrics()
    feedback_summary_df = feedback_tracker.get_summary()
    registry_df = load_registry()

    scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
    readiness = readiness_analyzer.compute_readiness(scores, registry_df)

    return {
        "readiness": readiness.to_dict(orient='records'),
        "csv_download_url": "/api/mytko/district_readiness/download",
    }


@app.get("/api/mytko/district_readiness/download")
def download_district_readiness():
    """Download district readiness as CSV."""
    from fastapi.responses import PlainTextResponse
    from src.sites.district_readiness import DistrictReadiness
    from src.sites.quality_score import QualityScorer
    from src.sites.metrics_tracker import MetricsTracker
    from src.sites.feedback_tracker import FeedbackTracker
    from src.sites.data_loader import load_registry

    scorer = QualityScorer()
    readiness_analyzer = DistrictReadiness()

    metrics_tracker = MetricsTracker()
    feedback_tracker = FeedbackTracker()

    site_metrics_df = metrics_tracker.get_latest_site_metrics()
    feedback_summary_df = feedback_tracker.get_summary()
    registry_df = load_registry()

    scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
    readiness = readiness_analyzer.compute_readiness(scores, registry_df)

    csv_body = readiness_analyzer.export_csv(readiness)
    return PlainTextResponse(
        csv_body,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=district_readiness.csv"},
    )
```

## Acceptance Criteria
- [ ] Readiness aggregated by district
- [ ] Columns: district, site_count, avg_score, ready_now_pct, wape_median
- [ ] Sorted by score descending
- [ ] CSV export endpoint works

---

## On Completion

1. Test readiness endpoint
2. Download and verify CSV
3. Update `/Users/m/ai/progress.md`: Change TASK-49 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-49: District readiness report"
