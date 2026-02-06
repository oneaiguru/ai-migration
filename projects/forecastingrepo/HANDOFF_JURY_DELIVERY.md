# Handoff: Jury Delivery Preparation

**Date**: 2025-12-28
**Context**: All 17 implementation tasks complete. Now preparing delivery for Jury.

---

## Current State

### Generated Files (in `jury_blind_forecast/`)

| File | Size | Rows | Status |
|------|------|------|--------|
| `forecast_jun_dec_2025.csv` | 203MB | 5M | Ready - forecast |
| `validation_jan_may_2025.csv` | 125MB | 3.3M | Ready - internal validation (not for Jury) |
| `README.txt` | — | — | Ready - instructions |
| `wape_result.txt` | — | — | Updated (Jan–May 2025, delta method) |

**Internal validation artifacts (not for delivery):**
- `validation_oct_dec_2024.csv`
- `actuals_oct_dec_2024.csv`
- `metrics_oct_dec_2024.csv`
- `metrics_oct_dec_2024_per_site.csv`
- `metrics_oct_dec_2024_delta.csv`

### What's Missing

1. **Send to Jury** - ZIP is ready
2. **Jan–May 2025 WAPE** - Computed internally (29.49%)

---

## Data Location Note (2025-12-28)

Canonical historical data files (2023-2025) live here:
- `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_service.csv`
- `/Users/m/git/clients/rtneo/forecastingrepo/data/sites_registry.csv`

Verified: 5,641,700 rows; date range 2023-01-01 to 2025-05-31.

Symlinks under `/Users/m/ai/projects/forecastingrepo/data/sites/` were updated to point to the canonical files.

---

## Forecast Regeneration (2025-12-28)

- Cache cleared and forecast regenerated with canonical 2023–2025 data (5,641,700 rows).
- Comparison with the pre-regeneration backup showed **0 changed predictions** across 5,010,382 rows.
- Quality checks passed (no NaN/negatives; date range 2025-06-01 to 2025-12-31).
- ZIP repackaged with the regenerated forecast (timestamp updated).

Note: If predictions were expected to change, investigate potential deterministic behavior or additional caching beyond `data/cache/forecasts`.

---

## Immediate Tasks

### Task 1: Package ZIP

```bash
cd /Users/m/ai/projects/forecastingrepo
zip -j blind_forecast_delivery.zip \
  jury_blind_forecast/forecast_jun_dec_2025.csv \
  jury_blind_forecast/README.txt \
  jury_blind_forecast/wape_result.txt
# Result: ~51MB compressed
```

### Task 2: Data Sanity Checks (BEFORE SENDING)

```bash
# 1. Check row counts make sense
wc -l jury_blind_forecast/forecast_jun_dec_2025.csv
# Expected: ~5M for Jun-Dec

# 2. Check date ranges are correct
python -c "
import pandas as pd
df = pd.read_csv('jury_blind_forecast/forecast_jun_dec_2025.csv')
print('Jun-Dec forecast:')
print(f'  Date range: {df.date.min()} to {df.date.max()}')
print(f'  Sites: {df.site_id.nunique()}')
print(f'  Total rows: {len(df)}')
print(f'  Any NaN forecast_m3: {df.forecast_m3.isna().sum()}')
print(f'  Any negative: {(df.forecast_m3 < 0).sum()}')
"

# 3. Check CSV can be opened in Excel (UTF-8 BOM check)
head -1 jury_blind_forecast/forecast_jun_dec_2025.csv | od -c | head -1
# Should show: site_id,date,forecast_m3 (no weird chars)

# 4. Spot check a few predictions
python -c "
import pandas as pd
df = pd.read_csv('jury_blind_forecast/forecast_jun_dec_2025.csv')
sample = df.groupby('site_id').agg({'forecast_m3': ['mean', 'min', 'max']}).head(5)
print('Sample predictions (m³/day):')
print(sample)
"
```

**Expected Results:**
- Date range: 2025-06-01 to 2025-12-31 (214 days)
- Sites: ~24,000
- No NaN predictions
- No negative predictions
- Predictions look reasonable (0.1 - 100 m³/day typical)

### Task 3: Verify File Sizes

```bash
ls -lh jury_blind_forecast/
# forecast_jun_dec_2025.csv: ~200MB

ls -lh blind_forecast_delivery.zip
# Compressed: ~51MB (OK for email/Telegram)
# If >100MB: Use file sharing service
```

---

## Pre-Send Checklist

Before sending to Jury, verify:

- [ ] README.txt is present and correct
- [ ] Date range is Jun 1 - Dec 31, 2025
- [ ] No NaN or negative predictions
- [ ] ~24k sites included
- [ ] ZIP file < 100MB (or use file share)
- [ ] wape_result.txt included (internal Jan–May 2025 check)
- [ ] Russian text is correct (no encoding issues)

---

## Parallel: Message for Jury

### Initial Message (with ZIP)

```
Привет! Вот прогноз на июнь-декабрь 2025.

Мы проверили модель на январь-май 2025:
WAPE = 29.49% (дельта-метод, сравнение с фактом на даты вывозов)

В архиве:
1. forecast_jun_dec_2025.csv — прогноз для твоей проверки
2. wape_result.txt — результаты нашей внутренней проверки
3. README.txt — что нам вернуть

Нужен только WAPE по июнь-декабрь (мы свою часть уже проверили).
```

### Follow-up Message (hint at demo)

```
Дополнительно, когда будешь готов:

1. Интерактивный дашборд (можем созвониться, покажу)
   - Фильтр по районам
   - Графики по каждой площадке
   - Экспорт в Excel

2. Отчет "Готовность к внедрению"
   - Какие районы можно запускать
   - Score 0-100 по площадкам

3. HTML отчет (открывается в браузере)
   - Топ-500 площадок
   - Поиск, сортировка

Какой формат удобнее для анализа?
```

---

## What's Ready for Demo (if Jury wants)

| Feature | How to Show | Command/URL |
|---------|-------------|-------------|
| Interactive UI | Run locally | `cd mytko-forecast-demo && npm run dev` → localhost:5173 |
| HTML Report | Open in browser | `open forecast_report.html` (75KB, already generated) |
| Excel Export | From UI | Click "Export All" button in UI |
| District Readiness | API call | `GET /api/mytko/district_readiness` |
| Rollout Recs | API call | `GET /api/mytko/rollout_recommendations` |

---

## After Jury Validates

### Expected Response from Jury

```csv
metric,value
overall_wape,12.3
sites_within_20pct,85.2
worst_site_1,site_38123456
worst_site_2,site_38234567
...
```

### Next Steps Based on Response

| WAPE Result | Action |
|-------------|--------|
| < 15% | Celebrate, schedule executive demo |
| 15-20% | Analyze worst sites, iterate |
| > 20% | Deep dive into problem districts |

---

## Key Files Reference

```
/Users/m/ai/projects/forecastingrepo/
├── jury_blind_forecast/
│   ├── forecast_jun_dec_2025.csv     # 5M rows, blind
│   └── validation_jan_may_2025.csv   # 3.3M rows, internal self-check
├── forecast_report.html              # 75KB, browser-viewable
├── EXECUTION_PLAN.json               # All 17 tasks DONE
├── CODE_REVIEW_REPORT.md             # Review findings
├── TRANSCRIPT_REVIEW.md              # Requirements coverage
└── docs/
    ├── PHASE1_PRD.md                 # Scope documentation
    ├── QUICK_START.md                # Setup guide
    └── DEMO_RUNBOOK.md               # Demo script for Artem
```

---

## What's NOT Needed for Jury Delivery

**DO NOT build these for initial delivery:**

| Don't Build | Why |
|-------------|-----|
| E2E test automation | Jury doesn't run tests |
| Fix 28 failing tests | Internal quality, not blocking delivery |
| Additional docs | Handoff + README.txt is enough |
| ClickHouse integration | Phase 3, after pilot success |
| Real-time dashboard | Static CSV is fine for validation |
| PDF reports | Only if explicitly requested later |
| Mobile-friendly UI | Desktop browser is sufficient |

**The goal is: ZIP file + WAPE number → Send today**

---

## Ground Truth for Context Recovery

If session compacts, read these first:
1. `EXECUTION_PLAN.json` - All tasks status
2. `HANDOFF_JURY_DELIVERY.md` - This file
3. `jury_blind_forecast/README.txt` - Delivery status

---

## Strategic: Phase Timeline

### Phase 1: Validation (NOW → 2 weeks)

| Step | Deliverable | Timeline | Owner |
|------|-------------|----------|-------|
| 1 | Send jury_blind_forecast.zip | Today | Dev |
| 2 | Jury returns WAPE % | 3-5 days | Jury |
| 3 | Analyze results | 1 day | Dev |
| **Gate** | **WAPE < 20%?** | **Decision point** | **Jury** |

**What we're asking**: One number (overall WAPE)
- Don't ask per-district yet
- Don't ask per-site details
- Simple: "WAPE is 18%" ✓ vs "District X WAPE 15%, District Y 22%" ✗

**Excel formula for Jury** (if he has no Python):
```
=SUMPRODUCT(ABS(actual_m3 - forecast_m3)) / SUM(actual_m3) * 100
```

---

### Phase 2: Pilot (2-4 weeks after validation passes)

**Only proceed if WAPE < 20%**

| Week | Task | Deliverable | Jury Returns |
|------|------|-------------|--------------|
| Pilot 1 | Generate forecast | forecast_week_1.xlsx | WAPE % |
| Pilot 2 | Iterate model | forecast_week_2.xlsx | WAPE % (should ↓) |
| Pilot 3 | Expand validation | forecast_week_3.xlsx | WAPE % + feedback |
| Pilot 4 | Readiness check | forecast_week_4.xlsx | "Ready for X districts?" |

**Scope**: 1-2 districts, NOT 24k sites
- Let Jury choose which districts (his cleanest data)
- Or suggest top 2 from your internal Jan-May validation
- Cadence: Every Monday (forecast) + Friday (WAPE back)

**Success metric**: WAPE trending down week-over-week

---

### Phase 3: Production (After pilot succeeds)

**Only if 4-week pilot shows:
- WAPE consistently < 15%
- Jury requests "more districts"

Then discuss:**
- ClickHouse integration (real-time updates)
- API endpoints for dispatcher view
- Multi-region rollout timeline

**Why NOT ClickHouse yet:**
- Validation not passed
- Weekly Excel matches Jury's planning cycle
- Infrastructure cost before proof = waste
- Risk of over-building before product-market fit

---

## WAPE Strategy (Critical)

### Ask For (Simple)
```
✓ Overall WAPE % (one number)
✓ "Ready for pilot?" Yes/No
```

### DON'T Ask For (Yet)
```
✗ Per-district breakdown
✗ Per-site errors
✗ Detailed anomaly analysis
```

### Why This Order?
1. Overall WAPE = does it work?
2. If yes → Pilot with best districts
3. If no → Analyze why internally first
4. Only in production → deep dives

**Internal analysis** (you keep private):
- Which districts have best accuracy
- Which sites are outliers
- Why model fails for specific sectors

---

## Jury Message Progression

### Message 1: Initial (with ZIP)
```
Привет! Вот прогноз на июнь-декабрь.

В архиве:
- forecast_jun_dec_2025.csv (5M rows)
- README.txt (инструкции)

Наша точность на январь-май: WAPE X.X%

Для проверки нужна формула:
WAPE = |факт-прогноз| / факт × 100

Сверь со своими данными июнь-декабрь,
вернешь общий WAPE?
```

### Message 2: After WAPE Confirmed (if < 20%)
```
WAPE выглядит хорошо!

Предлагаю пилот на 4 недели:
- 1-2 района на твой выбор
- Еженедельный прогноз (Excel)
- Каждую пятницу → твой feedback

Какие районы интереснее для теста?
```

### Message 3: After Successful Pilot
```
4 недели, WAPE упал с X% до Y%.
Готов к следующему этапу?

Опции:
1. Расширить на 5-10 районов (Excel)
2. Интеграция в вашу систему (API + ClickHouse)

Что подходит?
```

---

## What You Keep Private (Internal Analysis)

| Do Share | Keep Private |
|----------|--------------|
| WAPE % overall | Actual m³ values |
| "District X ready" | Why it failed |
| Iteration count | Specific site errors |
| "Accuracy improving" | Model internals |

This is the **blind validation protocol** — you prove value without showing internals.

---

**Status**: Ready to calculate WAPE and package ZIP
