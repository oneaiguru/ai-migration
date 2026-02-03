# Data Prep Workplan (full transaction coverage)

Context
- Scope locked: only two income ops for 2023–2024; no 1% imports; Invoice #3 (2025) stays out.
- Current state (2025-12-09): two USD income ops already in Adesk (account 4068/268026, IDs 105014762/105014763) and **all statement rows have now been imported**:
  - `credit.csv` populated with 88 expenses (bank fees, taxes, owner transfers).
  - `moving.csv` populated with 8 FX transfers (USD↔KGS/EUR/RUB).
  - Categories created in Adesk: 9101 Bank Service Fees (1587589), 9102 Taxes and Government Fees (1587590), 9103 Owner Transfers/Withdrawals (1587591).
  - Mappings updated in `data_mappings/` for categories, expenses, transfers; validator run (98.18%, category/contractor counts skewed by API shape).
- Goal for next agent: UI spot-check, adjust if any amounts/dates/categories need tweaks, and keep mapping/logs in sync for any reruns.

Sources
- Statements: `/Users/m/Documents/accounting/bank/renamed-statements/` (32 XLS files across KGS/USD/EUR/RUB, quarterly through 2024).
- Known income amounts from USD statements:
  - 2023-01-16: +4,975.00 USD (CONSULTANCY FEES) → Dipesh Handa, Contract 23-1.
  - 2023-07-27: +24,967.50 USD (BNY CUST) → Avi Ashkenazi.

Schema targets (see `../schema/CSV_SCHEMA.md`)
- Already populated: `accounts.csv`, `contacts.csv`, `target.csv` (9001 income + 9101/9102/9103 expenses), `debet.csv` (two USD income rows), `credit.csv` (88 expenses with `comment` + `is_not_stat`), `moving.csv` (8 FX transfers with `amount_to` + `comment`), stubs for `apartments.csv`, `currency.csv`, `user_account.csv`.
- Nothing left to fill; only adjust if reclassifying any expense/transfer.

Mappings (live Adesk IDs)
- Accounts: 3967→268031 (KGS), 4068→268026 (USD), 4169→268030 (EUR), 4270→268029 (RUR).
- Categories: 9001 “Export Services” → 1586898; 9101 Bank Service Fees → 1587589; 9102 Taxes and Government Fees → 1587590; 9103 Owner Transfers/Withdrawals → 1587591.
- Contractors: 5001 Dipesh Handa → 5221156; 5002 Avi Ashkenazi → 5221157.
- Income ops: 2001→105014762; 2002→105014763 (USD).
- Expense ops: 3001–3088 mapped (see `expense_transactions_mappings.json`).
- Transfers: 4001–4008 mapped (see `transfers_mappings.json`).

Extraction workflow (per statement)
1) Read XLS with pandas (see `STATEMENTS_AND_SKILL.md` pattern). Find header row (“Operation #”), set columns (op, date, counterparty, description, amount, balance), drop empty rows, coerce numerics.
2) Classification used:
   - Income: only the two known USD credits (2001/2002) kept in `debet.csv`.
   - Bank fees/charges/taxes: 9101 (maintenance, payment commissions, sales tax lines).
   - Government/municipal/tax: 9102 (UGNS “взносы”, NPT, garbage fee).
   - Owner transfers/withdrawals: 9103 with `is_not_stat=1` (card top-ups, ELQR/MEGA/MBANK payments, Golden Crown sends, other personal transfers).
   - FX/internal moves: `moving.csv` with `amount_from`/`amount_to` and comments noting rates.
   - Currency conversion: source amounts kept; `amount_to` reflects credited amount on destination account.
3) IDs: income fixed at 2001/2002; expenses 3001–3088; transfers 4001–4008.
4) Comments: description + counterparty kept for traceability.

Import/run steps (current run)
1) Categories created via API (IDs above); mappings updated manually in `data_mappings/`.
2) Validate: `php csv-validator.php newfiles/` (all passed).
3) Import (toolkit `/Users/m/git/clients/adesk/b`):
   - `php migrate-newfiles.php --mode=incremental --entity=income_transactions` (skipped; already mapped).
   - `php migrate-newfiles.php --mode=incremental --entity=expense_transactions` (88 rows; second pass picked up last 5 after timeout).
   - `php migrate-newfiles.php --mode=incremental --entity=transfers` (8 FX transfers).
4) `php migration_validator.php` (report 2025-12-08_16-49-03.*); UI spot-check still recommended.

Constraints/reminders
- Do not import 1% for 2023–2024; keep Invoice #3 in 2025 only.
- Keep zero quarters empty for PVT scope.
- Preserve XLS formulas/templates if editing; no hardcoded calculated values; use NBKR rate on recognition date.
- Use `.env` in the toolkit with ADESK_API_TOKEN/ADESK_API_URL (v1 api_token works).
- If you need to rerun: remove/adjust mappings for any transactions you delete in Adesk; prefer incremental mode to skip already-mapped IDs.***
