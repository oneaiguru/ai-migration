# Task 3: Medium-tier KP Tuning

## Setup
- Cutoff: 2024-10-31
- Horizon: 212 days (2024-11-01 to 2025-05-31)
- Tiering window: 84 days pre-cutoff (sensitivity 365d)
- Tier stability (84d vs 365d): 5.6% of sites changed tiers

## Diagnostics
### Collection frequency (events/week, forecast window)
| tier | median_ev_wk | p25 | p75 | <1/wk | 1-3/wk | 3+/wk |
|---|---|---|---|---|---|---|
| medium | 2.81 | 1.82 | 4.36 | 11.1% | 47.1% | 41.8% |
| large | 6.93 | 6.70 | 7.00 | 0.6% | 2.2% | 97.3% |

### Weekday coverage in training window (event counts, >=4 events per weekday)
| tier | median_weekdays | p25 | p75 | <3 days | <5 days |
|---|---|---|---|---|---|
| medium | 3.0 | 2.0 | 7.0 | 31.1% | 66.7% |
| large | 7.0 | 7.0 | 7.0 | 0.7% | 3.7% |

### Weekday coverage in training window (interval-day counts, >=4 days per weekday)
| tier | median_weekdays | p25 | p75 | <3 days | <5 days |
|---|---|---|---|---|---|
| medium | 7.0 | 7.0 | 7.0 | 0.0% | 0.0% |
| large | 7.0 | 7.0 | 7.0 | 0.0% | 0.0% |

### Gap-length vs bias (baseline)
| tier | gap_bucket | site_count | actual_share_pct | bias_pct |
|---|---|---|---|---|
| large | 3-7d | 12 | 0.4% | -71.1% |
| large | 7-14d | 3 | 0.2% | -87.0% |
| large | <3d | 1599 | 99.4% | -3.1% |
| large | single_event | 1 | 0.0% | -83.0% |
| medium | 14-28d | 100 | 0.4% | -89.1% |
| medium | 28d+ | 13 | 0.0% | -88.4% |
| medium | 3-7d | 2358 | 16.8% | -68.8% |
| medium | 7-14d | 790 | 4.4% | -83.7% |
| medium | <3d | 4941 | 78.4% | -25.1% |
| medium | single_event | 6 | 0.0% | -90.9% |

### Seasonality (baseline monthly forecast/actual ratio)
| tier | month | ratio | bias_pct |
|---|---|---|---|
| large | 2024-11 | 0.98 | -1.5% |
| large | 2024-12 | 0.97 | -2.7% |
| large | 2025-01 | 1.01 | 1.2% |
| large | 2025-02 | 1.01 | 0.9% |
| large | 2025-03 | 0.97 | -3.0% |
| large | 2025-04 | 0.92 | -8.2% |
| large | 2025-05 | 0.90 | -10.0% |
| medium | 2024-11 | 0.67 | -33.2% |
| medium | 2024-12 | 0.66 | -33.9% |
| medium | 2025-01 | 0.67 | -32.5% |
| medium | 2025-02 | 0.67 | -32.8% |
| medium | 2025-03 | 0.66 | -34.4% |
| medium | 2025-04 | 0.62 | -38.5% |
| medium | 2025-05 | 0.60 | -40.3% |

### Smoothing usage (baseline, interval-day counts)
| tier | source | share_pct |
|---|---|---|
| medium | neighbor | 0.0% |
| medium | overall | 0.0% |
| medium | own | 100.0% |
| large | own | 100.0% |

## Medium-tier variants (bias/WAPE)
| variant | window_days | min_obs | smoothing | bias_pct | wape_pct | bias_improvement_pp | wape_change_pp |
|---|---|---|---|---|---|---|---|
| baseline_84_4 | 84 | 4 | baseline | -35.3% | 44.6% | 0.0 | 0.0 |
| window_112_4 | 112 | 4 | baseline | -35.6% | 44.7% | -0.3 | 0.1 |
| minobs_84_6 | 84 | 6 | baseline | -35.3% | 44.6% | 0.0 | -0.0 |
| blend_84_4 | 84 | 4 | blend | -35.3% | 44.6% | 0.0 | 0.0 |

## Baseline reference (large tier)
- Large tier bias: -3.6%
- Large tier WAPE: 24.0%

## Recommendation
- No variant met the >2pp bias improvement and <=0.5pp WAPE change rule.
- Fallback: apply a medium-tier calibration multiplier of 1.546 (brings baseline medium bias toward zero).

## Notes
- Tiering uses pre-cutoff history (84d). Sensitivity to 365d noted in setup.
- Baseline forecast recomputed without cache using estimate_weekday_rates + simulate_fill (84d/4).
- Event-based weekday coverage is included for context; min_obs is evaluated on interval-day counts in the baseline logic.