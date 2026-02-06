# VIPFLAT to Adesk Migration Toolkit

This toolkit provides tools for migrating data from VIPFLAT to Adesk. Populate `newfiles/` with CSV exports, copy `.env.example` to `.env` with a valid `ADESK_API_TOKEN`, and run the scripts below.

## Overview

The migration process involves several steps:

1. Validating CSV files
2. Checking API connectivity
3. Migrating reference data (categories, contractors, bank accounts, etc.)
4. Migrating transactional data (income, expenses, transfers)

## Key Scripts

- `run_migration.sh` - Interactive menu-driven interface for all migration tasks
- `check_api_status.php` - Comprehensive API connectivity check
- `check_legal_entities.php` - Checks for legal entities in Adesk (required for bank accounts)
- `migrate_simple.php` - Simple migration script that works with newfiles directory

## Usage

### Quick Start

The easiest way to use the toolkit is through the menu-driven interface:

```bash
./run_migration.sh
```

### Step-by-Step Process

1. **Check API Connectivity**:
   ```bash
   php check_api_status.php
   ```

2. **Verify Legal Entities**:
   ```bash
   php check_legal_entities.php
   ```

3. **Validate CSV Files**:
   ```bash
   php csv-validator.php newfiles/
   ```

4. **Run Test Migration**:
   ```bash
   php migrate_simple.php --test
   ```

5. **Run Actual Migration**:
   ```bash
   php migrate_simple.php
   ```

### Migrating Specific Entity Types

You can migrate specific entity types using the `--entity` parameter:

```bash
php migrate_simple.php --entity=categories --test
```

Available entity types:
- `categories`
- `contractors`
- `bank_accounts`
- `users`
- `projects`
- `income_transactions`
- `expense_transactions`
- `transfers`

## Troubleshooting

### API Connectivity Issues

If you encounter API connectivity issues:
- Verify your API token in `.env` (or update `config.php` defaults)
- Check if your Adesk subscription includes access to all API endpoints
- Try using a different API version

### Migration Errors

- Missing legal entity: Create a legal entity in Adesk manually and set its ID in .env
- Empty or invalid data: Validate your CSV files using the validator tool
- Mapping errors: Check if the required fields are present in the CSV files

## Logs & Data Paths

- Migration logs are stored in `logs/` (kept empty in git; add `.gitkeep` only).
- ID mappings are written to `data/mappings/` during runs.
- CSV inputs belong in `newfiles/` (one directory per dataset; ignored by git).

## Important Notes

- Always run a test migration before the actual migration.
- Ensure your CSV files conform to the expected format.
- Back up your Adesk data before running the actual migration.

## Configuration

The configuration is stored in `config.php`. Key settings include:
- API URL, token, and version
- Data directory (where CSV files are located)
- Mapping between VIPFLAT and Adesk field names
