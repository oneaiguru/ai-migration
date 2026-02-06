# TASK-44: Feedback API

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 25min

## Goal
API endpoint for Jury to provide feedback on forecast usefulness.

## Code Changes

### 1. File: scripts/api_app.py

Add endpoint:
```python
@app.post("/api/mytko/feedback")
async def submit_feedback(
    site_id: str = Query(...),
    date: str = Query(...),
    useful: bool = Query(...),
    note: str = Query(""),
):
    """Submit feedback on forecast."""
    from src.sites.feedback_tracker import FeedbackTracker

    tracker = FeedbackTracker()
    tracker.add_feedback(site_id, date, useful, note)

    return {"status": "ok", "feedback_id": tracker.get_latest_id()}
```

### 2. File: src/sites/feedback_tracker.py (NEW)

```python
"""Feedback collection for algorithm iteration."""
from datetime import datetime
from pathlib import Path
import pandas as pd


class FeedbackTracker:
    """Manage feedback submissions."""

    def __init__(self, feedback_path: Path = Path('data/feedback.parquet')):
        self.feedback_path = feedback_path

    def add_feedback(self, site_id: str, date: str, useful: bool, note: str) -> str:
        """Add feedback record."""
        self.feedback_path.parent.mkdir(parents=True, exist_ok=True)

        record = pd.DataFrame([{
            'feedback_id': f"{site_id}_{date}_{datetime.now().isoformat()}",
            'site_id': site_id,
            'date': date,
            'useful': useful,
            'note': note,
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
            return pd.DataFrame()
        df = pd.read_parquet(self.feedback_path)
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
        return {
            'total_feedback': len(df),
            'helpful_count': int(df['useful'].sum()),
            'unhelpful_count': int((~df['useful']).sum()),
        }
```

## Tests

```python
# tests/test_feedback_api.py

from fastapi.testclient import TestClient

def test_feedback_endpoint():
    from scripts.api_app import app
    client = TestClient(app)

    response = client.post(
        '/api/mytko/feedback',
        params={
            'site_id': '38100001',
            'date': '2025-03-20',
            'useful': True,
            'note': 'Good forecast',
        }
    )

    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
```

## Acceptance Criteria
- [ ] Endpoint accepts POST /api/mytko/feedback
- [ ] Parameters: site_id, date, useful, note
- [ ] Feedback stored in feedback.parquet
- [ ] Returns feedback_id

---

## On Completion

1. Run tests: `pytest tests/test_feedback_api.py -v`
2. Test manually with curl
3. Update `/Users/m/ai/progress.md`: Change TASK-44 from 🔴 TODO to 🟢 DONE
4. Commit: "Implement TASK-44: Feedback API"
