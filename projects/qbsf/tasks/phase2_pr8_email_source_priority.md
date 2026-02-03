# PR 2.8 — Align Email Priority + Email Source Logging

## Status
- [x] Complete (2025-12-27)
- [x] Reviewed (2025-12-27)
- Tests: `cd deployment/sf-qb-integration-final && npm test`

## Scope (Single Change)
- Align billing email priority with Plan V2: Opportunity.Email_for_invoice__c → Primary OCR → Account.Email__c → Contact fallback.
- Return `billingEmail` + `emailSource` from `getOpportunityWithRelatedData` so the route can log the source and avoid recomputing.
- This intentionally changes the priority order from PR 2.1/2.2 (Opp → Account → OCR/Contact) to match Plan V2.

## Files to Modify
- `deployment/sf-qb-integration-final/src/services/salesforce-api.js`
- `deployment/sf-qb-integration-final/src/routes/api.js`
- `deployment/sf-qb-integration-final/tests/billing-email-trim.test.js`
- `deployment/sf-qb-integration-final/tests/salesforce-api-ocr-fallback.test.js`
- `deployment/sf-qb-integration-final/tests/salesforce-api-contact-order.test.js`

## Exact Code Change (Plan V2)
```javascript
// salesforce-api.js (getOpportunityWithRelatedData)
let billingEmail = null;
let emailSource = null;
let contactEmail = null; // keep for backward compatibility

if (opportunity.Email_for_invoice__c && opportunity.Email_for_invoice__c.trim()) {
  billingEmail = opportunity.Email_for_invoice__c.trim();
  emailSource = 'OPPORTUNITY_FIELD';
}

if (!billingEmail) {
  // Primary OCR email
  const ocrResult = await this.query(ocrQuery);
  const email = ocrResult.records?.[0]?.Contact?.Email?.trim();
  if (email) {
    billingEmail = email;
    contactEmail = email;
    emailSource = 'PRIMARY_CONTACT_ROLE';
  }
}

if (!billingEmail && account.Email__c && account.Email__c.trim()) {
  billingEmail = account.Email__c.trim();
  emailSource = 'ACCOUNT_FIELD';
}

if (!billingEmail) {
  // Most recent Contact with email (ORDER BY LastModifiedDate DESC)
  const contactResult = await this.query(contactQuery);
  const email = contactResult.records?.[0]?.Email?.trim();
  if (email) {
    billingEmail = email;
    contactEmail = email;
    emailSource = 'CONTACT_FALLBACK';
  }
}

if (!billingEmail) {
  emailSource = 'NONE';
}

return { opportunity, account, products, contactEmail, billingEmail, emailSource };
```

```javascript
// routes/api.js
const billingEmail = opportunityData.billingEmail || '';
logger.info(`Billing email for customer: ${billingEmail || '(none)'} (source: ${opportunityData.emailSource || 'unknown'})`);
```
Update both `/opportunity-to-invoice` and `/update-invoice` to use `opportunityData.billingEmail` (do not recompute with account/contact fields).

## Test Cases
| Test | Input | Expected |
| --- | --- | --- |
| Opp email | Opportunity.Email_for_invoice__c set | billingEmail = opp email, emailSource = OPPORTUNITY_FIELD |
| OCR email | Opp blank, Primary OCR has email | billingEmail = OCR email, emailSource = PRIMARY_CONTACT_ROLE |
| Account email | Opp/OCR blank, Account.Email__c set | billingEmail = Account email, emailSource = ACCOUNT_FIELD |
| Contact email | Opp/OCR/Account blank, Contact email present | billingEmail = Contact email, emailSource = CONTACT_FALLBACK |
| No email | All sources blank | billingEmail = null, emailSource = NONE |

## Test Requirements (Option C)

### Test File
- Path: `deployment/sf-qb-integration-final/tests/salesforce-api-email-source.test.js`

### Test Approach
1. `jest.spyOn(SalesforceAPI.prototype, 'getRecord')` to return Opportunity + Account.
2. `jest.spyOn(SalesforceAPI.prototype, 'query')` to return OCR/Contact rows per case.
3. Call `getOpportunityWithRelatedData(opportunityId)`.
4. Assert `billingEmail` and `emailSource` for each case.

### Update Existing Tests
- `billing-email-trim.test.js`: mock `getOpportunityWithRelatedData` to return `billingEmail` + `emailSource`, and update expectations to match the new priority order.
- `salesforce-api-ocr-fallback.test.js`: assert `billingEmail`/`emailSource` instead of `contactEmail`.
- `salesforce-api-contact-order.test.js`: ensure the Contact query still includes `ORDER BY LastModifiedDate DESC` when the Contact fallback is executed.

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```

## Acceptance Criteria
- Email priority order matches Plan V2.
- `emailSource` is populated for all cases and logged once in the route.
- Existing Jest tests are updated to the new priority order.
- No other payload changes.

## NOT in This PR
- Update existing QuickBooks customer email (PR 2.9).
- Payment link status changes (PR 2.5–2.7).
