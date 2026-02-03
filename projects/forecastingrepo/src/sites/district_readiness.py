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
        if scores_df.empty or 'site_id' not in scores_df.columns:
            return pd.DataFrame(
                columns=['district', 'site_count', 'avg_score', 'ready_now_pct', 'wape_median']
            )

        # Merge scores with registry
        merged = scores_df.merge(
            registry_df[['site_id', 'district']],
            on='site_id',
            how='left',
        )
        if merged.empty or 'score' not in merged.columns:
            return pd.DataFrame(
                columns=['district', 'site_count', 'avg_score', 'ready_now_pct', 'wape_median']
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
