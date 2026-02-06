import pytest

import scripts.backtest_eval as be


@pytest.mark.spec_id("BT-002")
def test_metrics_unit_values():
    # WAPE: err_sum / actual_sum (with EPS)
    assert be.wape(0.0, 10.0) == 0.0
    assert abs(be.wape(5.0, 10.0) - 0.5) < 1e-12
    # zero denom path uses EPS; finite, large ratio
    assert be.wape(1.0, 0.0) > 0

    # SMAPE: 2|y-ŷ|/(|y|+|ŷ|+EPS)
    assert abs(be.smape(10.0, 10.0) - 0.0) < 1e-12
    assert abs(be.smape(0.0, 10.0) - (2.0*10.0/(0.0+10.0+be.EPS))) < 1e-12

    # MAE: |y-ŷ|
    assert be.mae(5.0, 2.0) == 3.0
    assert be.mae(-1.0, 1.0) == 2.0
