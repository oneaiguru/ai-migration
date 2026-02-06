# TASK-47: Quality Score

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 30min

## Goal
Per-site quality score (0-100) based on WAPE plus feedback (completeness optional if available).

## Code Changes

### 1. File: src/sites/quality_score.py (NEW)

```python
"""Compute quality scores for sites."""
import pandas as pd
from datetime import date


class QualityScorer:
    """Score forecast quality per site."""

    def __init__(self):
        pass

    def compute_score(
        self,
        site_id: str,
        wape: float,
        completeness: float = 1.0,
        feedback_useful_rate: float = 0.5,
    ) -> int:
        """
        Compute 0-100 quality score.

        Components:
        - WAPE accuracy (50%): lower is better, max 0.5 WAPE
        - Completeness (30%): % of days with forecast (optional, defaults to 1.0)
        - Feedback (20%): % useful feedback
        """
        # WAPE component (0-50 points)
        # Excellent: 0-5% WAPE = 50 points
        # Good: 5-15% = 40 points
        # Fair: 15-30% = 20 points
        # Poor: >30% = 0 points
        if wape <= 0.05:
            wape_score = 50
        elif wape <= 0.15:
            wape_score = 40
        elif wape <= 0.30:
            wape_score = 20
        else:
            wape_score = 0

        # Completeness component (0-30 points)
        completeness_score = min(30, int(completeness * 30))

        # Feedback component (0-20 points)
        feedback_score = int(feedback_useful_rate * 20)

        total = wape_score + completeness_score + feedback_score
        return min(100, total)

    def get_site_scores(
        self,
        site_metrics_df: pd.DataFrame,
        feedback_summary_df: pd.DataFrame,
    ) -> pd.DataFrame:
        """Get scores for all sites."""
        scores = []

        for site_id in site_metrics_df['site_id'].unique():
            site_metrics = site_metrics_df[site_metrics_df['site_id'] == site_id]
            wape = float(site_metrics['site_wape'].mean())
            completeness = (
                float(site_metrics['completeness'].mean())
                if 'completeness' in site_metrics_df.columns
                else 1.0
            )

            site_feedback = feedback_summary_df[feedback_summary_df['site_id'] == site_id]
            useful_rate = (
                float(site_feedback['useful_rate'].iloc[0])
                if len(site_feedback) > 0
                else 0.5
            )

            score = self.compute_score(site_id, wape, completeness, useful_rate)
            scores.append({
                'site_id': site_id,
                'score': score,
                'wape': wape,
                'completeness': completeness,
                'useful_rate': useful_rate,
            })

        return pd.DataFrame(scores)
```

### 2. File: src/sites/metrics_tracker.py (extend)

Add helper to load per-site metrics from the latest validation run:
```python
def get_latest_site_metrics(self, per_site_path: Path | None = None) -> pd.DataFrame:
    if per_site_path and per_site_path.exists():
        return pd.read_csv(per_site_path)
    default_path = Path('data/metrics_history_per_site.parquet')
    if default_path.exists():
        return pd.read_parquet(default_path)
    return pd.DataFrame(columns=['site_id', 'site_wape'])
```

### 3. File: scripts/api_app.py

Add endpoint:
```python
@app.get("/api/mytko/site_scores")
def get_site_scores():
    """Get quality scores for all sites."""
    from src.sites.quality_score import QualityScorer
    from src.sites.metrics_tracker import MetricsTracker
    from src.sites.feedback_tracker import FeedbackTracker

    scorer = QualityScorer()
    metrics_tracker = MetricsTracker()
    feedback_tracker = FeedbackTracker()

    site_metrics_df = metrics_tracker.get_latest_site_metrics()
    feedback_summary_df = feedback_tracker.get_summary()

    scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)

    return {
        "scores": scores.to_dict(orient='records'),
        "average_score": float(scores['score'].mean()),
    }
```

## Tests

```python
# tests/test_quality_score.py

from src.sites.quality_score import QualityScorer

def test_quality_score_computation():
    scorer = QualityScorer()

    # Excellent forecast
    score = scorer.compute_score('38100001', wape=0.03, completeness=0.95)
    assert score > 80

    # Poor forecast
    score = scorer.compute_score('38100002', wape=0.50, completeness=0.5)
    assert score < 30
```

## Acceptance Criteria
- [ ] Score computed 0-100
- [ ] WAPE and feedback weighted (completeness optional)
- [ ] Endpoint returns site scores
- [ ] Average score calculated

---

## On Completion

1. Run tests: `pytest tests/test_quality_score.py -v`
2. Test endpoint returns scores
3. Update `/Users/m/ai/progress.md`: Change TASK-47 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-47: Quality score"
