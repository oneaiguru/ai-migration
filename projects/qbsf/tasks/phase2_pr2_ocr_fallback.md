# PR 2.2 — Primary OpportunityContactRole Fallback

## Status
- [ ] Ready for implementation

## Scope (Single Change)
- Add OpportunityContactRole (OCR) query with IsPrimary = true, and use it as the first Contact fallback when Email_for_invoice__c and Account.Email__c are absent.

## Files to Modify
- `deployment/sf-qb-integration-final/src/services/salesforce-api.js`
  - Contact email query block (search for `SELECT Id, Email FROM Contact`)

## Exact Code Change

```javascript
// BEFORE (salesforce-api.js ~251-267)
let contactEmail = null;
try {
  const contactQuery = `
    SELECT Id, Email FROM Contact
    WHERE AccountId = '${opportunity.AccountId}'
    AND Email != null
    LIMIT 1
  `;
  const contactResult = await this.query(contactQuery);
  if (contactResult.records && contactResult.records.length > 0) {
    contactEmail = contactResult.records[0].Email;
    logger.info(`Found contact email for billing: ${contactEmail}`);
  }
} catch (contactError) {
  logger.warn(`Could not get contact email: ${contactError.message}`);
}

// AFTER (add OCR query first)
let contactEmail = null;
try {
  const ocrQuery = `
    SELECT Contact.Email
    FROM OpportunityContactRole
    WHERE OpportunityId = '${opportunityId}'
    AND IsPrimary = true
    AND Contact.Email != null
    LIMIT 1
  `;
  const ocrResult = await this.query(ocrQuery);
  if (ocrResult.records && ocrResult.records.length > 0) {
    contactEmail = ocrResult.records[0].Contact?.Email;
    if (contactEmail) {
      logger.info(`Found primary OCR email for billing: ${contactEmail}`);
    }
  }
} catch (ocrError) {
  logger.warn(`Could not query OpportunityContactRole: ${ocrError.message}`);
}

if (!contactEmail) {
  try {
    const contactQuery = `
      SELECT Id, Email FROM Contact
      WHERE AccountId = '${opportunity.AccountId}'
      AND Email != null
      LIMIT 1
    `;
    const contactResult = await this.query(contactQuery);
    if (contactResult.records && contactResult.records.length > 0) {
      contactEmail = contactResult.records[0].Email;
      logger.info(`Found contact email for billing: ${contactEmail}`);
    }
  } catch (contactError) {
    logger.warn(`Could not get contact email: ${contactError.message}`);
  }
}
```

## Test Cases

| Test | Input | Expected |
| --- | --- | --- |
| Primary OCR | Email_for_invoice__c blank, Account.Email__c blank, OCR primary with email | contactEmail = OCR email |
| OCR missing | No primary OCR email, Contact with email exists | contactEmail = Contact email |

## Test Requirements (Option C)

### Test File
- Path: `deployment/sf-qb-integration-final/tests/salesforce-api-ocr.test.js`

### Test Approach
Unit test `getOpportunityWithRelatedData` directly:
1. Create a `SalesforceAPI` instance.
2. `jest.spyOn(SalesforceAPI.prototype, 'getRecord')` to return:
   - Opportunity with `AccountId`
   - Account record for that `AccountId`
3. `jest.spyOn(SalesforceAPI.prototype, 'query')` with conditional returns:
   - OpportunityLineItem query → `{ records: [] }`
   - OCR query → records per test case
   - Contact query → records per test case
4. Call `getOpportunityWithRelatedData(opportunityId)`.
5. Assert `contactEmail` and (optionally) that the Contact query is skipped when OCR returns an email.

### Test Cases
| Test | OCR Query Returns | Contact Query Returns | Expected contactEmail |
|------|-------------------|----------------------|----------------------|
| OCR has primary with email | `[{Contact: {Email: "ocr@x.com"}}]` | (not called) | `"ocr@x.com"` |
| OCR empty, Contact has email | `[]` | `[{Email: "contact@x.com"}]` | `"contact@x.com"` |
| Both empty | `[]` | `[]` | `null` |
| OCR primary has no email | `[{Contact: {Email: null}}]` | `[{Email: "contact@x.com"}]` | `"contact@x.com"` |

### Command
```bash
cd deployment/sf-qb-integration-final && npm test
```

## Acceptance Criteria
- OCR IsPrimary email is preferred over Contact email.
- Existing Contact fallback remains intact.
- No changes to routes/api.js in this PR.

## NOT in This PR
- Email priority chain in routes/api.js (PR 2.1).
- ORDER BY Contact query (PR 2.3).
- Payment link changes (PR 2.5–2.7).

## Dependencies
- **After PR 2.3** (ORDER BY) or merge 2.2 + 2.3 into one PR to avoid touching the same block twice.
