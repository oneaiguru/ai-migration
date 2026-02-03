import json
from pathlib import Path
import pytest

fastapi = pytest.importorskip("fastapi")


def test_metrics_and_districts_csv_headers(monkeypatch, tmp_path):
    # Prepare REPORTS_DIR with metrics_summary.json and scoreboard_consolidated.csv
    reports_dir = tmp_path / "reports" / "backtest_consolidated_auto"
    reports_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("REPORTS_DIR", str(reports_dir.parent))

    metrics = {
        "monthly": {
            "region": {"wape_median": 0.2, "wape_p75": 0.3, "wape_p90": 0.4},
            "district": {"wape_median": 0.25, "wape_p75": 0.35, "wape_p90": 0.45},
        }
    }
    (reports_dir / "metrics_summary.json").write_text(json.dumps(metrics), encoding="utf-8")

    sb = reports_dir / "scoreboard_consolidated.csv"
    with sb.open("w", encoding="utf-8") as f:
        f.write("level,district,actual,forecast\n")
        f.write("district,D1,10,9\n")
        f.write("district,D2,5,7\n")

    from scripts.api_app import create_app
    from fastapi.testclient import TestClient
    c = TestClient(create_app())

    rm = c.get("/api/metrics", params={"format":"csv"})
    assert rm.status_code == 200
    assert rm.text.splitlines()[0] == "level,p50,p75,p90"

    rd = c.get("/api/districts", params={"format":"csv"})
    assert rd.status_code == 200
    assert rd.text.splitlines()[0] == "district,smape"

