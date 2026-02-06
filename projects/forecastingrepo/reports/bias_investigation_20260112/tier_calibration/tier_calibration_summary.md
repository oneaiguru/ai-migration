# Tier Calibration Summary

## Grid
- k_small: [1.0, 1.5, 2.0, 2.5, 3.0]
- k_medium: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]
- k_large: 1.0 (fixed)

## Recommendations
- safe: k_small=3.00, k_medium=1.50, bias=-6.61%, wape=36.18%
- aggressive: k_small=3.00, k_medium=1.20, bias=-14.44%, wape=34.23%
- zero_bias: k_small=3.00, k_medium=1.50, bias=-6.61%, wape=36.18%

## Pareto points (abs(bias) vs WAPE)
| k_small | k_medium | bias_pct | wape_pct |
|---|---|---|---|
| 3.00 | 1.50 | -6.61% | 36.18% |
| 3.00 | 1.40 | -9.22% | 35.33% |
| 3.00 | 1.30 | -11.83% | 34.66% |
| 3.00 | 1.20 | -14.44% | 34.23% |
| 3.00 | 1.10 | -17.05% | 34.13% |
