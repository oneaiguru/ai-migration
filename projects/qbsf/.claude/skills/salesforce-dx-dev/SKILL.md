---
name: salesforce-dx-dev
description: Deploy, test, and manage Salesforce code with SFDX CLI. Use when working with Apex classes, triggers, test coverage, deployments, or Salesforce metadata operations. Triggers on keywords like Apex, trigger, test coverage, SFDX, deploy, sandbox, production.
version: 1.0.0
allowed-tools: Bash, Read, Write, Edit, Grep
---

# Salesforce DX Development Skill

## When to Use
- Deploying Apex classes/triggers to Salesforce orgs
- Running Apex tests and checking code coverage
- Managing field metadata and custom objects
- Debugging Salesforce deployment errors

## Core Commands

### Authentication
```bash
# Check current auth status
sf org list

# Login to sandbox
sf org login web --alias sanboxsf --instance-url https://customer-inspiration-2543.sandbox.my.salesforce.com

# Display org info
sf org display --target-org sanboxsf
```

### Testing
```bash
# Run all local tests with coverage
sf apex run test --code-coverage --synchronous --target-org sanboxsf

# Run specific test class
sf apex run test --class-names QBInvoiceIntegrationQueueableTest --target-org sanboxsf --synchronous

# Get org-wide coverage
sf apex run test --test-level RunLocalTests --code-coverage --result-format human --target-org sanboxsf
```

### Deployment
```bash
# Validate deployment (dry-run)
sf project deploy start --source-dir force-app/main/default/classes/ --target-org sanboxsf --dry-run

# Deploy with tests
sf project deploy start --source-dir force-app/main/default/classes/ --target-org sanboxsf --test-level RunLocalTests

# Deploy specific file
sf project deploy start --source-dir force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls --target-org sanboxsf
```

### Field Research
```bash
# Describe Account object to find Supplierc
sf sobject describe Account --target-org sanboxsf | grep -i supplier

# Query field definitions
sf data query --query "SELECT QualifiedApiName, DataType, Label FROM FieldDefinition WHERE EntityDefinitionId = 'Account' AND QualifiedApiName LIKE '%Supplier%'" --target-org sanboxsf

# List all custom fields on Account
sf data query --query "SELECT QualifiedApiName, DataType FROM FieldDefinition WHERE EntityDefinitionId = 'Account' AND IsCustom = true" --target-org sanboxsf
```

## Error Patterns

### REQUIRED_FIELD_MISSING
```
System.DmlException: Insert failed. First exception on row 0; first error: REQUIRED_FIELD_MISSING, Required fields are missing: [Supplierc]
```
**Fix**: Add the required field to test data setup. Find field type first, then populate with valid value.

### Code Coverage Below 75%
```
Your organization's code coverage is 20%. You need at least 75% coverage.
```
**Fix**: 
1. Identify uncovered lines: `sf apex run test --code-coverage --output-dir ./coverage`
2. Add tests for uncovered code paths
3. Ensure triggers have at least 1% coverage

## Test Data Patterns

### Creating Valid Test Account
```apex
@TestSetup
static void setupTestData() {
    Account testAccount = new Account(
        Name = 'Test Supplier',
        Type = 'Supplier',
        BillingCountry = 'USA',
        // Add required custom fields:
        Supplierc = true,  // or lookup ID if lookup field
        Account_Type__c = 'Поставщик',
        Country__c = 'US'
    );
    insert testAccount;
}
```

---
