# PR 2.3 — Deterministic Contact Selection

## Status
- [ ] Ready for implementation

## Scope (Single Change)
- Add `ORDER BY LastModifiedDate DESC` to the Contact fallback query so the selection is deterministic.

## Files to Modify
- `deployment/sf-qb-integration-final/src/services/salesforce-api.js`
  - Contact query block (search for `SELECT Id, Email FROM Contact`)

## Exact Code Change

```javascript
// BEFORE (salesforce-api.js ~254-258)
const contactQuery = `
  SELECT Id, Email FROM Contact
  WHERE AccountId = '${opportunity.AccountId}'
  AND Email != null
  LIMIT 1
`;

// AFTER
const contactQuery = `
  SELECT Id, Email FROM Contact
  WHERE AccountId = '${opportunity.AccountId}'
  AND Email != null
  ORDER BY LastModifiedDate DESC
  LIMIT 1
`;
```

## Test Cases

| Test | Input | Expected |
| --- | --- | --- |
| Two contacts | Two Contacts, only the most recently modified has email | selected email = most recent |

## Test Requirements (Option C)
- Add Jest unit tests under `deployment/sf-qb-integration-final/tests/`.
- Suggested test file: `deployment/sf-qb-integration-final/tests/salesforce-api-contact-order.test.js`.
- Mock `SalesforceAPI.prototype.query` and assert the Contact query string includes `ORDER BY LastModifiedDate DESC`.
- Command: `cd deployment/sf-qb-integration-final && npm test`.

## Acceptance Criteria
- Contact query includes ORDER BY LastModifiedDate DESC.
- No other behavior changes.

## NOT in This PR
- OCR fallback (PR 2.2).
- Email priority chain (PR 2.1).
- Payment link changes (PR 2.5–2.7).

## Dependencies
- Do **before** PR 2.2 (OCR fallback) or combine with PR 2.2 since both touch the same query block.
