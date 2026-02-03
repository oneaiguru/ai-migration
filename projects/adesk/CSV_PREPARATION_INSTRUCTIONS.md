# CSV File Preparation Instructions for VIPFLAT to Adesk Migration

## Overview

This document provides instructions for preparing CSV files for the VIPFLAT to Adesk migration tool. The migration requires properly formatted CSV files to ensure successful data transfer.

## Required CSV Files

The following CSV files are required for the migration:

| File Name | Description | Maps to Entity |
|-----------|-------------|---------------|
| contacts.csv | Contractors/contacts | contractors |
| accounts.csv | Bank accounts | bank_accounts |
| apartments.csv | Properties/apartments | projects |
| target.csv | Transaction categories | categories |
| debet.csv | Income transactions | income_transactions |
| credit.csv | Expense transactions | expense_transactions |
| moving.csv | Transfers between accounts | transfers |
| currency.csv | Currency information | currencies |
| user_account.csv | User information | users |

## CSV File Requirements

Each CSV file must meet the following requirements:

1. **UTF-8 Encoding**: All files must be encoded in UTF-8 without BOM.
2. **Header Row**: The first row must contain column headers.
3. **No Whitespace in Headers**: Headers should not have leading or trailing whitespace.
4. **Consistent Field Count**: All rows must have the same number of fields as the header row.
5. **Required Fields**: Each CSV file must contain specific required fields as detailed below.

## Specific Field Requirements

### contacts.csv (Contractors)
- id
- company_name (or given_name/surname for individuals)
- phone_number (optional)
- email (optional)

### accounts.csv (Bank Accounts)
- id
- name
- account_payment (account number)
- account_bik (bank code)
- currency
- type

### apartments.csv (Projects)
- id
- title
- description (optional)
- is_active

### target.csv (Categories)
- id
- name
- parent_id (optional)
- operation_type

### debet.csv (Income Transactions)
- id
- amount
- operation_date
- accounts_id
- target_id (optional)
- contacts_id (optional)
- apartment_id (optional)

### credit.csv (Expense Transactions)
- id
- amount
- operation_date
- accounts_id
- target_id (optional)
- contacts_id (optional)
- apartment_id (optional)

### moving.csv (Transfers)
- id
- dtdoc (date)
- amount_from
- accounts_from_id
- accounts_to_id

## Validation Tools

We provide the following tools to help you prepare and validate your CSV files:

### CSV Validator
```bash
php csv-validator.php <path_to_csv_file>
php csv-validator.php <directory_with_csv_files>
```

This tool checks if your CSV files meet the requirements for the migration.

### CSV Fixer
```bash
php csv-fixer.php <input_csv_file> <output_csv_file>
php csv-fixer.php <input_directory> <output_directory>
```

This tool attempts to fix common issues in CSV files, including:
- Trimming whitespace from headers
- Ensuring consistent field counts
- Fixing encoding issues

### CSV Migration Checker
```bash
php csv-check-migration.php <csv_file> <entity_type>
```

This tool tests if a CSV file can be successfully processed by the migration tool.

## Common Issues and Solutions

1. **Inconsistent Field Count**
   - Problem: Some rows have fewer fields than the header row.
   - Solution: Use the CSV Fixer to pad rows with empty fields.

2. **Whitespace in Headers**
   - Problem: Headers have leading or trailing whitespace.
   - Solution: Use the CSV Fixer to trim whitespace from headers.

3. **Encoding Issues**
   - Problem: Non-UTF-8 characters in the data.
   - Solution: Ensure all files are saved in UTF-8 encoding.

4. **Missing Required Fields**
   - Problem: CSV files don't contain all required fields.
   - Solution: Check the field requirements and add missing fields to your CSV files.

## Contact

If you have any questions or need assistance preparing your CSV files, please contact us at [support@example.com](mailto:support@example.com).