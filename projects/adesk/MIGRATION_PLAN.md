# Migration Plan — Small Biz (4 Accounts, <100 Tx)

## Scope
- Source: Quarterly XLSX statements (KGS/ USD/ EUR/ RUB) for 2023–2024.
- Target: Adesk via migration toolkit (PHP), using precreated Adesk bank accounts (mapped).
- Volume: 98 transactions total across 4 accounts (2 income, 88 expenses, 8 FX transfers).

## Current State
- Toolkit and docs live in `projects/adesk/` (production token in `.env`, using v1 api_token).
- Bank mappings seeded: accounts 3967→268031 KGS, 4068→268026 USD, 4169→268030 EUR, 4270→268029 RUB.
- Categories created in Adesk: 9001 Export Services (1586898), 9101 Bank Service Fees (1587589), 9102 Taxes and Government Fees (1587590), 9103 Owner Transfers/Withdrawals (1587591).
- `newfiles/` populated:
  - `accounts.csv`, `contacts.csv` (Dipesh/Avi), `target.csv` (9001 + 9101/9102/9103).
  - `debet.csv` two USD income rows (ids 2001/2002).
  - `credit.csv` 88 expenses (ids 3001–3088) with `comment` + `is_not_stat`.
  - `moving.csv` 8 FX transfers (ids 4001–4008) with `amount_from`/`amount_to`.
  - stubs for apartments/currency/user_account.
- Mappings stored in `data/mappings/*.json` for all entities above; logs in `logs/`; schema in `schema/CSV_SCHEMA.md`.

## Risks / Checks
- Incremental reruns must drop mappings for any deleted transactions to avoid skips/duplicates.
- Category/contractor counts in validator are skewed by API response shape; rely on mappings + UI for confirmation.
- Transfers include FX; `amount_to` is set—verify UI displays expected amounts on both accounts.

## Work Plan
1) **If adjusting data**
   - Delete/modify records in Adesk first (income ids 105014762/105014763; expenses 105024278–105024423 range; transfers 4406181–4406189).
   - Remove corresponding ids from mapping JSONs before rerun.
2) **Validate**
   - `php csv-validator.php newfiles/` (schema uses comment/is_not_stat on credit; amount_to/comment on moving).
3) **Import (incremental)**
   - `php migrate-newfiles.php --mode=incremental --entity=income_transactions` (should skip unless mappings cleared).
   - `php migrate-newfiles.php --mode=incremental --entity=expense_transactions`.
   - `php migrate-newfiles.php --mode=incremental --entity=transfers`.
4) **Post-check**
   - `php migration_validator.php` + UI spot-check (income, category usage, FX transfers).

## Readiness Checklist (PVT Reporting / Audit Mapping)
- 2023 Q1: export 428,400 KGS (Contract 23-1, Invoice #1; Dipesh Handa, South Africa); 1% = 4,284 KGS; paid externally.
- 2023 Q3: export 2,191,157.5 KGS (Consulting/Software Dev; Avi Ashkenazi, USA); 1% = 21,911.575 KGS; paid externally.
- 2023 Q2, Q4 and all 2024 quarters: zero; Q4 2024 revised to zero with cover letter; Invoice #3 in 2025.
- 1% payments stay external; no imports for 2023–2024. Address: “Apt. 97, House 4, 6th Microdistrict, Bishkek, Kyrgyz Republic.”

## Deliverables
- Filled CSVs in `newfiles/` for all entities (income/expense/transfers + stubs).
- Updated mappings in `data/mappings/` for accounts, categories, contractors, income, expenses, transfers.
- Logs and validation notes in `logs/` + `NOTE.txt`.***
