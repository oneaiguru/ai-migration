"""Tests for district readiness analysis."""
import pandas as pd
from src.sites.district_readiness import DistrictReadiness


def test_compute_readiness_basic():
    """Test basic district readiness computation."""
    analyzer = DistrictReadiness()

    # Create sample scores
    scores_df = pd.DataFrame({
        'site_id': ['site1', 'site2', 'site3', 'site4'],
        'score': [90, 85, 70, 65],
        'wape': [0.03, 0.05, 0.15, 0.25],
        'completeness': [0.95, 0.90, 0.80, 0.75],
        'useful_rate': [0.8, 0.7, 0.5, 0.3],
    })

    # Create sample registry
    registry_df = pd.DataFrame({
        'site_id': ['site1', 'site2', 'site3', 'site4'],
        'district': ['North', 'North', 'South', 'South'],
    })

    readiness = analyzer.compute_readiness(scores_df, registry_df)

    # Should have 2 districts
    assert len(readiness) == 2
    assert set(readiness['district']) == {'North', 'South'}

    # Check column names
    expected_cols = ['district', 'site_count', 'avg_score', 'ready_now_pct', 'wape_median']
    assert list(readiness.columns) == expected_cols

    # Check North district (sites 1, 2)
    north = readiness[readiness['district'] == 'North'].iloc[0]
    assert north['site_count'] == 2
    assert north['avg_score'] == (90 + 85) / 2  # 87.5
    assert north['ready_now_pct'] == 100.0  # Both >= 85
    assert north['wape_median'] == (0.03 + 0.05) / 2  # 0.04

    # Check South district (sites 3, 4)
    south = readiness[readiness['district'] == 'South'].iloc[0]
    assert south['site_count'] == 2
    assert south['avg_score'] == (70 + 65) / 2  # 67.5
    assert south['ready_now_pct'] == 0.0  # Both < 85
    assert south['wape_median'] == (0.15 + 0.25) / 2  # 0.20


def test_compute_readiness_sorted_by_score():
    """Test that readiness is sorted by avg_score descending."""
    analyzer = DistrictReadiness()

    scores_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3', 's4'],
        'score': [90, 80, 70, 60],
        'wape': [0.03, 0.10, 0.20, 0.30],
        'completeness': [0.95, 0.85, 0.75, 0.65],
        'useful_rate': [0.8, 0.6, 0.4, 0.2],
    })

    registry_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3', 's4'],
        'district': ['D1', 'D2', 'D3', 'D4'],
    })

    readiness = analyzer.compute_readiness(scores_df, registry_df)

    # Should be sorted by avg_score descending
    scores_list = readiness['avg_score'].tolist()
    assert scores_list == sorted(scores_list, reverse=True)


def test_ready_now_percentage():
    """Test that ready_now_pct counts sites >= 85."""
    analyzer = DistrictReadiness()

    scores_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3', 's4', 's5'],
        'score': [95, 85, 84, 80, 75],
        'wape': [0.02, 0.05, 0.08, 0.12, 0.15],
        'completeness': [0.95, 0.90, 0.85, 0.80, 0.75],
        'useful_rate': [0.8, 0.7, 0.6, 0.5, 0.4],
    })

    registry_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3', 's4', 's5'],
        'district': ['TestDistrict'] * 5,
    })

    readiness = analyzer.compute_readiness(scores_df, registry_df)

    # 2 out of 5 sites have score >= 85 (s1=95, s2=85)
    # So ready_now_pct should be 40%
    assert readiness.iloc[0]['ready_now_pct'] == 40.0


def test_export_csv():
    """Test CSV export functionality."""
    analyzer = DistrictReadiness()

    readiness_df = pd.DataFrame({
        'district': ['North', 'South'],
        'site_count': [10, 8],
        'avg_score': [85.5, 72.3],
        'ready_now_pct': [80.0, 25.0],
        'wape_median': [0.08, 0.18],
    })

    csv_str = analyzer.export_csv(readiness_df)

    assert isinstance(csv_str, str)
    assert 'district' in csv_str
    assert 'North' in csv_str
    assert 'South' in csv_str
    assert 'site_count' in csv_str
    assert 'avg_score' in csv_str
    assert 'ready_now_pct' in csv_str
    assert 'wape_median' in csv_str

    # Verify CSV is parseable
    lines = csv_str.strip().split('\n')
    assert len(lines) == 3  # header + 2 rows
    assert lines[0] == 'district,site_count,avg_score,ready_now_pct,wape_median'


def test_missing_registry_entries():
    """Test handling of sites without registry entries."""
    analyzer = DistrictReadiness()

    scores_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3'],
        'score': [90, 80, 70],
        'wape': [0.03, 0.10, 0.20],
        'completeness': [0.95, 0.85, 0.75],
        'useful_rate': [0.8, 0.6, 0.4],
    })

    # Only registry for 2 out of 3 sites
    registry_df = pd.DataFrame({
        'site_id': ['s1', 's2'],
        'district': ['North', 'North'],
    })

    readiness = analyzer.compute_readiness(scores_df, registry_df)

    # Should have rows for mapped districts, plus NaN for unmapped
    # After groupby, NaN district should appear
    assert len(readiness) >= 1


def test_wape_median():
    """Test that WAPE is aggregated as median, not mean."""
    analyzer = DistrictReadiness()

    scores_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3'],
        'score': [90, 80, 70],
        'wape': [0.01, 0.05, 0.50],  # Median should be 0.05, mean would be 0.19
        'completeness': [0.95, 0.85, 0.75],
        'useful_rate': [0.8, 0.6, 0.4],
    })

    registry_df = pd.DataFrame({
        'site_id': ['s1', 's2', 's3'],
        'district': ['TestDist'] * 3,
    })

    readiness = analyzer.compute_readiness(scores_df, registry_df)

    # Median of [0.01, 0.05, 0.50] should be 0.05
    assert readiness.iloc[0]['wape_median'] == 0.05
