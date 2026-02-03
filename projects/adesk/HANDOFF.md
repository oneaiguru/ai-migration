# Handoff Summary (Adesk migration / audit prep)

## What was done
- Scope locked: audit period 2023–2024 has **two income ops only**; all other quarters zero; no 1% imports; Invoice #3 (402.50 USD, Contract 24-1) is a 2025 item.
- Parsed all 32 KICB statements in `/Users/m/Documents/accounting/bank/renamed-statements/` and imported every row into Adesk (production) via the PHP toolkit.
- Data files in `projects/adesk/newfiles/` now include:
  - `debet.csv`: two USD income rows on account 4068 (ids 2001/2002) → category 9001, contractors 5001/5002.
  - `credit.csv`: 88 expenses across three categories (9101 bank fees, 9102 taxes/municipal, 9103 owner transfers flagged with `is_not_stat=1`).
  - `moving.csv`: 8 FX transfers with `amount_from`/`amount_to` (USD↔KGS/EUR/RUB).
  - `accounts.csv`, `contacts.csv`, `target.csv` (9001 income + 9101/9102/9103 expense categories), stubs for apartments/currency/user_account.
- Adesk mappings (see `projects/adesk/data/mappings/*.json`):
  - Accounts: 3967→268031 (KGS), 4068→268026 (USD), 4169→268030 (EUR), 4270→268029 (RUR).
  - Categories: 9001→1586898 (Export Services), 9101→1587589 (Bank Service Fees), 9102→1587590 (Taxes and Government Fees), 9103→1587591 (Owner Transfers/Withdrawals).
  - Contractors: 5001→5221156 (Dipesh Handa), 5002→5221157 (Avi Ashkenazi).
  - Income transactions: 2001→105014762, 2002→105014763.
  - Expense transactions: 3001–3088 mapped (see `expense_transactions_mappings.json`).
  - Transfers: 4001–4008 mapped (see `transfers_mappings.json`).
- Auth: `.env` uses `ADESK_API_TOKEN=…`, `ADESK_API_URL=https://api.adesk.ru`, `ADESK_API_VERSION=v1` (v1 api_token).

## Current Adesk state (production)
- Income (USD account 268026): 105014762 (4,975.00, Dipesh), 105014763 (24,967.50, Avi) on category 1586898, contractors mapped above. No 1% imports.
- Expenses: 88 outcomes across 9101/9102/9103 on mapped accounts; owner transfers marked with `is_not_stat=1`.
- Transfers: 8 FX transfers across accounts 268026/268031/268029/268030 per `moving.csv`.
- Validator: `migration_validator.php` run (report `logs/migration_validation_report_2025-12-08_16-49-03.*`); overall 98.18% (category/contractor counts skewed by API shape).

## Checklist highlights (see `checklist.json` for details)
- Quarters:
  - 2023 Q1: 428,400 KGS export; 1% = 4,284 KGS; Dipesh Handa; Contract 23-1, Invoice #1.
  - 2023 Q3: 2,191,157.5 KGS export; 1% = 21,911.575 KGS; Avi Ashkenazi; consulting/software.
  - All other 2023–2024 quarters: zero (including 2024 Q4 revised to zero; Invoice #3 moves to 2025).
- 1% payments: only Q1 and Q3 2023 have 1% due; 2024 Q4 1% will be in 2025 (outside this audit scope).
- Address to use going forward: `Apt. 97, House 4, 6th Microdistrict, Bishkek, Kyrgyz Republic`.

## Outstanding tasks for next agent
- UI spot-check: confirm both income ops, expense categories, and FX transfers render correctly in Adesk (production).
- If reclassifying or deleting any ops: remove the corresponding entries from Adesk **and** drop the mappings before rerunning incremental imports (income 2001/2002; expenses 3001–3088; transfers 4001–4008).
- Keep zero quarters empty; do not import 1% for 2023–2024; Invoice #3 stays in 2025.
- Logs and command history: see `NOTE.txt` and `logs/` for the exact commands, IDs, and API calls used in this run.***
