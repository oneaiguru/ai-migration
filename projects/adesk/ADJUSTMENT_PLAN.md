# Adjustment Plan for Adesk Migration Toolkit

Goal: adapt the existing toolkit (`/Users/m/git/clients/adesk/b` and smallbiz-migration) to handle our minimal 2023–2024 import (two income rows) and future simple-business/apartment cases with minimal manual UI edits.

## Codebase references
- Toolkit: `/Users/m/git/clients/adesk/b/`
  - `classes/AdeskApi.php` (v1, api_token in query)
  - `config.php`, `csv-validator.php`, `migrate_without_bank_accounts.php`, `migrate-newfiles.php`, etc.
- Smallbiz client: `/Users/m/git/clients/adesk/smallbiz-migration/classes/AdeskApi.php` (v1, api_token).

## Auth harmonization
- Current client uses `api_token` query (v1). Our Adesk tenant works (tested).
- Option: add header auth (`X-API-Token`) and a version flag to `AdeskApi` to support v2 if needed. Ensure `.env` keys: `ADESK_API_TOKEN`, `ADESK_API_URL`, optional `ADESK_API_VERSION`.

## ID mapping (labels → Adesk IDs)
- Known IDs (from API):
  - Accounts: 3967→268031 (KGS), 4068→268026 (USD), 4169→268030 (EUR), 4270→268029 (RUR).
  - Category: 9001 (“Export Services”) → 1586898.
  - Contractors: 5001 (Dipesh Handa) → 5221156; 5002 (Avi Ashkenazi) → 5221157.
- Mapping files (used by `IdMapper`): `data/mappings/bank_accounts_mappings.json`, `categories_mappings.json`, `contractors_mappings.json` are prefilled with the IDs above.
- If you need to recreate IDs: use `getCategories`/`createCategory` to ensure “Export Services”, and `getContractors`/`createContractor` to ensure Dipesh/Avi.

## CSV flexibility (minimal imports)
- `csv-validator.php` currently requires full set (contacts/accounts/apartments/target/debet/credit/moving/currency/user_account).
- Adjust options:
  1) Add a “minimal mode” flag to skip missing CSVs (for our two-income import), or
  2) Provide empty stubs for unused CSVs (apartments/credit/moving/currency/user_account) to satisfy the validator.
- Ensure field order/schema matches toolkit expectations (see `config.php`).

## Import flow adjustments
- Import order: categories → contractors → income (debet). Transfers/expenses/projects optional.
- Pre-step: map CSV IDs to Adesk IDs via the mapping config.
- Ensure account mapping uses KGS account ID 268031 for our two income rows.
- Keep zero quarters empty; do not import 1% payments (for 2023–2024).

## Extending to simple business/apartments
- Projects/apartments: fill `apartments.csv` if needed; map IDs via config; importer already supports projects through `config.php` field mappings.
- Expenses/transfers: if needed later, add `credit.csv`/`moving.csv` with proper mappings; categories for expenses may need creation via API.
- Bank fees: optional; can stay outside unless required for P&L.

## Validation/run steps (after adjustments)
1) Set `.env` with token/base URL (and version if used).
2) Ensure mapping config populated with Adesk IDs (accounts/categories/contractors).
3) `php csv-validator.php newfiles/` (or minimal mode/stubs).
4) Import in order: categories → contractors → income.
5) Post-check: `migration_validator.php` + UI spot-check.

## Open items for implementation
- Decide validator strategy: minimal mode vs stubs.
- (Optional) Update `AdeskApi` to support header auth/v2 toggle.
- Keep PR #78 context: two income rows only; 1% stays external; Invoice #3 is 2025.
