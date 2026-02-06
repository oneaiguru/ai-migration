# Adesk Import CSV Schema (toolkit `/Users/m/git/clients/adesk/b`)

Files and required headers (must be UTF-8, no BOM):

## accounts.csv (bank accounts)
- id
- name
- account_payment (account number)
- account_bik (bank code, can be empty)
- currency (ISO: KGS/USD/EUR/RUB, etc.)
- type (1 = cash, 2 = bank)
- initial_amount (numeric)
- initial_amount_date (YYYY-MM-DD)

## contacts.csv (contractors)
- id
- company_name (optional)
- given_name
- surname
- middle_name
- phone_number
- email
- job_title

## target.csv (categories)
- id
- name
- parent_id (optional)
- operation_type (1 = income, 2 = expense)

## debet.csv (income transactions)
- id
- amount
- operation_date (YYYY-MM-DD)
- accounts_id (bank account id)
- target_id (category id)
- contacts_id (contractor id)
- apartment_id (project id; optional)
- comment

## credit.csv (expense transactions)
- id
- amount
- operation_date (YYYY-MM-DD)
- accounts_id
- target_id
- contacts_id
- apartment_id
- comment
- is_not_stat (1 marks owner transfer)

## moving.csv (transfers)
- id
- dtdoc (date YYYY-MM-DD)
- amount_from
- amount_to (optional; use when FX differs on destination)
- accounts_from_id
- accounts_to_id
- comment

## apartments.csv (projects)
- id
- title
- description
- is_active (1 active / 0 archived)

## currency.csv (currencies)
- code

## user_account.csv (user accounts)
- id
- name
- type (1 = cash)
- currency
- user_id

Notes
- Headers must match exactly; row field counts must match headers.
- Empty stubs are acceptable for unused files (keep headers, zero data rows).
- operation_type uses numeric codes as above; accounts.type uses 1/2 as above.
- Mapping files in `../data_mappings/` translate CSV ids to Adesk ids.***
