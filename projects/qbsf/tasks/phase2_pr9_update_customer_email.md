# PR 2.9 — Update Existing QB Customer Email When Non-Blank

## Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `cd deployment/sf-qb-integration-final && npm test`

## Scope (Single Change)
- When `findOrCreateCustomer` finds an existing QuickBooks customer, update `PrimaryEmailAddr`
  only if the new email is non-blank and different from the existing email.
- Add/extend the QuickBooks query to include `PrimaryEmailAddr` and `SyncToken`, and add an
  `updateCustomer` helper for the sparse update.

## Files to Modify
- `deployment/sf-qb-integration-final/src/services/quickbooks-api.js`

## Exact Code Change (Plan V2)
```javascript
// quickbooks-api.js (queries should include email + SyncToken)
const query = encodeURIComponent(
  `SELECT Id, DisplayName, PrimaryEmailAddr, SyncToken FROM Customer WHERE DisplayName = '${escapedName}'`
);

if (existingCustomer) {
  const newEmail = customerData.PrimaryEmailAddr?.Address?.trim();
  const oldEmail = existingCustomer.PrimaryEmailAddr?.Address?.trim();

  if (newEmail && newEmail !== oldEmail) {
    logger.info(`Updating customer email: ${oldEmail || '(none)'} -> ${newEmail}`);
    await this.updateCustomer(existingCustomer.Id, {
      PrimaryEmailAddr: customerData.PrimaryEmailAddr,
      SyncToken: existingCustomer.SyncToken
    });
  }
  return existingCustomer.Id;
}
```

```javascript
// quickbooks-api.js (new helper)
async updateCustomer(customerId, data) {
  const payload = {
    Id: customerId,
    sparse: true,
    ...data
  };
  return this.request('post', 'customer', payload);
}
```

## Test Cases
| Test | Existing Email | New Email | Expected |
| --- | --- | --- | --- |
| Different email | old@x.com | new@x.com | updateCustomer called |
| Same email | same@x.com | same@x.com | no update |
| Blank new email | old@x.com | "" | no update |

## Test Requirements (Option C)

### Test File
- Path: `deployment/sf-qb-integration-final/tests/quickbooks-customer-email-update.test.js`

### Test Approach
1. Mock `QuickBooksAPI.request` and `QuickBooksAPI.updateCustomer`.
2. Stub `request` to return an existing customer with `PrimaryEmailAddr` + `SyncToken` for the name/email query.
3. Pass `customerData` with/without `PrimaryEmailAddr`.
4. Assert `updateCustomer` is only called when new email is non-blank and different.

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```

## Acceptance Criteria
- Existing customer email is updated only when the new email is non-blank and different.
- No update when email is blank or unchanged.

## NOT in This PR
- Email priority order and emailSource logging (PR 2.8).
