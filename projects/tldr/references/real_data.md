# Renewal Radar: Running With Real TLDR Data

Renewal Radar only needs two inputs:

1) `accounts.csv` (one row per customer account)
2) `touchpoints.csv` (one row per engagement event OR one row per account/day)

This guide explains what those files are, where they usually come from (CRM + email + meetings),
and the fastest way to generate them with a coding agent.

---

## Contents

- 0) Pick your `account_id`
- 1) Build `accounts.csv`
- 2) Build `touchpoints.csv`
- 3) Map events to `interaction_value`
- 4) Generate inputs + run the forecast (scripts)
- Mapping file reference
- Using a coding agent (prompt templates)
- Troubleshooting

## 0) Pick Your `account_id` (This Makes Or Breaks Everything)

Every data source has its own IDs. Renewal Radar needs a *single* stable `account_id` that exists
in both files.

Recommended options (pick one):
- CRM Account ID (best): Salesforce AccountId / HubSpot Company ID / internal account UUID
- Normalized company domain (works well if you have reliable domains): `example.com`

Rule: whatever you choose, `accounts.csv.account_id` must match `touchpoints.csv.account_id`.

---

## 1) Build `accounts.csv` (From CRM / Billing / Warehouse)

Minimum required columns:
- `account_id`
- `company`

Strongly recommended columns (used for prioritization):
- `arr` (annual recurring revenue)
- `tier` (enterprise / mid-market / startup, etc.)
- `renewal_date` (ISO date)

Example:
```csv
account_id,company,tier,arr,renewal_date
123,Acme Corp,enterprise,500000,2025-06-15
456,Beta Inc,mid-market,120000,2025-05-20
```

Where this usually comes from:
- Salesforce / HubSpot export
- billing system export
- data warehouse query (Snowflake/BigQuery/etc.)

---

## 2) Build `touchpoints.csv` (From Email + Meetings + CRM "Engagements")

Minimum required columns:
- `account_id`
- `touchpoint_dt` (date or timestamp; script converts to date)
- `interaction_value` (numeric weight)

Optional column (useful for debugging):
- `interaction_type` (open/click/reply/meeting/etc.)

Example:
```csv
account_id,touchpoint_dt,interaction_value,interaction_type
123,2025-01-10,1.0,newsletter_open
123,2025-01-15,2.0,email_reply
123,2025-01-18,3.0,meeting_booked
```

Common touchpoint sources:
- Email marketing events: opens/clicks
- Sales email: replies (strong signal)
- Calendar/meetings: meeting booked/attended (strong signal)
- CRM "engagements": calls, notes, tasks, meetings

Important: real systems often generate multiple events per account per day (multiple opens/clicks).
That's OK. Renewal Radar will handle it, but it's usually better to aggregate to one row per
account/day by summing interaction values.

---

## 3) Map Events -> `interaction_value` (Default Weights)

A simple mapping that works well in practice:
- 1.0 = passive (open/view)
- 2.0 = active (reply/click/download)
- 3.0 = high intent (meeting/proposal/contract)

You can tune weights later; the system still works with a coarse mapping.

---

## 4) Fast Path (Recommended): Use the Included Scripts

If you can export:
- a raw accounts CSV
- a raw events CSV that already includes `account_id`

...then you can generate Renewal Radar inputs without writing code.

First-time setup (if needed):
```bash
python3 -m pip install -r requirements.txt
```

### One Command (Cowork-Friendly)

1) Put your exports here:
- `exports/accounts_raw.csv`
- `exports/events_raw.csv`

No real exports yet? You can test the end-to-end flow with the included examples:
```bash
cp exports/accounts_raw.example.csv exports/accounts_raw.csv
cp exports/events_raw.example.csv exports/events_raw.csv
```

2) Run:
```bash
python3 scripts/cowork_one_click.py
```

On first run, this will create `config/renewal_radar_mapping.json` (a starter mapping generated from your exports), then produce outputs in `reports/`.

If it fails because the mapping doesn't match your columns, run:
```bash
python3 scripts/inspect_exports.py --write-mapping config/renewal_radar_mapping.json
```
Then edit `config/renewal_radar_mapping.json` (column names + event weights) and re-run `python3 scripts/cowork_one_click.py`.

### Manual (3 Steps)

1) Prepare standardized files (rename columns + map event types -> weights):
```bash
cp config/renewal_radar_mapping.example.json config/renewal_radar_mapping.json

python3 scripts/prepare_renewal_radar_inputs.py \
  --accounts-in exports/accounts_raw.csv \
  --events-in exports/events_raw.csv \
  --mapping config/renewal_radar_mapping.json \
  --out-dir data/real \
  --aggregate-daily
```

2) Validate (catches bad dates / missing columns):
```bash
python3 scripts/validate_renewal_radar_inputs.py \
  --accounts data/real/accounts.csv \
  --touchpoints data/real/touchpoints.csv
```

3) Run forecast:
```bash
python3 scripts/run_renewal_radar.py \
  --accounts data/real/accounts.csv \
  --touchpoints data/real/touchpoints.csv \
  --cutoff auto \
  --horizon 30 \
  --out-dir reports
```

Output:
- `reports/renewal_radar_forecast_<cutoff>.csv` (daily points)
- `reports/renewal_radar_account_summary_<cutoff>.csv` (one row per account)
- `reports/renewal_radar_at_risk_<cutoff>.csv` (one row per account, sorted by end-of-horizon risk)
- `reports/renewal_radar_watchlist_<cutoff>.csv` (optional: risk spike during horizon, but ends < threshold)

---

## Mapping File Reference (config/renewal_radar_mapping.json)

The mapping file controls:
- which columns to read from your raw exports
- how to turn `event_type` strings into numeric `interaction_value` weights

Rules:
- In `accounts` and `touchpoints`, each output field can map to:
  - a single column name string (recommended)
  - OR a list of possible column names (first match wins)
  - OR `null` (skip)
- Touchpoints must provide either:
  - `interaction_value` directly (already numeric), OR
  - `interaction_type` + `interaction_value_map` (string -> weight)

Key fields:
- `interaction_value_map`: `{ "email_open": 1.0, "email_reply": 2.0, "meeting_booked": 3.0, ... }`
- `default_interaction_value`:
  - `1.0` to keep unknown event types (safe starter default)
  - `null` to require explicit mapping
- `drop_unmapped_event_types`:
  - `false` to keep unknown event types (uses `default_interaction_value`)
  - `true` to drop unknown event types (only keep mapped ones)

---

## 5) Using a Coding Agent (Prompt Templates)

If an employee doesn't know where to get data, the easiest workflow is:

1) Ask the agent to export `accounts_raw.csv` from the CRM (include account id + ARR + renewal date).
2) Ask the agent to export `events_raw.csv` from email + meetings with a column that matches the same account id.
3) Run the scripts above.

Prompt templates you can copy/paste into your internal coding agent:

Template A (accounts export):
```
Export a CSV called exports/accounts_raw.csv with columns:
account_id, company, tier, arr, renewal_date.
Use our CRM as the source of truth. Ensure account_id is stable and unique.
```

Template B (events export):
```
Export a CSV called exports/events_raw.csv for the last 90 days with columns:
account_id, timestamp, event_type.
Include email opens/clicks, email replies, and meeting booked events.
Ensure account_id matches exports/accounts_raw.csv.
```

Template C (run Renewal Radar):
```
Run:
python3 scripts/prepare_renewal_radar_inputs.py --accounts-in exports/accounts_raw.csv --events-in exports/events_raw.csv --mapping config/renewal_radar_mapping.json --out-dir data/real --aggregate-daily
python3 scripts/validate_renewal_radar_inputs.py --accounts data/real/accounts.csv --touchpoints data/real/touchpoints.csv
python3 scripts/run_renewal_radar.py --accounts data/real/accounts.csv --touchpoints data/real/touchpoints.csv --cutoff auto --horizon 30 --out-dir reports
Then share reports/renewal_radar_at_risk_<cutoff>.csv.
```

---

## Troubleshooting

- "0 at-risk accounts" or "everyone is at-risk": usually a weighting problem (all weights too low/high) or the wrong `account_id` join.
- "Many accounts with 0 touchpoints": identity resolution issue (events don't match accounts).
- "Bad touchpoint_dt": timestamps aren't parseable; convert to ISO format first.
