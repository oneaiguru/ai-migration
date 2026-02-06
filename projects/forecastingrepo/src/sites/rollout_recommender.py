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
        if scores_df.empty or 'score' not in scores_df.columns:
            return {
                'ready_now': [],
                'ready_soon': [],
                'needs_work': [],
                'not_ready': [],
            }

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
