import scripts.ingest_and_forecast as mod


def test_small_helpers_cover_branches():
    # days_in_month: both branches (December and non-December)
    assert mod.days_in_month(2024, 12) == 31
    assert mod.days_in_month(2024, 11) == 30
    # col/index conversion roundtrip for a few values
    for idx in [1, 26, 27, 52, 53]:
        letters = mod.index_to_col_letters(idx)
        assert mod.col_letters_to_index(letters) == idx
    # ym_range across year boundary
    r = mod.ym_range("2024-11", "2025-02")
    assert r == ["2024-11", "2024-12", "2025-01", "2025-02"]
