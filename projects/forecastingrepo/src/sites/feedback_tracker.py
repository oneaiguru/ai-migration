"""Feedback collection for algorithm iteration."""
from datetime import datetime
from pathlib import Path
import pandas as pd


class FeedbackTracker:
    """Manage feedback submissions."""

    def __init__(self, feedback_path: Path = Path('data/feedback.parquet')):
        self.feedback_path = feedback_path

    def add_feedback(self, site_id: str, date: str, useful: bool, reason: str = "", note: str = "") -> str:
        """Add feedback record with dispatcher annotation."""
        self.feedback_path.parent.mkdir(parents=True, exist_ok=True)

        record = pd.DataFrame([{
            'feedback_id': f"{site_id}_{date}_{datetime.now().isoformat()}",
            'site_id': site_id,
            'date': date,
            'useful': useful,
            'reason': reason,
            'dispatcher_note': note,
            'timestamp': datetime.now(),
        }])

        if self.feedback_path.exists():
            existing = pd.read_parquet(self.feedback_path)
            combined = pd.concat([existing, record], ignore_index=True)
        else:
            combined = record

        combined.to_parquet(self.feedback_path)
        return record['feedback_id'].iloc[0]

    def get_latest_id(self) -> str:
        """Get latest feedback ID."""
        if not self.feedback_path.exists():
            return ""
        df = pd.read_parquet(self.feedback_path)
        return df['feedback_id'].iloc[-1] if len(df) > 0 else ""

    def get_summary(self) -> pd.DataFrame:
        """Get summary by site (helpful/unhelpful counts)."""
        if not self.feedback_path.exists():
            return pd.DataFrame(
                columns=["site_id", "helpful_count", "total", "unhelpful_count", "useful_rate"]
            )
        df = pd.read_parquet(self.feedback_path)
        if df.empty or "site_id" not in df.columns or "useful" not in df.columns:
            return pd.DataFrame(
                columns=["site_id", "helpful_count", "total", "unhelpful_count", "useful_rate"]
            )
        summary = df.groupby('site_id').agg(
            helpful_count=('useful', 'sum'),
            total=('useful', 'count'),
        ).reset_index()
        summary['unhelpful_count'] = summary['total'] - summary['helpful_count']
        summary['useful_rate'] = summary['helpful_count'] / summary['total']
        return summary

    def get_stats(self) -> dict:
        """Get overall feedback statistics."""
        if not self.feedback_path.exists():
            return {'total_feedback': 0, 'helpful_count': 0, 'unhelpful_count': 0}
        df = pd.read_parquet(self.feedback_path)
        if df.empty or "useful" not in df.columns:
            return {'total_feedback': 0, 'helpful_count': 0, 'unhelpful_count': 0}
        return {
            'total_feedback': len(df),
            'helpful_count': int(df['useful'].sum()),
            'unhelpful_count': int((~df['useful']).sum()),
        }
