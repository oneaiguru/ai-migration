# Adesk ID Mapping Notes

Use the toolkit client from `/Users/m/git/clients/adesk/smallbiz-migration/classes/AdeskApi.php` (v1 endpoints with `api_token` param). Quick reference endpoints:
- Bank accounts: `getBankAccounts()`, `createBankAccount($data)`, `updateBankAccount($id, $data)`
- Categories: `getCategories()`, `createCategory($data)`
- Contractors: `getContractors()`, `createContractor($data)`

Known IDs (already created via API):
- Bank accounts:
  - KGS: 268031 (`name`: kgs)
  - USD: 268026 (`name`: usd)
  - EUR: 268030 (`name`: eur)
  - RUR: 268029 (`name`: rur)

CSV labels to map for import:
- Accounts in CSV: 3967 (KGS), 4068 (USD), 4169 (EUR), 4270 (RUB) → map to Adesk IDs above (use 268031 for KGS account on the two income ops).
- Category in `target.csv`: 9001 “Export Services” (income, op_type=1). If creating in Adesk, note the new category ID and map.
- Contractors in `contacts.csv`: 5001 Dipesh Handa; 5002 Avi Ashkenazi. If creating in Adesk, note their IDs and map.

Recommended mapping format (config for importer):
```json
{
  "accounts": {
    "3967": 268031,
    "4068": 268026,
    "4169": 268030,
    "4270": 268029
  },
  "categories": {
    "9001": 1586898
  },
  "contractors": {
    "5001": 5221156,
    "5002": 5221157
  }
}
```

Env/auth:
- `.env` should provide `ADESK_API_TOKEN`, `ADESK_API_URL` (prod), optional `ADESK_API_VERSION=v2`. The main code uses `X-API-Token` header. The legacy toolkit (smallbiz-migration) uses `api_token` query with v1 endpoints.

Flow to create/fetch IDs (using the smallbiz-migration client):
1. Set `ADESK_API_TOKEN` and `ADESK_API_URL` in `.env`.
2. Use `getCategories()` to list; if “Export Services” absent, call `createCategory` with `type=1` (income), `name` = “Export Services”.
3. Use `getContractors()` to list; if Dipesh/Avi absent, call `createContractor` with `given_name`, `surname`, and country in description.
4. Record returned IDs into the mapping config above for the importer.

Current mapping files (used by `IdMapper` in `projects/adesk/data/mappings/`):
- `bank_accounts_mappings.json`: 3967→268031 (KGS), 4068→268026 (USD), 4169→268030 (EUR), 4270→268029 (RUR).
- `categories_mappings.json`: 9001 “Export Services” → 1586898.
- `contractors_mappings.json`: 5001 Dipesh Handa → 5221156; 5002 Avi Ashkenazi → 5221157.
