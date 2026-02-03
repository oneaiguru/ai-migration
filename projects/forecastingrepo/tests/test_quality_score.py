"""Tests for quality score computation."""
import pandas as pd
from src.sites.quality_score import QualityScorer


def test_quality_score_computation():
    """Test basic quality score computation."""
    scorer = QualityScorer()

    # Excellent forecast
    score = scorer.compute_score('38100001', wape=0.03, completeness=0.95)
    assert score > 80

    # Poor forecast
    score = scorer.compute_score('38100002', wape=0.50, completeness=0.5)
    assert score < 30


def test_wape_scoring():
    """Test WAPE component scoring."""
    scorer = QualityScorer()

    # Excellent: 0-5% WAPE = 50 points
    score = scorer.compute_score('site1', wape=0.03)
    assert score == 90  # 50 (WAPE) + 30 (completeness default 1.0) + 10 (feedback default 0.5) = 90
    assert score > 80

    # Good: 5-15% = 40 points
    score = scorer.compute_score('site2', wape=0.10)
    assert score == 80  # 40 + 30 + 10 = 80

    # Fair: 15-30% = 20 points
    score = scorer.compute_score('site3', wape=0.20)
    assert score == 60  # 20 + 30 + 10 = 60

    # Poor: >30% = 0 points
    score = scorer.compute_score('site4', wape=0.50)
    assert score == 40  # 0 + 30 + 10 = 40


def test_completeness_scoring():
    """Test completeness component scoring."""
    scorer = QualityScorer()

    # Full completeness
    score = scorer.compute_score('site1', wape=0.03, completeness=1.0)
    assert score == 90  # 50 + 30 + 10

    # Partial completeness
    score = scorer.compute_score('site2', wape=0.03, completeness=0.5)
    assert score == 75  # 50 + 15 + 10

    # Zero completeness
    score = scorer.compute_score('site3', wape=0.03, completeness=0.0)
    assert score == 60  # 50 + 0 + 10


def test_feedback_scoring():
    """Test feedback component scoring."""
    scorer = QualityScorer()

    # Full useful feedback
    score = scorer.compute_score('site1', wape=0.03, feedback_useful_rate=1.0)
    assert score == 100  # 50 + 30 + 20

    # Half useful feedback
    score = scorer.compute_score('site2', wape=0.03, feedback_useful_rate=0.5)
    assert score == 90  # 50 + 30 + 10

    # No useful feedback
    score = scorer.compute_score('site3', wape=0.03, feedback_useful_rate=0.0)
    assert score == 80  # 50 + 30 + 0


def test_score_bounds():
    """Test that scores are bounded 0-100."""
    scorer = QualityScorer()

    # Worst case
    score = scorer.compute_score('site1', wape=0.50, completeness=0.0, feedback_useful_rate=0.0)
    assert 0 <= score <= 100

    # Best case
    score = scorer.compute_score('site2', wape=0.03, completeness=1.0, feedback_useful_rate=1.0)
    assert score == 100


def test_get_site_scores_from_dataframe():
    """Test computing scores from dataframes."""
    scorer = QualityScorer()

    # Create sample site metrics
    site_metrics_df = pd.DataFrame({
        'site_id': ['38100001', '38100002'],
        'site_wape': [0.03, 0.20],
        'completeness': [0.95, 0.75],
    })

    # Create sample feedback summary
    feedback_summary_df = pd.DataFrame({
        'site_id': ['38100001', '38100002'],
        'useful_rate': [0.8, 0.5],
    })

    scores_df = scorer.get_site_scores(site_metrics_df, feedback_summary_df)

    assert len(scores_df) == 2
    assert 'score' in scores_df.columns
    assert 'wape' in scores_df.columns
    assert 'completeness' in scores_df.columns
    assert 'useful_rate' in scores_df.columns

    # First site should have higher score (lower WAPE, higher completeness)
    assert scores_df.iloc[0]['score'] > scores_df.iloc[1]['score']


def test_get_site_scores_empty_feedback():
    """Test scores when feedback data is missing."""
    scorer = QualityScorer()

    site_metrics_df = pd.DataFrame({
        'site_id': ['38100001'],
        'site_wape': [0.10],
        'completeness': [0.90],
    })

    # Empty feedback summary
    feedback_summary_df = pd.DataFrame({
        'site_id': [],
        'useful_rate': [],
    })

    scores_df = scorer.get_site_scores(site_metrics_df, feedback_summary_df)

    assert len(scores_df) == 1
    assert scores_df.iloc[0]['useful_rate'] == 0.5  # Default value
