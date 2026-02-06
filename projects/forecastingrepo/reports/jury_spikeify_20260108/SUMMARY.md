# Jury — Spikeify service-day postprocess
## Holdout (Jan–May 2025)
- Daily micro-WAPE baseline: 0.6176 (61.76%)
- Daily micro-WAPE spikeify (no gate): 0.5834 (58.34%)
- Daily micro-WAPE spikeify (gate 0.60+): 0.5431 (54.31%)
- Gate: gated_out=2,260 / 13,526 schedule-parsed eval KPs (volume share 18.21%)
- Regression: volume share worsened (gate vs baseline): 20.50%

## Parsing coverage (`График вывоза`, Jan–May report)
- KPs total: 23,307; missing: 525; parsed weekdays: 13,661; parsed daily: 2,864; unparsed: 6,257
- Top unparsed schedule strings (share of KPs):
  - 227 (0.97%): 15
  - 191 (0.82%): 1-й и 3-й вторник
  - 177 (0.76%): 2-й и 4-й вторник
  - 172 (0.74%): 2-я и 4-я суббота
  - 162 (0.70%): 25
  - 156 (0.67%): 1-й и 3-й четверг
  - 138 (0.59%): 2-й и 4-й четверг
  - 131 (0.56%): 1-я и 3-я пятница
  - 126 (0.54%): 1, 15
  - 126 (0.54%): 20

## Jun–Dec 2025 export checks

### Coverage
- schedule: 11,420 (50.17%)
- gated_to_inferred: 1,852 (8.14%)
- gated_to_none: 250 (1.10%)
- inferred: 860 (3.78%)
- daily_noop: 2,850 (12.52%)
- none: 5,529 (24.29%)
- gated_out_total: 2,102 (9.24%)

### Impact
- Impact: modified_kps=14,132 / 22,761 (62.1%), modified_volume_share=51.09%, sum_abs_delta/sum_pred=0.5953

### Totals Preservation
- Overall total diff (Jun–Dec): -0.001328
- Jun–Oct total diff: -0.000919
- Max per-KP per-month abs diff: 0.000005
- Per-month diffs (after - before):
  - 2025-06: 0.000101
  - 2025-07: -0.000548
  - 2025-08: 0.000049
  - 2025-09: -0.000320
  - 2025-10: -0.000216
  - 2025-11: -0.000250
  - 2025-12: -0.000144
- Gate params: alignment_threshold=0.6, daily_mode=noop

## Files
- `reports/jury_spikeify_20260108/holdout_metrics.csv`
- `reports/jury_spikeify_20260108/regressions_top20.csv`
- `reports/jury_spikeify_20260108/district_regressions_top20.csv`
