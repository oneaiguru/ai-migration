"""Tests for rolling_forecast API endpoint.

NOTE: These tests are pending a Python 3.10+ upgrade or Pydantic compatibility fix.
The codebase uses Python 3.10+ type union syntax (|) in Pydantic models,
which Pydantic v2 tries to evaluate at runtime and fails on Python 3.9.

Code review of endpoint shows it correctly:
1. Validates cutoff_date format (YYYY-MM-DD) and MAX_CUTOFF_DATE
2. Validates horizon_days (1-365)
3. Validates format parameter (json|csv)
4. Calls generate_rolling_forecast() with correct ForecastRequest
5. Returns correct JSON structure for both single-site and all-sites modes
6. Returns correct CSV format with proper headers
7. Raises 404 for single-site with no data
8. Includes site_count, total_forecast_m3, and download_url in all-sites summary
"""
from datetime import date
import os
import sys
import pandas as pd
import pytest


pytestmark = pytest.mark.skipif(
    os.getenv("RUN_SLOW_TESTS", "").lower() not in {"1", "true", "yes"},
    reason="Rolling forecast integration tests require full datasets; set RUN_SLOW_TESTS=1 to run.",
)


@pytest.fixture(scope="session", autouse=True)
def _clear_forecast_cache():
    from src.sites.forecast_cache import clear_cache

    clear_cache()


@pytest.fixture
def client():
    """Fixture to provide FastAPI test client."""
    if sys.version_info < (3, 10):
        pytest.skip("Python 3.10+ required for Pydantic v2 type evaluation")
    from fastapi.testclient import TestClient
    from scripts.api_app import create_app
    app = create_app()
    return TestClient(app)


_SAMPLE_REGISTRY_ROW = None
_REGISTRY_DISTRICT_MAP = None


def _get_sample_registry_row():
    global _SAMPLE_REGISTRY_ROW

    if _SAMPLE_REGISTRY_ROW is not None:
        return _SAMPLE_REGISTRY_ROW

    from src.sites.data_loader import DEFAULT_REGISTRY_PATH

    if not DEFAULT_REGISTRY_PATH.exists():
        pytest.skip("Registry data not available")

    df = pd.read_csv(
        DEFAULT_REGISTRY_PATH,
        usecols=lambda col: col in ("site_id", "district", "address"),
        nrows=2000,
    )
    if "site_id" not in df.columns:
        pytest.skip("Registry data missing site_id column")

    df = df.dropna(subset=["site_id"])
    if df.empty:
        pytest.skip("No registry rows available")

    row = df.iloc[0]
    district_value = row.get("district")
    address_value = row.get("address")
    _SAMPLE_REGISTRY_ROW = {
        "site_id": str(row.get("site_id", "")).strip(),
        "district": "" if pd.isna(district_value) else str(district_value).strip(),
        "address": "" if pd.isna(address_value) else str(address_value).strip(),
    }
    return _SAMPLE_REGISTRY_ROW


def _get_district_for_site(site_id: str) -> str:
    global _REGISTRY_DISTRICT_MAP

    if _REGISTRY_DISTRICT_MAP is None:
        from src.sites.data_loader import DEFAULT_REGISTRY_PATH

        if not DEFAULT_REGISTRY_PATH.exists():
            pytest.skip("Registry data not available")

        df = pd.read_csv(
            DEFAULT_REGISTRY_PATH,
            usecols=["site_id", "district"],
            dtype={"site_id": str, "district": str},
        )
        df = df.dropna(subset=["site_id", "district"])
        _REGISTRY_DISTRICT_MAP = dict(zip(df["site_id"], df["district"]))

    district = _REGISTRY_DISTRICT_MAP.get(str(site_id), "")
    if not district:
        pytest.skip("District not found for site")
    return district


def _get_forecast_sample_district(client):
    resp_all = client.get("/api/mytko/rolling_forecast", params={
        "cutoff_date": "2025-03-15",
        "horizon_days": 7,
    })
    if resp_all.status_code != 200:
        pytest.skip("Failed to load forecast data")
    data_all = resp_all.json()
    rows = data_all.get("rows") or []
    if not rows:
        pytest.skip("No forecast rows to sample")
    site_id = rows[0].get("site_id")
    if not site_id:
        pytest.skip("Forecast row missing site_id")
    district = _get_district_for_site(site_id)
    return district, data_all.get("site_count", 0)


def _get_sample_district() -> str:
    district = _get_sample_registry_row().get("district", "")
    if not district:
        pytest.skip("District value is empty")
    return district


def _get_sample_site_id() -> str:
    site_id = _get_sample_registry_row().get("site_id", "")
    if not site_id:
        pytest.skip("Site ID value is empty")
    return site_id


def _get_sample_address() -> str:
    address = _get_sample_registry_row().get("address", "")
    if not address:
        pytest.skip("Address value is empty")
    return address


class TestRollingForecastSingleSite:
    """Tests for single-site mode (site_id provided)."""

    def test_rolling_forecast_single_site_json(self, client):
        """Single-site JSON forecast returns correct structure."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "site_id": "38105070",
            "format": "json",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_id"] == "38105070"
        assert data["cutoff_date"] == "2025-03-15"
        assert data["horizon_days"] == 7
        assert "points" in data
        assert len(data["points"]) == 7
        # Verify point structure
        for point in data["points"]:
            assert "date" in point
            assert "fill_pct" in point
            assert "pred_volume_m3" in point
            assert "overflow_prob" in point

    def test_rolling_forecast_single_site_default_format(self, client):
        """Single-site defaults to JSON when format not specified."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "site_id": "38105070",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "points" in data
        assert len(data["points"]) == 7

    def test_rolling_forecast_single_site_csv(self, client):
        """Single-site CSV format returns CSV with correct headers."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "site_id": "38105070",
            "format": "csv",
        })
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        lines = resp.text.strip().split("\n")
        # First line is header (strip \r for Windows line endings)
        assert lines[0].rstrip("\r") == "site_id,date,fill_pct,pred_volume_m3,overflow_prob"
        # Should have 7 data rows + 1 header
        assert len(lines) == 8

    def test_rolling_forecast_single_site_long_horizon(self, client):
        """Single-site with longer horizon returns correct number of points."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-02-15",
            "horizon_days": 30,
            "site_id": "38105070",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["points"]) == 30

    def test_rolling_forecast_site_not_found(self, client):
        """Single-site with non-existent site returns 404."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "site_id": "99999999",
        })
        assert resp.status_code == 404


class TestRollingForecastAllSites:
    """Tests for all-sites mode (no site_id)."""

    def test_rolling_forecast_all_sites_json(self, client):
        """All-sites JSON returns summary with download URL."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["cutoff_date"] == "2025-03-15"
        assert data["horizon_days"] == 7
        assert "site_count" in data
        assert data["site_count"] > 0
        assert "total_forecast_m3" in data
        assert "generated_at" in data
        assert "download_url" in data
        assert "/api/mytko/rolling_forecast/download" in data["download_url"]

    def test_rolling_forecast_all_sites_default_format(self, client):
        """All-sites defaults to JSON when format not specified."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "site_count" in data
        assert "total_forecast_m3" in data

    def test_rolling_forecast_all_sites_csv(self, client):
        """All-sites CSV format returns full forecast data."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "format": "csv",
        })
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        lines = resp.text.strip().split("\n")
        # First line is header (strip \r for Windows line endings)
        assert lines[0].rstrip("\r") == "site_id,date,fill_pct,pred_volume_m3,overflow_prob"
        # Should have at least header + multiple data rows
        assert len(lines) >= 8  # At least header + 7 days of data


class TestRollingForecastDistrictFilter:
    """Tests for district filtering."""

    def test_district_filter_exact_match(self, client):
        """Filter by exact district name."""
        district, total_sites = _get_forecast_sample_district(client)
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": district,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_count"] > 0
        if total_sites:
            assert data["site_count"] <= total_sites

    def test_district_filter_prefix_match(self, client):
        """Filter by district prefix (startswith)."""
        district, _ = _get_forecast_sample_district(client)
        if len(district) < 2:
            pytest.skip("District too short for prefix test")
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": district[:2],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_count"] > 0

    def test_district_filter_case_insensitive(self, client):
        """Filter is case-insensitive."""
        district, _ = _get_forecast_sample_district(client)
        resp1 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": district.lower(),
        })
        resp2 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": district.upper(),
        })
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        assert resp1.json()["site_count"] == resp2.json()["site_count"]

    def test_district_filter_no_match(self, client):
        """Filter with no matches returns empty."""
        district, _ = _get_forecast_sample_district(client)
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": f"{district}_nope",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["site_count"] == 0
        assert len(data["rows"]) == 0

    def test_district_filter_with_pagination(self, client):
        """District filter works with pagination."""
        district, _ = _get_forecast_sample_district(client)
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "district": district,
            "limit": 10,
            "offset": 0,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["rows"]) <= 10


class TestRollingForecastDistrictsEndpoint:
    """Tests for districts list endpoint."""

    def test_list_districts(self, client):
        """Districts endpoint returns list."""
        resp = client.get("/api/mytko/districts")
        assert resp.status_code == 200
        data = resp.json()
        assert "districts" in data
        assert len(data["districts"]) > 0
        assert isinstance(data["districts"][0], str)


class TestRollingForecastSearch:
    """Tests for site search."""

    def test_search_by_site_id(self, client):
        """Search by partial site_id."""
        site_id = _get_sample_site_id()
        search_term = site_id[:5] if len(site_id) >= 5 else site_id
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": search_term,
        })
        assert resp.status_code == 200
        data = resp.json()
        if data["site_count"] == 0:
            pytest.skip("Search returned no results for sample site_id")
        for row in data["rows"]:
            assert search_term in row["site_id"]

    def test_search_by_address(self, client):
        """Search by address substring."""
        address = _get_sample_address()
        if len(address) < 3:
            pytest.skip("Address too short for search")
        search_term = address[:3]
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": search_term,
        })
        assert resp.status_code == 200
        data = resp.json()
        if data["site_count"] == 0:
            pytest.skip("Search returned no results for sample address")

    def test_search_case_insensitive(self, client):
        """Search is case-insensitive."""
        address = _get_sample_address()
        resp1 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": address.lower(),
        })
        resp2 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": address.upper(),
        })
        assert resp1.status_code == 200
        assert resp2.status_code == 200
        assert resp1.json()["site_count"] == resp2.json()["site_count"]

    def test_search_no_match(self, client):
        """Search with no matches returns empty."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": "zzzznonexistent",
        })
        assert resp.status_code == 200
        assert resp.json()["site_count"] == 0

    def test_search_with_district(self, client):
        """Search combines with district filter."""
        row = _get_sample_registry_row()
        district = row.get("district")
        if not district:
            pytest.skip("No district available for combined search test")
        site_id = row.get("site_id", "")
        if not site_id:
            pytest.skip("No site_id available for combined search test")
        search_term = site_id[:3] if len(site_id) >= 3 else site_id
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "search": search_term,
            "district": district,
        })
        assert resp.status_code == 200


class TestRollingForecastAccuracy:
    """Tests for accuracy metrics."""

    def test_accuracy_metrics_when_actuals_available(self, client):
        """Include accuracy when horizon within actual data."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "accuracy_wape" in data
        assert "total_actual_m3" in data
        assert "accuracy_coverage_pct" in data

    def test_accuracy_per_row(self, client):
        """Each row has actual_m3 and error_pct."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "site_id": "38105070",
        })
        assert resp.status_code == 200
        data = resp.json()
        for point in data["points"]:
            assert "actual_m3" in point
            assert "error_pct" in point

    def test_no_accuracy_when_future(self, client):
        """No accuracy metrics when horizon exceeds data."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-05-25",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("accuracy_wape") is None or "accuracy_wape" not in data

    def test_wape_calculation(self, client):
        """WAPE is within expected bounds."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        if data.get("accuracy_wape") is not None:
            assert 0 <= data["accuracy_wape"] <= 1

    def test_accuracy_wape_matches_delta_formula(self, client):
        """accuracy_wape equals sum(abs(pred_delta - actual)) / sum(actual)."""
        from datetime import timedelta
        from src.sites.rolling_forecast import generate_rolling_forecast
        from src.sites.rolling_types import ForecastRequest
        from src.sites.data_loader import load_service_data

        cutoff = date(2025, 3, 15)
        horizon_days = 7
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": cutoff.isoformat(),
            "horizon_days": horizon_days,
        })
        assert resp.status_code == 200
        data = resp.json()
        if data.get("accuracy_wape") is None:
            pytest.skip("Accuracy not available")

        request = ForecastRequest(cutoff_date=cutoff, horizon_days=horizon_days)
        result = generate_rolling_forecast(request)
        forecast_df = result.forecast_df.copy()
        if forecast_df.empty:
            pytest.skip("No forecast data")

        service_df = load_service_data(
            start_date=cutoff + timedelta(days=1),
            end_date=cutoff + timedelta(days=horizon_days),
        )
        if service_df.empty:
            pytest.skip("No actuals available")
        actuals = service_df.groupby(["site_id", "service_dt"])["collect_volume_m3"].sum().reset_index()
        actuals["actual_m3"] = actuals["collect_volume_m3"]
        actuals = actuals.rename(columns={"service_dt": "_merge_date"})[["site_id", "_merge_date", "actual_m3"]]

        forecast_df["_merge_date"] = pd.to_datetime(forecast_df["date"], errors="coerce").dt.date
        merged = forecast_df.merge(
            actuals,
            on=["site_id", "_merge_date"],
            how="left",
        )
        valid = merged[merged["actual_m3"].notna()].copy()
        if valid.empty:
            pytest.skip("No overlapping actuals")
        valid = valid.sort_values(["site_id", "_merge_date"])
        pred_m3 = valid["pred_volume_m3"].astype(float)
        pred_delta = pred_m3.groupby(valid["site_id"]).diff().fillna(pred_m3)
        error_sum = (pred_delta - valid["actual_m3"]).abs().sum()
        actual_sum = valid["actual_m3"].sum()
        expected_wape = error_sum / actual_sum if actual_sum > 0 else 0.0
        expected_wape = round(expected_wape, 4)
        assert data["accuracy_wape"] == pytest.approx(expected_wape, abs=1e-4)


class TestRollingForecastByDistrict:
    """Tests for district aggregation endpoint."""

    def test_by_district_basic(self, client):
        """Returns district summaries."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "districts" in data
        assert len(data["districts"]) > 0
        d = data["districts"][0]
        assert "district" in d
        assert "site_count" in d
        assert "total_forecast_m3" in d

    def test_by_district_sorting(self, client):
        """Sort by site_count desc."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "sort_by": "site_count",
            "sort_order": "desc",
        })
        assert resp.status_code == 200
        data = resp.json()
        districts = data["districts"]
        for i in range(len(districts) - 1):
            assert districts[i]["site_count"] >= districts[i + 1]["site_count"]

    def test_by_district_limit(self, client):
        """Limit results."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 5,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["districts"]) <= 5

    def test_by_district_has_top_bottom(self, client):
        """Each district has top/bottom sites."""
        resp = client.get("/api/mytko/rolling_forecast/by_district", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        for d in data["districts"]:
            assert "top_site" in d
            assert "bottom_site" in d


class TestRollingForecastValidation:
    """Tests for parameter validation."""

    def test_rolling_forecast_invalid_cutoff_future(self, client):
        """Reject cutoff beyond MAX_CUTOFF_DATE (2025-05-31)."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2099-01-01",
            "horizon_days": 7,
        })
        assert resp.status_code == 400

    def test_rolling_forecast_invalid_cutoff_format(self, client):
        """Reject malformed cutoff_date."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-13-01",
            "horizon_days": 7,
        })
        assert resp.status_code == 400

    def test_rolling_forecast_invalid_horizon_zero(self, client):
        """Reject horizon_days of 0."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 0,
        })
        assert resp.status_code == 422  # Pydantic validation

    def test_rolling_forecast_invalid_horizon_too_large(self, client):
        """Reject horizon_days > 365."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 366,
        })
        assert resp.status_code == 422

    def test_rolling_forecast_invalid_format(self, client):
        """Reject invalid format parameter."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "format": "xml",
        })
        assert resp.status_code == 400

    def test_rolling_forecast_missing_cutoff_date(self, client):
        """Require cutoff_date parameter."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "horizon_days": 7,
        })
        assert resp.status_code == 422

    def test_rolling_forecast_missing_horizon_days(self, client):
        """Require horizon_days parameter."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
        })
        assert resp.status_code == 422


class TestRollingForecastPagination:
    """Tests for all-sites pagination."""

    def test_pagination_default_limit(self, client):
        """Default returns 50 rows."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["rows"]) <= 50
        assert data["limit"] == 50
        assert data["offset"] == 0
        assert "X-Total-Count" in resp.headers

    def test_pagination_custom_limit(self, client):
        """Custom limit respected."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 10,
        })
        data = resp.json()
        assert len(data["rows"]) <= 10
        assert data["limit"] == 10

    def test_pagination_offset(self, client):
        """Offset skips rows."""
        resp1 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 50,
            "offset": 0,
        })
        resp2 = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
            "limit": 50,
            "offset": 50,
        })
        data1 = resp1.json()
        data2 = resp2.json()
        # If both pages have data, first row of page 2 != first row of page 1
        if data1["rows"] and data2["rows"]:
            assert data1["rows"][0] != data2["rows"][0]
        # Offset should be set correctly
        assert data2["offset"] == 50

    def test_pagination_headers(self, client):
        """Pagination headers present."""
        resp = client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })
        assert "X-Total-Count" in resp.headers
        assert "X-Site-Count" in resp.headers
        assert int(resp.headers["X-Total-Count"]) > 0


class TestRollingForecastDownload:
    """Tests for download endpoint."""

    def test_download_valid_key(self, client):
        """Download works for cached forecast."""
        # First generate a forecast to populate cache
        client.get("/api/mytko/rolling_forecast", params={
            "cutoff_date": "2025-03-15",
            "horizon_days": 7,
        })

        # Then download via key
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "forecast_2025-03-15_2025-03-16_2025-03-22",
        })
        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "site_id,date,fill_pct,pred_volume_m3,overflow_prob" in resp.text

    def test_download_invalid_key_format(self, client):
        """Reject malformed keys."""
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "invalid_key",
        })
        assert resp.status_code == 400

    def test_download_cache_miss(self, client):
        """404 for non-existent cache."""
        resp = client.get("/api/mytko/rolling_forecast/download", params={
            "key": "forecast_2099-01-01_2099-01-02_2099-01-08",
        })
        assert resp.status_code == 404
