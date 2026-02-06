# TASK-48: Rollout Recommendations

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
API endpoint recommending sites ready for operational use.

## Code Changes

### 1. File: src/sites/rollout_recommender.py (NEW)

```python
"""Rollout recommendations based on quality scores."""
import pandas as pd


class RolloutRecommender:
    """Recommend sites for operational rollout."""

    # Quality score thresholds
    EXCELLENT = 85
    GOOD = 70
    FAIR = 50

    def get_recommendations(
        self,
        scores_df: pd.DataFrame,
    ) -> dict:
        """
        Categorize sites by rollout readiness.

        Returns:
        {
            'ready_now': sites with score >= 85,
            'ready_soon': sites with score 70-85,
            'needs_work': sites with score 50-70,
            'not_ready': sites with score < 50,
        }
        """
        return {
            'ready_now': scores_df[scores_df['score'] >= self.EXCELLENT].to_dict(orient='records'),
            'ready_soon': scores_df[
                (scores_df['score'] >= self.GOOD) & (scores_df['score'] < self.EXCELLENT)
            ].to_dict(orient='records'),
            'needs_work': scores_df[
                (scores_df['score'] >= self.FAIR) & (scores_df['score'] < self.GOOD)
            ].to_dict(orient='records'),
            'not_ready': scores_df[scores_df['score'] < self.FAIR].to_dict(orient='records'),
        }

    def get_summary(self, recommendations: dict) -> dict:
        """Get summary statistics."""
        return {
            'ready_now_count': len(recommendations['ready_now']),
            'ready_soon_count': len(recommendations['ready_soon']),
            'ready_now_pct': (
                len(recommendations['ready_now']) /
                (len(recommendations['ready_now']) + len(recommendations['ready_soon']) +
                 len(recommendations['needs_work']) + len(recommendations['not_ready']))
            ) * 100 if (len(recommendations['ready_now']) + len(recommendations['ready_soon']) +
                         len(recommendations['needs_work']) + len(recommendations['not_ready'])) > 0 else 0,
        }
```

### 2. File: scripts/api_app.py

Add endpoint:
```python
@app.get("/api/mytko/rollout_recommendations")
def get_rollout_recommendations():
    """Get sites recommended for rollout."""
    from src.sites.quality_score import QualityScorer
    from src.sites.rollout_recommender import RolloutRecommender
    from src.sites.metrics_tracker import MetricsTracker
    from src.sites.feedback_tracker import FeedbackTracker

    scorer = QualityScorer()
    recommender = RolloutRecommender()

    metrics_tracker = MetricsTracker()
    feedback_tracker = FeedbackTracker()

    site_metrics_df = metrics_tracker.get_latest_site_metrics()
    feedback_summary_df = feedback_tracker.get_summary()

    scores = scorer.get_site_scores(site_metrics_df, feedback_summary_df)
    recommendations = recommender.get_recommendations(scores)
    summary = recommender.get_summary(recommendations)

    return {
        "recommendations": recommendations,
        "summary": summary,
    }
```

## Acceptance Criteria
- [ ] Endpoint returns recommendations by category
- [ ] Categories: ready_now, ready_soon, needs_work, not_ready
- [ ] Summary includes percentages
- [ ] Thresholds reasonable (85, 70, 50)

---

## On Completion

1. Test endpoint returns recommendations
2. Verify categorization logic
3. Update `/Users/m/ai/progress.md`: Change TASK-48 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-48: Rollout recommendations"
