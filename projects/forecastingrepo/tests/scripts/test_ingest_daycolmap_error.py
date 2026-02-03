import pytest
from datetime import date
import scripts.ingest_and_forecast as mod


def test_build_day_column_mapping_raises_on_insufficient_headers():
    # Period spans a 30-day month; provide fewer numeric headers than required
    start = date(2024, 11, 1)
    end = date(2024, 11, 30)
    # headers are mapped by column index -> string label of day
    header_cells = {i+1: str(i+1) for i in range(20)}  # only 20 headers
    with pytest.raises(RuntimeError):
        _ = mod.build_day_column_mapping(header_cells, start, end)
