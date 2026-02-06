"""Tests for feedback API."""
import tempfile
from pathlib import Path
import pandas as pd
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def temp_feedback_dir(tmp_path):
    """Create a temporary directory for feedback data."""
    feedback_dir = tmp_path / "feedback_data"
    feedback_dir.mkdir()
    return feedback_dir


def test_feedback_endpoint():
    """Test basic feedback submission."""
    from scripts.api_app import app

    client = TestClient(app)

    response = client.post(
        '/api/mytko/feedback',
        params={
            'site_id': '38100001',
            'date': '2025-03-20',
            'useful': True,
            'reason': 'Прогноз точный',
            'dispatcher_note': 'Good forecast',
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'ok'
    assert 'feedback_id' in data
    assert data['feedback_id'] != ""


def test_feedback_with_custom_path(tmp_path):
    """Test feedback tracker with custom path."""
    from src.sites.feedback_tracker import FeedbackTracker

    feedback_path = tmp_path / "test_feedback.parquet"
    tracker = FeedbackTracker(feedback_path=feedback_path)

    # Add first feedback
    feedback_id_1 = tracker.add_feedback('38100001', '2025-03-20', True, 'Прогноз точный', 'Good forecast')
    assert feedback_id_1 != ""
    assert feedback_path.exists()

    # Add second feedback
    feedback_id_2 = tracker.add_feedback('38100002', '2025-03-21', False, 'Прогноз завышен', 'Bad forecast')
    assert feedback_id_2 != ""
    assert feedback_id_2 != feedback_id_1

    # Verify latest ID
    latest = tracker.get_latest_id()
    assert latest == feedback_id_2


def test_feedback_get_latest_id_empty(tmp_path):
    """Test get_latest_id on empty tracker."""
    from src.sites.feedback_tracker import FeedbackTracker

    feedback_path = tmp_path / "empty_feedback.parquet"
    tracker = FeedbackTracker(feedback_path=feedback_path)

    latest = tracker.get_latest_id()
    assert latest == ""


def test_feedback_get_summary(tmp_path):
    """Test feedback summary by site."""
    from src.sites.feedback_tracker import FeedbackTracker

    feedback_path = tmp_path / "test_feedback.parquet"
    tracker = FeedbackTracker(feedback_path=feedback_path)

    # Add multiple feedback entries
    tracker.add_feedback('38100001', '2025-03-20', True, 'Прогноз точный', 'Good')
    tracker.add_feedback('38100001', '2025-03-21', True, 'Прогноз точный', 'Good')
    tracker.add_feedback('38100001', '2025-03-22', False, 'Прогноз завышен', 'Bad')
    tracker.add_feedback('38100002', '2025-03-20', False, 'Прогноз завышен', 'Bad')

    # Get summary
    summary = tracker.get_summary()

    # Check site 38100001
    site_1 = summary[summary['site_id'] == '38100001'].iloc[0]
    assert site_1['helpful_count'] == 2
    assert site_1['unhelpful_count'] == 1
    assert site_1['total'] == 3
    assert abs(site_1['useful_rate'] - 2/3) < 0.01

    # Check site 38100002
    site_2 = summary[summary['site_id'] == '38100002'].iloc[0]
    assert site_2['helpful_count'] == 0
    assert site_2['unhelpful_count'] == 1
    assert site_2['total'] == 1
    assert site_2['useful_rate'] == 0.0


def test_feedback_get_stats(tmp_path):
    """Test overall feedback statistics."""
    from src.sites.feedback_tracker import FeedbackTracker

    feedback_path = tmp_path / "test_feedback.parquet"
    tracker = FeedbackTracker(feedback_path=feedback_path)

    # Add feedback
    tracker.add_feedback('38100001', '2025-03-20', True, 'Прогноз точный', 'Good')
    tracker.add_feedback('38100001', '2025-03-21', True, 'Прогноз точный', 'Good')
    tracker.add_feedback('38100002', '2025-03-20', False, 'Прогноз завышен', 'Bad')

    # Get stats
    stats = tracker.get_stats()
    assert stats['total_feedback'] == 3
    assert stats['helpful_count'] == 2
    assert stats['unhelpful_count'] == 1


def test_feedback_endpoint_multiple_submissions():
    """Test multiple feedback submissions."""
    from scripts.api_app import app
    from src.sites.feedback_tracker import FeedbackTracker

    client = TestClient(app)

    # Submit first feedback
    response1 = client.post(
        '/api/mytko/feedback',
        params={
            'site_id': '38100001',
            'date': '2025-03-20',
            'useful': True,
            'reason': 'Прогноз точный',
            'dispatcher_note': 'Good',
        }
    )
    assert response1.status_code == 200
    feedback_id_1 = response1.json()['feedback_id']

    # Submit second feedback
    response2 = client.post(
        '/api/mytko/feedback',
        params={
            'site_id': '38100002',
            'date': '2025-03-21',
            'useful': False,
            'reason': 'Прогноз завышен',
            'dispatcher_note': 'Bad',
        }
    )
    assert response2.status_code == 200
    feedback_id_2 = response2.json()['feedback_id']

    # IDs should be different
    assert feedback_id_1 != feedback_id_2


def test_feedback_endpoint_empty_note():
    """Test feedback submission with empty dispatcher note."""
    from scripts.api_app import app

    client = TestClient(app)

    response = client.post(
        '/api/mytko/feedback',
        params={
            'site_id': '38100001',
            'date': '2025-03-20',
            'useful': True,
            'reason': 'Прогноз точный',
            'dispatcher_note': '',
        }
    )

    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_feedback_reason_and_dispatcher_note_stored(tmp_path):
    """Test that reason and dispatcher_note are stored in parquet."""
    from src.sites.feedback_tracker import FeedbackTracker

    feedback_path = tmp_path / "test_feedback.parquet"
    tracker = FeedbackTracker(feedback_path=feedback_path)

    # Add feedback with reason and dispatcher_note
    tracker.add_feedback(
        '38100001',
        '2025-03-20',
        True,
        'Прогноз точный',
        'Dispatcher comment here'
    )

    # Read parquet and verify fields
    df = pd.read_parquet(feedback_path)
    assert 'reason' in df.columns
    assert 'dispatcher_note' in df.columns
    assert df['reason'].iloc[0] == 'Прогноз точный'
    assert df['dispatcher_note'].iloc[0] == 'Dispatcher comment here'


def test_feedback_summary_endpoint():
    """Test feedback summary endpoint."""
    from scripts.api_app import app
    from src.sites.feedback_tracker import FeedbackTracker

    client = TestClient(app)

    # Clear and add test feedback
    tracker = FeedbackTracker()

    # Get summary endpoint
    response = client.get('/api/mytko/feedback_summary')

    assert response.status_code == 200
    data = response.json()
    assert 'summary' in data
    assert 'stats' in data
    assert isinstance(data['summary'], list)
    assert 'total_feedback' in data['stats']
    assert 'helpful_count' in data['stats']
    assert 'unhelpful_count' in data['stats']
