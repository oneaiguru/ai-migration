# Bank Account Migration Guide

## Overview

Due to API limitations with legal entity access, bank accounts must be created manually in the Adesk web interface before migration. This guide explains how to:

1. Create bank accounts manually in Adesk
2. Edit these accounts to match the VIPFLAT data
3. Map these accounts to the VIPFLAT accounts
4. Run the migration for all other entities

## Step 1: Creating Bank Accounts in Adesk

1. Log in to the Adesk web interface
2. Navigate to the "Finances" section
3. Click on "Bank Accounts"
4. Click "Add Bank Account"
5. Create each of the accounts from the VIPFLAT system (14 total accounts needed)
6. When creating accounts, use the following naming convention temporarily:
   - Name: "VIPFLAT Import - [Original Account Name]"
   - This will make it easier to identify these accounts during the mapping process

## Step 2: Mapping Bank Accounts

Once the accounts are created in Adesk, you need to map them to the original VIPFLAT accounts:

1. Run the bank account mapping tool:
   ```
   php create_bank_account_mappings.php
   ```
2. The tool will display all VIPFLAT bank accounts and the manually created Adesk accounts
3. For each VIPFLAT account, enter the ID of the corresponding Adesk account
4. The tool will save these mappings for use during the transaction migration

## Step 3: Editing Bank Account Details

After mapping, you should update the bank account details in Adesk to match the original VIPFLAT data:

| VIPFLAT Field | Adesk Field | Notes |
|---------------|-------------|-------|
| name | Name | Account name |
| account_payment | Account Number | Bank account number |
| account_bik | BIC/SWIFT | Bank identification code |
| currency | Currency | Currency code (RUR, USD, etc.) |
| initial_amount | Initial Balance | Opening balance |
| initial_amount_date | Initial Balance Date | Date of opening balance |

### CSV Data Reference

Below is a reference table of the VIPFLAT bank accounts from the CSV file. Use this information to update the manually created accounts in Adesk:

| ID | Name | Account Number | BIC/SWIFT | Currency | Initial Balance | Date |
|----|------|---------------|-----------|----------|----------------|------|
| 1000000 | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] |
| 1000109 | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] | [Fill from CSV] |
| ... | ... | ... | ... | ... | ... | ... |

## Step 4: Running the Migration

Once all bank accounts are created, mapped, and updated, you can run the migration for all other entities:

1. Migrate categories:
   ```
   php migrate_without_bank_accounts.php --entity=categories
   ```

2. Migrate contractors:
   ```
   php migrate_without_bank_accounts.php --entity=contractors
   ```

3. Migrate projects:
   ```
   php migrate_without_bank_accounts.php --entity=projects
   ```

4. Migrate transactions (these will use the bank account mappings):
   ```
   php migrate_without_bank_accounts.php --entity=income_transactions
   php migrate_without_bank_accounts.php --entity=expense_transactions
   ```

5. Migrate transfers:
   ```
   php migrate_without_bank_accounts.php --entity=transfers
   ```

6. Alternatively, run a complete migration:
   ```
   php migrate_without_bank_accounts.php --entity=all
   ```

## Troubleshooting

### Common Issues

1. **Legal Entity Errors**:
   - If you encounter errors related to legal entities when creating bank accounts manually, make sure you have created a legal entity named "VIPFLATS" in the Adesk system.

2. **Mapping Issues**:
   - If a transaction fails due to missing bank account mapping, run the mapping tool again to ensure all accounts are properly mapped.

3. **Transaction Creation Errors**:
   - Check the logs for specific error messages
   - Verify that all referenced entities (categories, contractors, projects) have been migrated successfully

### Help and Support

For additional assistance, please contact our support team at [support email].