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
        if site_metrics_df.empty or 'site_id' not in site_metrics_df.columns:
            return pd.DataFrame(columns=['site_id', 'score', 'wape', 'completeness', 'useful_rate'])
        scores = []
        feedback_has_site = 'site_id' in feedback_summary_df.columns

        for site_id in site_metrics_df['site_id'].unique():
            site_metrics = site_metrics_df[site_metrics_df['site_id'] == site_id]
            wape = float(site_metrics['site_wape'].mean())
            completeness = (
                float(site_metrics['completeness'].mean())
                if 'completeness' in site_metrics_df.columns
                else 1.0
            )

            site_feedback = (
                feedback_summary_df[feedback_summary_df['site_id'] == site_id]
                if feedback_has_site
                else pd.DataFrame()
            )
            useful_rate = (
                float(site_feedback['useful_rate'].iloc[0])
                if len(site_feedback) > 0 and 'useful_rate' in site_feedback.columns
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
