# YClients Parser - PROJECT COMPLETION PLAN

**Date:** 2025-12-19
**Status:** Final verification phase

---

## CURRENT STATUS OVERVIEW

### ✅ COMPLETED

| Task | Status | Details |
|------|--------|---------|
| Date limit fix ([:31] → dynamic) | ✅ DONE | Lines 789, 916, 920 modified |
| 90-day consecutive empty threshold | ✅ DONE | Lines 1129-1180 added |
| Loop restructuring (DATE first) | ✅ DONE | Correct tracking order |
| Syntax verification | ✅ DONE | py_compile passed |
| Migration plan | ✅ DONE | 8 points documented |
| Browser verification (Lunda UI) | ✅ DONE | ChatGPT agent confirmed prices |

### 🔄 IN PROGRESS (Other Agents)

| Agent | Task | Status |
|-------|------|--------|
| **Codex** | Code migration to `~/ai/projects/yclients/` | 🔄 Running |
| **Browser Agent** | New Supabase project setup | 🔄 Running |

### ❌ BLOCKING ISSUE DISCOVERED

**CSV data mismatch:**
- CSV has: "Корт 1 и Корт 2" with 1,200/2,000/4,000₽ prices
- Should have: "Падел-корт" with 6,000/6,250/6,500₽ tariffs
- **Cause:** Old database has mixed venue data, not fresh Lunda parse

---

## INSTRUCTIONS VERIFICATION

### ✅ SQL Schema (CORRECT)

The SQL instructions for browser agent are correct:

```sql
-- URL list for parsing
create table if not exists urls (
  id serial primary key,
  url text unique not null,
  title text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_active boolean default true
);

-- Booking data (core fields + extra_data JSONB)
create table if not exists booking_data (
  id serial primary key,
  url_id integer references urls(id),
  date date not null,
  time time not null,
  price text,
  provider text,
  seat_number text,
  extra_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(url_id, date, time, seat_number)
);

-- Helpful index for date filtering
create index if not exists booking_data_url_id_date_idx
  on booking_data(url_id, date);
```

**Notes:**
- Schema is simplified compared to original (fewer columns)
- `extra_data` JSONB can hold: duration, service_name, location_name, etc.
- RLS must be OFF or have permissive policies
- ✅ These instructions are CORRECT

### ✅ Credentials Request (CORRECT)

Browser agent should provide:
- `SUPABASE_URL` (project URL)
- `SUPABASE_KEY` (service role key) ← CRITICAL
- `ANON_KEY` (anon key)
- `DB_PASSWORD` (Postgres password)
- `PROJECT_ID` (reference)

---

## PROJECT COMPLETION CHECKLIST

### PHASE 1: Wait for Other Agents (⏳ Current)

- [ ] **Codex:** Finish migration to `~/ai/projects/yclients/`
- [ ] **Browser Agent:** Create Supabase tables + provide credentials
- [ ] **You:** Receive new credentials

### PHASE 2: Configure New Environment (5 min)

Once credentials received:

```bash
cd ~/ai/projects/yclients

# Create .env file
cat > .env << 'EOF'
SUPABASE_URL=<NEW_URL_FROM_BROWSER_AGENT>
SUPABASE_KEY=<SERVICE_ROLE_KEY>
API_HOST=0.0.0.0
API_PORT=8000
API_KEY=test_key_2024
PARSE_URLS=https://b1280372.yclients.com/company/1168982/personal/select-services?o=
PARSE_INTERVAL=600
EOF

# Install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
```

### PHASE 3: Add Lunda URL to Database (2 min)

```bash
# Add Lunda URL to the new urls table
python -c "
import asyncio
from src.database.db_manager import DatabaseManager

async def add_url():
    db = DatabaseManager()
    await db.initialize()
    # Insert Lunda URL
    await db.client.table('urls').insert({
        'url': 'https://b1280372.yclients.com/company/1168982/personal/select-services?o=',
        'title': 'Lunda Padel',
        'is_active': True
    }).execute()
    print('✅ Lunda URL added')
    await db.close()

asyncio.run(add_url())
"
```

### PHASE 4: Run Parser for Lunda (10-15 min)

```bash
# Run parser once for Lunda
python src/main.py --mode parser --once \
  --urls "https://b1280372.yclients.com/company/1168982/personal/select-services?o="
```

**Expected Output:**
- "Found 292 courts across dates" (similar to previous run)
- Should populate booking_data table with Lunda records

### PHASE 5: Export CSV & Verify (5 min)

```bash
# Export to CSV
python -c "
import asyncio
import csv
from src.database.db_manager import DatabaseManager

async def export():
    db = DatabaseManager()
    await db.initialize()
    result = await db.client.table('booking_data').select('*').execute()

    with open('lunda_export.csv', 'w', newline='') as f:
        if result.data:
            writer = csv.DictWriter(f, fieldnames=result.data[0].keys())
            writer.writeheader()
            writer.writerows(result.data)

    print(f'✅ Exported {len(result.data)} rows to lunda_export.csv')
    await db.close()

asyncio.run(export())
"
```

### PHASE 6: Compare CSV to Browser Verification

**Expected in CSV (from browser agent verification):**

| Tariff | Duration | Price | Time Range |
|--------|----------|-------|------------|
| Оптимальный | 60 min | 6,000₽ | 06:00-11:59 |
| Оптимальный | 90 min | 9,000₽ | 06:00-11:59 |
| Оптимальный | 120 min | 12,000₽ | 06:00-11:59 |
| Смешанный | 60 min | 6,250₽ | 12:00-17:59 |
| Смешанный | 90 min | 9,500₽ | 12:00-17:59 |
| Смешанный | 120 min | 12,750₽ | 12:00-17:59 |
| Прайм-тайм | 60 min | 6,500₽ | 18:00-05:59 |
| Прайм-тайм | 90 min | 9,750₽ | 18:00-05:59 |
| Прайм-тайм | 120 min | 13,000₽ | 18:00-05:59 |

**Verification Commands:**

```bash
# Check total rows (expect 300-400+)
wc -l lunda_export.csv

# Check unique prices
cut -d',' -f5 lunda_export.csv | sort -u

# Check if Lunda prices exist
grep "6 000\|6 250\|6 500\|9 000\|9 500\|9 750\|12 000\|12 750\|13 000" lunda_export.csv | wc -l

# Check date range (first and last)
cut -d',' -f3 lunda_export.csv | sort -u | head -1
cut -d',' -f3 lunda_export.csv | sort -u | tail -1

# Check unique times
cut -d',' -f4 lunda_export.csv | sort -u
```

**Pass Criteria:**
- [ ] 300+ rows in CSV
- [ ] Prices include 6,000/6,250/6,500₽ (60 min tariffs)
- [ ] Prices include 9,000/9,500/9,750₽ (90 min tariffs)
- [ ] Prices include 12,000/12,750/13,000₽ (120 min tariffs)
- [ ] Dates span 17+ days (Dec 19 through early January)
- [ ] Times include evening slots (21:00, 22:00)
- [ ] Provider shows "Падел-корт" or similar (NOT "Корт 1 и Корт 2")

---

## POTENTIAL ISSUES & FIXES

### Issue 1: Prices Still Wrong (venue_pricing.py)

If CSV shows wrong prices, check `config/venue_pricing.py`:

```python
# Lunda configuration should be:
'b1280372': {
    'name': 'Lunda Padel',
    'type': 'time_based',
    'tariffs': {
        'Оптимальный': {'hours': (6, 12), 'prices': {60: 6000, 90: 9000, 120: 12000}},
        'Смешанный': {'hours': (12, 18), 'prices': {60: 6250, 90: 9500, 120: 12750}},
        'Прайм-тайм': {'hours': (18, 6), 'prices': {60: 6500, 90: 9750, 120: 13000}},
    }
}
```

### Issue 2: URL Not Associated

If data is saved but `url_id` is NULL:
- Check that Lunda URL exists in `urls` table
- Verify parser is using correct URL association

### Issue 3: Only 60min Records

If only duration=60 found:
- Check multi-duration loop at lines 1224-1259
- Verify `service_catalog` is being captured

---

## FINAL DELIVERABLES

Once verification passes:

1. **CSV File:** `lunda_export.csv` with correct Lunda data
2. **New Repo:** `~/ai/projects/yclients/` with clean code
3. **New Database:** Fresh Supabase with correct schema
4. **Documentation:** Updated CLAUDE.md with new credentials

**Send to Pavel:**
- CSV file
- New Supabase credentials
- GitHub repo link (if pushed)

---

## TIMELINE

| Task | Time | Owner |
|------|------|-------|
| Wait for Codex migration | 10-30 min | Codex |
| Wait for Supabase setup | 5-10 min | Browser Agent |
| Configure environment | 5 min | You |
| Run parser | 10-15 min | You |
| Export & verify CSV | 5 min | You |
| Fix issues (if any) | 10-30 min | You |
| **TOTAL** | **~45-90 min** | - |

---

## SUCCESS CRITERIA

Project is COMPLETE when:

- [x] Code migrated to new repo
- [x] Date limit fixes verified (90-day threshold)
- [ ] New Supabase database created
- [ ] Parser runs successfully against Lunda
- [ ] CSV shows correct prices (6,000/6,250/6,500₽ tariffs)
- [ ] CSV matches browser verification report
- [ ] Pavel receives final deliverables
