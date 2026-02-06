# Task 4: Medium-tier Root Cause Checks

## Setup
- Cutoff: 2024-10-31
- Horizon: 212 days (2024-11-01 to 2025-05-31)
- Tiering window: 84d pre-cutoff (2024-08-09 to 2024-10-31)
- min_obs: 4

## C1: Same-day duplicates / zero-gap volume loss (training window)
| tier | dup_site_days | dropped_volume_m3 | dropped_pct_of_tier |
|---|---|---|---|
| small | 0 | 0.00 | 0.00% |
| medium | 0 | 0.00 | 0.00% |
| large | 0 | 0.00 | 0.00% |

## C2: Per-event volume by tier + gap bucket (forecast window)
| tier | gap_bucket | site_count | median_m3_event | p25 | p75 |
|---|---|---|---|---|---|
| large | 3-7d | 12 | 11.14 | 5.51 | 16.11 |
| large | 7-14d | 3 | 57.78 | 34.68 | 82.42 |
| large | <3d | 1599 | 5.61 | 4.38 | 8.03 |
| large | single_event | 1 | 18.75 | 18.75 | 18.75 |
| medium | 14-28d | 100 | 6.93 | 2.57 | 8.00 |
| medium | 28d+ | 13 | 8.00 | 4.12 | 11.44 |
| medium | 3-7d | 2358 | 1.84 | 1.49 | 2.57 |
| medium | 7-14d | 790 | 2.95 | 2.36 | 3.75 |
| medium | <3d | 4941 | 1.67 | 1.28 | 2.42 |
| medium | single_event | 6 | 7.00 | 5.25 | 8.75 |

Single-event sites (not shown above): large: 1, medium: 6

### Training window comparison (optional)
| tier | gap_bucket | site_count | median_m3_event | p25 | p75 |
|---|---|---|---|---|---|
| large | 3-7d | 9 | 15.06 | 14.19 | 19.45 |
| large | 7-14d | 3 | 72.53 | 65.06 | 79.86 |
| large | <3d | 1606 | 5.69 | 4.44 | 8.13 |
| medium | 14-28d | 45 | 8.00 | 8.00 | 8.20 |
| medium | 28d+ | 2 | 32.25 | 24.12 | 40.38 |
| medium | 3-7d | 2252 | 2.08 | 1.50 | 2.83 |
| medium | 7-14d | 592 | 3.44 | 2.94 | 5.08 |
| medium | <3d | 5336 | 1.69 | 1.28 | 2.49 |

## C3: Post-processing uplift test (medium tier)
Baseline medium-tier bias: -35.32%, WAPE: 44.60%

| multiplier | applied_to | site_count | bias_before | bias_after | wape_before | wape_after |
|---|---|---|---|---|---|---|
| global_medium | x1.50 | 8227 | -35.32% | -2.98% | 44.60% | 48.59% |
| global_medium | x1.40 | 8227 | -35.32% | -9.45% | 44.60% | 46.47% |
| global_medium | x1.30 | 8227 | -35.32% | -15.92% | 44.60% | 44.81% |
| gap_3_7d | x2.00 | 2358 | -35.32% | -30.09% | 44.60% | 40.65% |
| gap_7plus | x2.50 | 903 | -35.32% | -34.17% | 44.60% | 43.58% |
| freq_1_3wk | x1.50 | 3875 | -35.32% | -29.57% | 44.60% | 40.12% |
