## Agent 4: KP Segmentation Analysis

**File:** `reports/bias_investigation_20260112/agent_4_kp_segmentation.md`

## Findings
- Backtest frame: Nov’24–May’25, forecast deltas from cached rolling forecast (cutoff 2024-10-31), merged with actuals. Per-KP totals used for segmentation.
- Volume tiers (per-30d actual):  
  - Small <10: count 12,420, bias_pct -80.0, WAPE 80.0, volume share 8.4%  
  - Medium 10–100: count 7,706, bias_pct -38.5, WAPE 39.5, share 39.7%  
  - Large >100: count 1,596, bias_pct -13.5, WAPE 15.6, share 51.9%  
  → Under-bias is dominated by small/medium sites; large sites hold half the volume with modest bias.
- Collection frequency (events per week in window):  
  - <1/wk: 9,764 sites, bias_pct -86.6, WAPE 86.6, share 6.3%  
  - 1–3/wk: 6,799 sites, bias_pct -66.2, WAPE 66.2, share 16.8%  
  - 3+/wk: 5,159 sites, bias_pct -16.1, WAPE 18.1, share 76.9%  
  → High-frequency sites carry most volume and are closer to calibrated; low-frequency sites have extreme bias but small volume.
- History depth:  
  - <1yr: bias_pct -64.4 (share 2.0%)  
  - 1–2yr: bias_pct -49.5 (share 6.5%)  
  - 2yr+: bias_pct -26.8 (share 91.5%)  
  → Shallow history correlates with worse bias; most volume has 2yr+ history.
- Districts (bias_pct): worst underpredictors: Балаганский (-86.4), Баяндаевский (-75.4), Усть-Удинский (-74.3), Нукутский (-72.9), Ольхонский (-65.9) — all tiny volume share (<0.5% each). Least-under (closest to calibrated): МО Саянск (-13.6, 1.9% share), Усольский (-21.6, 6.5%), Шелеховский (-22.0, 4.2%), Правый берег (-22.7, 19.8%), Левый берег (-24.3, 24.7%).

## Key segments
| Segment | Count | Bias_pct | WAPE | % of Total Volume |
|---------|-------|----------|------|-------------------|
| Large >100 m³/30d | 1,596 | -13.5 | 15.6 | 51.9% |
| Medium 10–100 m³/30d | 7,706 | -38.5 | 39.5 | 39.7% |
| Small <10 m³/30d | 12,420 | -80.0 | 80.0 | 8.4% |
| 3+/week pickups | 5,159 | -16.1 | 18.1 | 76.9% |
| <1/week pickups | 9,764 | -86.6 | 86.6 | 6.3% |

## Recommended prioritization
1) Medium tier (10–100 m³/30d) and 1–3/wk frequency: big volume chunk with large bias; improving rates here should move overall bias most.  
2) Large tier / 3+/wk: already closer, but any uplift directly moves ~77% of volume; monitor not to over-correct.  
3) Small/low-frequency sites: huge bias but low volume; deprioritize or flag as “low confidence” rather than recalibrate first.

## Quick win opportunity
- Mark low-frequency (<1/wk) and short-history (<1yr) sites as low-confidence; optionally exclude them from bias headline or apply conservative uplift factor.
- Focus on recalibrating medium-tier rates (e.g., longer window, higher min_obs) to cut bias where volume sits.
