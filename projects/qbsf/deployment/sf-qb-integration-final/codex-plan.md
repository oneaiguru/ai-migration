# Plan: Fix findOrCreateCustomer return handling

## Goals
- Ensure invoice creation always uses a string customer ID, even if findOrCreateCustomer returns an object or a legacy string.
- Preserve existing currency logic by resolving customer currency when the return value lacks currency metadata.

## Planned Changes
1. `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`
   - Normalize the findOrCreateCustomer result into `qbCustomerId`, `isExistingCustomer`, and `customerCurrency`.
   - Treat legacy string returns as existing customers and resolve currency via `getCustomer` when needed.
   - Guard against missing customer IDs to avoid sending invalid invoice payloads.
2. `projects/qbsf/deployment/sf-qb-integration-final/tests/currency-smart-logic.test.js`
   - Add a regression test for legacy string returns to ensure invoice payloads use string IDs.

## Tests
- `npm test` (from `projects/qbsf/deployment/sf-qb-integration-final`)

## Critical Review
- Legacy string handling will add a `getCustomer` lookup even for newly created customers; acceptable, but ensure the error message is clear if the ID is missing.
- The regression test should avoid unintended FX conversion noise by returning the opportunity currency from `getCustomer`.
