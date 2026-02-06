"""Tests for rolling_forecast module."""
from datetime import date
import pytest
from src.sites.rolling_forecast import build_cache_suffix, generate_rolling_forecast, validate_request
from src.sites.rolling_types import (
    DEFAULT_MIN_OBS,
    DEFAULT_WINDOW_DAYS,
    ForecastRequest,
    MAX_CUTOFF_DATE,
)


class TestValidateRequest:
    """Tests for request validation."""

    def test_validate_request_future_cutoff(self):
        """Reject cutoff beyond MAX_CUTOFF_DATE."""
        with pytest.raises(ValueError, match="cannot exceed"):
            validate_request(ForecastRequest(
                cutoff_date=date(2099, 1, 1),
                horizon_days=7
            ))

    def test_validate_request_zero_horizon(self):
        """Reject horizon of 0."""
        with pytest.raises(ValueError, match="1-365"):
            validate_request(ForecastRequest(
                cutoff_date=date(2025, 3, 15),
                horizon_days=0
            ))

    def test_validate_request_negative_horizon(self):
        """Reject negative horizon."""
        with pytest.raises(ValueError, match="1-365"):
            validate_request(ForecastRequest(
                cutoff_date=date(2025, 3, 15),
                horizon_days=-1
            ))

    def test_validate_request_horizon_too_large(self):
        """Reject horizon > 365."""
        with pytest.raises(ValueError, match="1-365"):
            validate_request(ForecastRequest(
                cutoff_date=date(2025, 3, 15),
                horizon_days=366
            ))

    def test_validate_request_valid(self):
        """Accept valid request."""
        # Should not raise
        validate_request(ForecastRequest(
            cutoff_date=date(2025, 3, 15),
            horizon_days=7
        ))
        validate_request(ForecastRequest(
            cutoff_date=date(2025, 5, 31),
            horizon_days=365
        ))


class TestGenerateForecast:
    """Tests for forecast generation."""

    def test_generate_forecast_basic(self):
        """Generate a 7-day forecast for single site and verify structure."""
        result = generate_rolling_forecast(ForecastRequest(
            cutoff_date=date(2025, 3, 15),
            horizon_days=7,
            site_ids=['38105070']  # Single site for speed
        ), use_cache=False)

        assert result.cutoff_date == date(2025, 3, 15)
        assert result.start_date == date(2025, 3, 16)
        assert result.end_date == date(2025, 3, 22)
        assert result.site_count == 1
        assert len(result.forecast_df) == 7  # 7 days × 1 site
        assert 'site_id' in result.forecast_df.columns
        assert 'date' in result.forecast_df.columns
        assert 'fill_pct' in result.forecast_df.columns
        assert 'pred_volume_m3' in result.forecast_df.columns
        assert 'overflow_prob' in result.forecast_df.columns
        assert result.cached is False

    def test_generate_forecast_all_sites(self):
        """Generate forecast for all sites."""
        result = generate_rolling_forecast(ForecastRequest(
            cutoff_date=date(2025, 1, 15),
            horizon_days=7,
            site_ids=None  # All sites
        ), use_cache=False)

        assert result.cutoff_date == date(2025, 1, 15)
        assert result.start_date == date(2025, 1, 16)
        assert len(result.forecast_df) > 0
        assert result.site_count > 1
        assert result.cached is False

    def test_generate_forecast_long_horizon(self):
        """Generate a 30-day forecast."""
        result = generate_rolling_forecast(ForecastRequest(
            cutoff_date=date(2025, 2, 15),
            horizon_days=30,
            site_ids=['38105070']
        ), use_cache=False)

        assert result.cutoff_date == date(2025, 2, 15)
        assert result.start_date == date(2025, 2, 16)
        assert result.end_date == date(2025, 3, 17)
        assert len(result.forecast_df) == 30
        assert result.cached is False

    def test_generate_forecast_result_metadata(self):
        """Verify ForecastResult has all required fields."""
        result = generate_rolling_forecast(ForecastRequest(
            cutoff_date=date(2025, 1, 15),
            horizon_days=7,
            site_ids=['38105070']
        ), use_cache=False)

        assert hasattr(result, 'cutoff_date')
        assert hasattr(result, 'start_date')
        assert hasattr(result, 'end_date')
        assert hasattr(result, 'site_count')
        assert hasattr(result, 'forecast_df')
        assert hasattr(result, 'generated_at')
        assert hasattr(result, 'cached')

    def test_caching_works(self):
        """Second call should be faster (cached)."""
        import time
        req = ForecastRequest(cutoff_date=date(2025, 1, 15), horizon_days=7, site_ids=['38105070'])

        t1 = time.time()
        r1 = generate_rolling_forecast(req, use_cache=True)
        first_time = time.time() - t1

        t2 = time.time()
        r2 = generate_rolling_forecast(req, use_cache=True)
        second_time = time.time() - t2

        assert r2.cached is True
        assert len(r1.forecast_df) == len(r2.forecast_df)
        assert second_time < first_time / 2  # At least 2x faster

    def test_cache_disabled(self):
        """With use_cache=False, should never be cached."""
        req = ForecastRequest(cutoff_date=date(2025, 1, 15), horizon_days=7, site_ids=['38105070'])

        r1 = generate_rolling_forecast(req, use_cache=False)
        r2 = generate_rolling_forecast(req, use_cache=False)

        assert r1.cached is False
        assert r2.cached is False


class TestCacheSuffix:
    """Tests for cache suffix hashing."""

    def test_cache_suffix_changes_with_window_or_min_obs(self):
        """Changing window_days or min_obs should change the suffix."""
        base_suffix = build_cache_suffix(
            None,
            None,
            None,
            DEFAULT_WINDOW_DAYS,
            DEFAULT_MIN_OBS,
        )
        same_suffix = build_cache_suffix(
            None,
            None,
            None,
            DEFAULT_WINDOW_DAYS,
            DEFAULT_MIN_OBS,
        )
        window_suffix = build_cache_suffix(
            None,
            None,
            None,
            DEFAULT_WINDOW_DAYS + 1,
            DEFAULT_MIN_OBS,
        )
        min_obs_suffix = build_cache_suffix(
            None,
            None,
            None,
            DEFAULT_WINDOW_DAYS,
            DEFAULT_MIN_OBS + 1,
        )

        assert base_suffix == same_suffix
        assert base_suffix != window_suffix
        assert base_suffix != min_obs_suffix
        assert window_suffix != min_obs_suffix
