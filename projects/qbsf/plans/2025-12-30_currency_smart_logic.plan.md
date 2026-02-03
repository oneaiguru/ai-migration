# Plan: 2025-12-30 Smart Currency Logic (Auto Currency Handling)

## Metadata
- Task: Smart Currency Logic (Auto Currency Handling)
- Discovery: `projects/qbsf/tasks/task_currency_smart_logic.md`
- Related docs:
  - `projects/qbsf/docs/RELEASE_2025-12-29_DELIVERED_SOLUTION.md`
  - `projects/qbsf/docs/OPTION_A_DELIVERY_MANIFEST.md`
  - `projects/qbsf/docs/SESSION_2025-12-29_MULTI_CURRENCY_FIX_HANDOFF.md`
  - `projects/qbsf/CURRENCY_MISMATCH_INVESTIGATION.md`

## Decisions & Assumptions (Locked)
- Existing QB customer currency != Opportunity currency: convert amounts to existing customer currency and create invoice in that currency; do not create duplicate customer.
- New customers: continue using Opportunity currency.
- Update-invoice: apply the same conversion logic using existing invoice/customer currency. If currency or rate is unknown, return error (no update).
- FX source: QBO ExchangeRate endpoint; default URL:
  `GET /v3/company/<realmId>/exchangerate?sourcecurrencycode=<SRC>&targetcurrencycode=<TGT>&asofdate=YYYY-MM-DD&minorversion=65`
- Rounding: per line, 2 decimals. Compute UnitPrice in target currency, then Amount = round2(UnitPrice * Qty).
- Status codes:
  - `CURRENCY_MISMATCH_CONVERTED` = Warning (invoice created).
  - `FX_RATE_MISSING` = Error (block invoice/update).
  - Optional: `FX_RATE_API_ERROR` for API failures.
- Tests/acceptance scenarios (must add):
  1. Existing USD customer + EUR opp → invoice created in USD with converted amounts + warning.
  2. Existing EUR customer + EUR opp → no conversion.
  3. New customer + EUR opp → created in EUR (no conversion).
  4. FX rate missing → error and no invoice/update.
  5. Update-invoice uses invoice/customer currency and conversion if mismatch.

Additional assumptions to call out in implementation:
- Use invoice `TxnDate` (or today if missing) for `asofdate`.
- If existing customer/invoice currency cannot be determined, treat as `FX_RATE_MISSING` (block).
- Add `warningCode`/`warningMessage` to middleware success responses so Apex can mark Warning.

## Desired End State
- Middleware creates invoices in customer currency when it differs from Opportunity currency, converting line items using QBO ExchangeRate.
- Update-invoice path uses existing invoice/customer currency; mismatch converts line items; missing rate blocks update.
- Middleware returns warning code/message when conversion occurs; queueable maps to `QB_Sync_Status__c = Warning` and sets `QB_Error_Code__c`.
- New Jest tests cover conversion/missing FX scenarios; Apex test covers warning mapping.

### Key Discoveries
- Opportunity currency is pulled and used for customer creation + invoice mapping today: `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js:101-142`.
- `findOrCreateCustomer` returns only an ID (no currency info): `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js:359-491`.
- Invoice mapping uses line items verbatim with no conversion: `projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js:18-41`.
- Update-invoice path uses Opportunity currency without reconciling invoice/customer currency: `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js:370-429`.
- Queueable parses middleware response codes and sets status fields: `projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls:94-177`.
- Jest mocks assume `findOrCreateCustomer` returns a string ID: `projects/qbsf/deployment/sf-qb-integration-final/tests/quickbooks-customer-email-update.test.js:39-90`, `projects/qbsf/deployment/sf-qb-integration-final/tests/billing-email-trim.test.js:148-166`.

## What We're NOT Doing
- No duplicate-customer creation in the Opportunity currency.
- No changes to Salesforce object model or new custom fields.
- No FX caching or alternate FX providers.
- No changes to Option A delivery scope beyond smart currency logic.

## Implementation Approach
1. Extend QuickBooks API wrapper to surface existing customer currency and fetch FX rates via QBO ExchangeRate.
2. Add a small conversion helper to reprice line items using a single FX rate with per-line rounding.
3. Update create/update routes to detect mismatch, fetch FX rate, convert, and return warnings/errors.
4. Update Apex queueable to recognize warning codes and to parse error codes from non-200 responses.
5. Update Jest + Apex tests to cover the new currency scenarios.

## Phase 0: Confirm QBO ExchangeRate endpoint/response
### Overview
Confirm the exact response shape and rate field name from official QBO docs.
### Changes Required
- No repo changes. Record the confirmed response in the PR description or a short comment in the plan once validated.

Confirmed (2025-12-30) via Intuit API Reference > Exchangerate: response payloads use `ExchangeRate` objects with a `Rate` field; query responses return `QueryResponse.ExchangeRate[].Rate`, and direct exchangerate responses include `ExchangeRate.Rate`.

## Phase 1: QuickBooks API enhancements
### Overview
Return customer currency from `findOrCreateCustomer`, add `getCustomer`, and add `getExchangeRate`.
### Changes Required
1) `projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js`
   - Include `CurrencyRef` in customer queries.
   - Return `{ id, currency, isExisting }` instead of a string ID.
   - Add `getCustomer(customerId)` and `getExchangeRate(source, target, asOfDate)` helpers.
   - (Optional) allow `updateInvoice` to accept an existing invoice payload to avoid a second GET.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/src/services/quickbooks-api.js
@@
-  /**
-   * Finds or creates a customer in QuickBooks
-   * @param {Object} customerData - Customer data
-   * @returns {Promise<String>} - Customer ID
-   */
-  async findOrCreateCustomer(customerData) {
+  /**
+   * Finds or creates a customer in QuickBooks
+   * @param {Object} customerData - Customer data
+   * @returns {Promise<{id: String, currency: (String|null), isExisting: Boolean}>}
+   */
+  async findOrCreateCustomer(customerData) {
@@
-      const query = encodeURIComponent(
-        `SELECT Id, DisplayName, PrimaryEmailAddr, SyncToken FROM Customer WHERE DisplayName = '${escapedName}'`
-      );
+      const query = encodeURIComponent(
+        `SELECT Id, DisplayName, PrimaryEmailAddr, SyncToken, CurrencyRef FROM Customer WHERE DisplayName = '${escapedName}'`
+      );
@@
           if (queryResponse.QueryResponse.Customer && queryResponse.QueryResponse.Customer.length > 0) {
             const existingCustomer = queryResponse.QueryResponse.Customer[0];
             const customerId = existingCustomer.Id;
+            const customerCurrency = existingCustomer.CurrencyRef?.value || null;
@@
-          return customerId;
+          return { id: customerId, currency: customerCurrency, isExisting: true };
         }
@@
-        const emailQuery = encodeURIComponent(
-          `SELECT Id, DisplayName, PrimaryEmailAddr, SyncToken FROM Customer WHERE PrimaryEmailAddr.Address = '${email}'`
-        );
+        const emailQuery = encodeURIComponent(
+          `SELECT Id, DisplayName, PrimaryEmailAddr, SyncToken, CurrencyRef FROM Customer WHERE PrimaryEmailAddr.Address = '${email}'`
+        );
@@
           if (emailQueryResponse.QueryResponse.Customer && emailQueryResponse.QueryResponse.Customer.length > 0) {
             const existingCustomer = emailQueryResponse.QueryResponse.Customer[0];
             const customerId = existingCustomer.Id;
+            const customerCurrency = existingCustomer.CurrencyRef?.value || null;
@@
-            return customerId;
+            return { id: customerId, currency: customerCurrency, isExisting: true };
           }
         } catch (emailQueryError) {
@@
       const createResponse = await this.request('post', 'customer', customerData);
       const newCustomerId = createResponse.Customer.Id;
+      const newCustomerCurrency = customerData.CurrencyRef?.value || null;
@@
-      return newCustomerId;
+      return { id: newCustomerId, currency: newCustomerCurrency, isExisting: false };
     } catch (error) {
@@
   }
+
+  /**
+   * Gets a customer by ID
+   * @param {String} customerId - QuickBooks Customer ID
+   * @returns {Promise<Object>} - Customer data
+   */
+  async getCustomer(customerId) {
+    return this.request('get', `customer/${customerId}`);
+  }
+
+  /**
+   * Gets FX rate from QBO ExchangeRate endpoint
+   * @param {String} sourceCurrency - ISO currency code
+   * @param {String} targetCurrency - ISO currency code
+   * @param {String} asOfDate - YYYY-MM-DD
+   * @returns {Promise<Number|null>} - FX rate or null if missing
+   */
+  async getExchangeRate(sourceCurrency, targetCurrency, asOfDate) {
+    if (!sourceCurrency || !targetCurrency) {
+      return null;
+    }
+    if (sourceCurrency === targetCurrency) {
+      return 1;
+    }
+    const endpoint = `exchangerate?sourcecurrencycode=${sourceCurrency}&targetcurrencycode=${targetCurrency}&asofdate=${asOfDate}&minorversion=65`;
+    const response = await this.request('get', endpoint);
+    const ratePayload = response.ExchangeRate || response.exchangeRate;
+    const rateValue = ratePayload?.Rate || ratePayload?.rate || ratePayload?.ExchangeRate?.Rate || null;
+    return rateValue ? Number(rateValue) : null;
+  }
*** End Patch
PATCH
```

## Phase 2: Currency conversion helper
### Overview
Add a helper to convert product prices with per-line rounding.
### Changes Required
1) `projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js`
   - Add `roundToCurrency` helper and `convertProductsForCurrency`.
   - Export the new helper for use in routes.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/src/transforms/opportunity-to-invoice.js
@@
-/**
- * Maps Salesforce Opportunity data to QuickBooks Invoice structure
- * @param {Object} opportunity - The Salesforce Opportunity record
- * @param {Object} account - The related Salesforce Account record
- * @param {Array} products - The related Opportunity Products
- * @param {String} qbCustomerId - The QuickBooks Customer ID for this account
- * @param {String} billingEmail - Email address for BillEmail (required for payment links)
- * @param {String} currency - Currency code (ISO 4217, e.g., 'EUR', 'USD')
- * @returns {Object} - QuickBooks Invoice object ready for API submission
- */
+const roundToCurrency = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
+
+const convertProductsForCurrency = (products, fxRate) =>
+  products.map((product) => {
+    const qty = Number(product.Quantity) || 0;
+    const unitPrice = Number(product.UnitPrice) || 0;
+    const convertedUnitPrice = roundToCurrency(unitPrice * fxRate);
+    const convertedTotal = roundToCurrency(convertedUnitPrice * qty);
+    return {
+      ...product,
+      UnitPrice: convertedUnitPrice,
+      TotalPrice: convertedTotal
+    };
+  });
+
+/**
+ * Maps Salesforce Opportunity data to QuickBooks Invoice structure
+ * @param {Object} opportunity - The Salesforce Opportunity record
+ * @param {Object} account - The related Salesforce Account record
+ * @param {Array} products - The related Opportunity Products
+ * @param {String} qbCustomerId - The QuickBooks Customer ID for this account
+ * @param {String} billingEmail - Email address for BillEmail (required for payment links)
+ * @param {String} currency - Currency code (ISO 4217, e.g., 'EUR', 'USD')
+ * @returns {Object} - QuickBooks Invoice object ready for API submission
+ */
@@
 module.exports = {
-  mapOpportunityToInvoice
+  mapOpportunityToInvoice,
+  convertProductsForCurrency
 };
*** End Patch
PATCH
```

## Phase 3: Middleware routes updates
### Overview
Compute target currency, fetch FX rate, convert line items, and return warnings/errors.
### Changes Required
1) `projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js`
   - Import `convertProductsForCurrency`.
   - Create path: use `findOrCreateCustomer` result to select target currency and convert if needed.
   - Update path: fetch invoice currency (fallback to customer), convert if needed, error if missing rate.
   - Add `warningCode`/`warningMessage` in success responses when conversion occurs.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js
@@
-const { mapOpportunityToInvoice } = require('../transforms/opportunity-to-invoice');
+const { mapOpportunityToInvoice, convertProductsForCurrency } = require('../transforms/opportunity-to-invoice');
@@
-    // Get currency from Opportunity (default to USD if not set)
-    const currency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
-    logger.info(`Customer currency for ${opportunityData.account.Name}: ${currency}`);
+    // Get currency from Opportunity (default to USD if not set)
+    const sourceCurrency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
+    logger.info(`Opportunity currency for ${opportunityData.account.Name}: ${sourceCurrency}`);
@@
-    const qbCustomerId = await qbApi.findOrCreateCustomer(customerData);
+    const customerResult = await qbApi.findOrCreateCustomer(customerData);
+    const qbCustomerId = customerResult.id;
+    const customerCurrency = customerResult.currency || null;
+    const isExistingCustomer = customerResult.isExisting;
+
+    let targetCurrency = sourceCurrency;
+    if (isExistingCustomer) {
+      if (!customerCurrency) {
+        throw new AppError(`Existing customer ${qbCustomerId} is missing CurrencyRef`, 422, 'FX_RATE_MISSING');
+      }
+      targetCurrency = customerCurrency;
+    }
+
+    let fxRate = null;
+    let convertedProducts = opportunityData.products;
+    let warningCode = null;
+    let warningMessage = null;
+
+    if (sourceCurrency !== targetCurrency) {
+      const asOfDate = new Date().toISOString().split('T')[0];
+      try {
+        fxRate = await qbApi.getExchangeRate(sourceCurrency, targetCurrency, asOfDate);
+      } catch (fxError) {
+        throw new AppError(`FX rate API error: ${fxError.message}`, 502, 'FX_RATE_API_ERROR');
+      }
+      if (!fxRate) {
+        throw new AppError(`No FX rate for ${sourceCurrency} -> ${targetCurrency} as of ${asOfDate}`, 422, 'FX_RATE_MISSING');
+      }
+      convertedProducts = convertProductsForCurrency(opportunityData.products, fxRate);
+      warningCode = 'CURRENCY_MISMATCH_CONVERTED';
+      warningMessage = `Converted ${sourceCurrency} to ${targetCurrency} at ${fxRate} as of ${asOfDate}`;
+    }
@@
-      opportunityData.products,
+      convertedProducts,
       qbCustomerId,
       billingEmail,  // Pass billing email for BillEmail field
-      currency       // Pass currency for CurrencyRef field
+      targetCurrency // Pass currency for CurrencyRef field
     );
@@
-    res.json({
+    res.json({
       success: true,
       qbInvoiceId: qbInvoiceId,
       paymentLink: paymentLink,
       paymentLinkStatus: paymentLinkStatus,
       paymentLinkMessage: paymentLinkMessage,
+      ...(warningCode ? { warningCode, warningMessage } : {}),
+      ...(fxRate ? { fxRate, sourceCurrency, targetCurrency } : {}),
       message: 'Invoice created successfully in QuickBooks'
     });
@@
-    const currency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
+    const sourceCurrency = opportunityData.opportunity.CurrencyIsoCode || 'USD';
+
+    const invoiceResponse = await qbApi.getInvoice(qbInvoiceId);
+    const invoiceRecord = invoiceResponse.Invoice || invoiceResponse.QueryResponse?.Invoice?.[0];
+    if (!invoiceRecord) {
+      throw new AppError(`Invoice ${qbInvoiceId} not found in QuickBooks`, 404, 'INVOICE_NOT_FOUND');
+    }
+
+    let targetCurrency = invoiceRecord.CurrencyRef?.value || null;
+    const customerId = invoiceRecord.CustomerRef?.value || null;
+    if (!targetCurrency && customerId) {
+      const customerResponse = await qbApi.getCustomer(customerId);
+      const customerRecord = customerResponse.Customer || customerResponse.QueryResponse?.Customer?.[0];
+      targetCurrency = customerRecord?.CurrencyRef?.value || null;
+    }
+    if (!targetCurrency) {
+      throw new AppError(`Unable to determine currency for invoice ${qbInvoiceId}`, 422, 'FX_RATE_MISSING');
+    }
+
+    let fxRate = null;
+    let convertedProducts = opportunityData.products;
+    let warningCode = null;
+    let warningMessage = null;
+
+    if (sourceCurrency !== targetCurrency) {
+      const asOfDate = invoiceRecord.TxnDate || new Date().toISOString().split('T')[0];
+      try {
+        fxRate = await qbApi.getExchangeRate(sourceCurrency, targetCurrency, asOfDate);
+      } catch (fxError) {
+        throw new AppError(`FX rate API error: ${fxError.message}`, 502, 'FX_RATE_API_ERROR');
+      }
+      if (!fxRate) {
+        throw new AppError(`No FX rate for ${sourceCurrency} -> ${targetCurrency} as of ${asOfDate}`, 422, 'FX_RATE_MISSING');
+      }
+      convertedProducts = convertProductsForCurrency(opportunityData.products, fxRate);
+      warningCode = 'CURRENCY_MISMATCH_CONVERTED';
+      warningMessage = `Converted ${sourceCurrency} to ${targetCurrency} at ${fxRate} as of ${asOfDate}`;
+    }
@@
-      opportunityData.products,
+      convertedProducts,
       placeholderCustomerId,  // Not used - existing CustomerRef preserved in updateInvoice
       billingEmail,
-      currency
+      targetCurrency
     );
@@
-    const updatedInvoice = await qbApi.updateInvoice(qbInvoiceId, {
+    const updatedInvoice = await qbApi.updateInvoice(qbInvoiceId, {
       ...(lineItems.length ? { Line: lineItems } : {}),
       CustomerMemo: invoiceData.CustomerMemo,
       ...(invoiceData.BillEmail ? { BillEmail: invoiceData.BillEmail } : {}) // avoid clearing existing BillEmail when SF has none
-    });
+    });
@@
-    res.json({
+    res.json({
       success: true,
       qbInvoiceId: qbInvoiceId,
       paymentLink: paymentLink,
       paymentLinkStatus: paymentLinkStatus,
       paymentLinkMessage: paymentLinkMessage,
+      ...(warningCode ? { warningCode, warningMessage } : {}),
+      ...(fxRate ? { fxRate, sourceCurrency, targetCurrency } : {}),
       message: 'Invoice updated successfully in QuickBooks'
     });
*** End Patch
PATCH
```

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/src/routes/api.js
@@
-      CurrencyRef: {
-        value: currency
-      },
+      CurrencyRef: {
+        value: sourceCurrency
+      },
*** End Patch
PATCH
```

## Phase 4: Error response alignment + Apex warning handling
### Overview
Ensure new FX errors and warnings reach Salesforce with the correct status codes.
### Changes Required
1) `projects/qbsf/deployment/sf-qb-integration-final/src/middleware/error-handler.js`
   - Add top-level `errorCode` and `errorMessage` for compatibility (keep nested `error` object).

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/src/middleware/error-handler.js
@@
   const errorResponse = {
     success: false,
-    error: {
-      message: err.message || 'An unexpected error occurred',
-      code: err.code || 'INTERNAL_SERVER_ERROR'
-    }
+    error: {
+      message: err.message || 'An unexpected error occurred',
+      code: err.code || 'INTERNAL_SERVER_ERROR'
+    },
+    errorCode: err.code || 'INTERNAL_SERVER_ERROR',
+    errorMessage: err.message || 'An unexpected error occurred'
  };
*** End Patch
PATCH
```

2) `projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls`
   - Parse `warningCode`/`warningMessage` on success and set `QB_Sync_Status__c = Warning`.
   - When status != 200/201/401, try to parse JSON body for `errorCode` or nested error message and use it instead of `HTTP_ERROR`.
   - When success=false, allow `error` to be an object and read `errorMessage` if present.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
@@
                     if (responseMap.containsKey('success') && (Boolean) responseMap.get('success')) {
                         String qbInvoiceId = (String) responseMap.get('qbInvoiceId');
                         String paymentLink = (String) responseMap.get('paymentLink');
                         String paymentStatus = (String) responseMap.get('paymentLinkStatus');
                         String paymentMessage = (String) responseMap.get('paymentLinkMessage');
+                        String warningCode = (String) responseMap.get('warningCode');
+                        String warningMessage = (String) responseMap.get('warningMessage');
+
+                        Boolean hasPaymentWarning = String.isNotBlank(paymentStatus) && paymentStatus != 'SUCCESS';
+                        Boolean hasWarningCode = String.isNotBlank(warningCode);
 
-                        String finalStatus = (String.isBlank(paymentStatus) || paymentStatus == 'SUCCESS')
+                        String finalStatus = (!hasPaymentWarning && !hasWarningCode)
                             ? 'Success'
                             : 'Warning';
                         Boolean hasPaymentLink = String.isNotBlank(paymentLink);
-                        Opportunity finalUpdate = buildStatusUpdate(
-                            opp.Id, finalStatus, null, null, correlationId
-                        );
+                        String combinedWarningMessage = null;
+                        if (String.isNotBlank(warningMessage) && String.isNotBlank(paymentMessage)) {
+                            combinedWarningMessage = warningMessage + ' | ' + paymentMessage;
+                        } else if (String.isNotBlank(warningMessage)) {
+                            combinedWarningMessage = warningMessage;
+                        } else if (String.isNotBlank(paymentMessage)) {
+                            combinedWarningMessage = paymentMessage;
+                        }
+                        Opportunity finalUpdate = buildStatusUpdate(
+                            opp.Id,
+                            finalStatus,
+                            hasWarningCode ? warningCode : null,
+                            combinedWarningMessage,
+                            correlationId
+                        );
                         finalUpdate.QB_Invoice_ID__c = qbInvoiceId;
                         if (hasPaymentLink) {
                             finalUpdate.QB_Payment_Link__c = paymentLink;
                         }
                         finalUpdate.QB_Payment_Link_Status__c = paymentStatus;
-                        finalUpdate.QB_Error_Message__c = hasPaymentLink ? null : paymentMessage;
+                        if (hasPaymentLink) {
+                            finalUpdate.QB_Error_Message__c = combinedWarningMessage;
+                        }
                         finalUpdate.QB_Last_Sync_Date__c = DateTime.now();
                         oppsToUpdate.add(finalUpdate);
@@
                 } else {
-                    String errorMsg = 'HTTP Error: ' + statusCode + ' ' + response.getStatus() + '. Body: ' + response.getBody();
-                    oppsToUpdate.add(buildStatusUpdate(
-                        opp.Id, 'Error', 'HTTP_ERROR', errorMsg, correlationId
-                    ));
+                    String errorMsg = 'HTTP Error: ' + statusCode + ' ' + response.getStatus() + '. Body: ' + response.getBody();
+                    String parsedErrorCode = null;
+                    String parsedErrorMessage = null;
+                    try {
+                        Map<String, Object> bodyMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
+                        if (bodyMap != null) {
+                            if (bodyMap.containsKey('errorCode')) {
+                                parsedErrorCode = (String) bodyMap.get('errorCode');
+                            }
+                            if (bodyMap.containsKey('error')) {
+                                Object errorObj = bodyMap.get('error');
+                                if (errorObj instanceof String) {
+                                    parsedErrorMessage = (String) errorObj;
+                                } else if (errorObj instanceof Map<String, Object>) {
+                                    parsedErrorMessage = (String) ((Map<String, Object>) errorObj).get('message');
+                                    if (String.isBlank(parsedErrorCode)) {
+                                        parsedErrorCode = (String) ((Map<String, Object>) errorObj).get('code');
+                                    }
+                                }
+                            }
+                            if (bodyMap.containsKey('errorMessage') && String.isBlank(parsedErrorMessage)) {
+                                parsedErrorMessage = (String) bodyMap.get('errorMessage');
+                            }
+                        }
+                    } catch (Exception ignored) {}
+
+                    oppsToUpdate.add(buildStatusUpdate(
+                        opp.Id,
+                        'Error',
+                        String.isNotBlank(parsedErrorCode) ? parsedErrorCode : 'HTTP_ERROR',
+                        String.isNotBlank(parsedErrorMessage) ? parsedErrorMessage : errorMsg,
+                        correlationId
+                    ));
                     errorLogsToInsert.add(buildErrorLog(opp.Id, 'Integration Error', errorMsg));
                 }
*** End Patch
PATCH
```

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueable.cls
@@
-                    } else {
-                        String errorMessage = responseMap.containsKey('error')
-                            ? (String) responseMap.get('error')
-                            : 'Unknown error from integration service';
-                        String errorCode = responseMap.containsKey('errorCode')
-                            ? (String) responseMap.get('errorCode')
-                            : 'INTEGRATION_ERROR';
+                    } else {
+                        String errorMessage = null;
+                        if (responseMap.containsKey('error')) {
+                            Object errorObj = responseMap.get('error');
+                            if (errorObj instanceof String) {
+                                errorMessage = (String) errorObj;
+                            } else if (errorObj instanceof Map<String, Object>) {
+                                errorMessage = (String) ((Map<String, Object>) errorObj).get('message');
+                            }
+                        }
+                        if (String.isBlank(errorMessage) && responseMap.containsKey('errorMessage')) {
+                            errorMessage = (String) responseMap.get('errorMessage');
+                        }
+                        if (String.isBlank(errorMessage)) {
+                            errorMessage = 'Unknown error from integration service';
+                        }
+
+                        String errorCode = responseMap.containsKey('errorCode')
+                            ? (String) responseMap.get('errorCode')
+                            : 'INTEGRATION_ERROR';
*** End Patch
PATCH
```

## Phase 5: Tests
### Overview
Update existing tests for new return types and add coverage for FX conversion and warning behavior.
### Changes Required
1) `projects/qbsf/deployment/sf-qb-integration-final/tests/quickbooks-customer-email-update.test.js`
   - Expect `findOrCreateCustomer` to return `{ id, currency, isExisting }`.
   - Assert `CurrencyRef` is included in the query.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/tests/quickbooks-customer-email-update.test.js
@@
       if (method === 'get' && endpoint.startsWith('query?query=')) {
         const soql = decodeURIComponent(endpoint.replace('query?query=', ''));
         expect(soql).toContain('PrimaryEmailAddr');
         expect(soql).toContain('SyncToken');
+        expect(soql).toContain('CurrencyRef');
@@
-    const customerId = await api.findOrCreateCustomer({
+    const customerResult = await api.findOrCreateCustomer({
       DisplayName: 'Test Account',
       PrimaryEmailAddr: { Address: ' new@x.com ' }
     });
 
-    expect(customerId).toBe('CUST-1');
+    expect(customerResult.id).toBe('CUST-1');
@@
-    const customerId = await api.findOrCreateCustomer({
+    const customerResult = await api.findOrCreateCustomer({
       DisplayName: 'Test Account',
       PrimaryEmailAddr: { Address: 'same@x.com' }
     });
 
-    expect(customerId).toBe('CUST-1');
+    expect(customerResult.id).toBe('CUST-1');
@@
-    const customerId = await api.findOrCreateCustomer({
+    const customerResult = await api.findOrCreateCustomer({
       DisplayName: 'Test Account'
     });
 
-    expect(customerId).toBe('CUST-1');
+    expect(customerResult.id).toBe('CUST-1');
*** End Patch
PATCH
```

2) `projects/qbsf/deployment/sf-qb-integration-final/tests/billing-email-trim.test.js`
   - Update `findOrCreateCustomer` mock to return `{ id, currency, isExisting }`.
   - Add no-op `getExchangeRate` + `getInvoice` mocks to avoid test failures if called.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/deployment/sf-qb-integration-final/tests/billing-email-trim.test.js
@@
-    mockFindOrCreateCustomer = jest.fn().mockResolvedValue('QB-CUST-1');
+    mockFindOrCreateCustomer = jest.fn().mockResolvedValue({
+      id: 'QB-CUST-1',
+      currency: 'USD',
+      isExisting: false
+    });
@@
     mockUpdateInvoice = jest.fn().mockResolvedValue({ Id: 'QB-INV-1' });
     mockGetInvoicePaymentLink = jest.fn().mockResolvedValue(null);
+    const mockGetExchangeRate = jest.fn().mockResolvedValue(1);
+    const mockGetInvoice = jest.fn().mockResolvedValue({ Invoice: { Id: 'QB-INV-1', CurrencyRef: { value: 'USD' } } });
 
     QuickBooksAPI.mockImplementation(() => ({
       findInvoiceByOpportunityId: mockFindInvoiceByOpportunityId,
       findOrCreateCustomer: mockFindOrCreateCustomer,
       createInvoice: mockCreateInvoice,
       getInvoicePaymentLinkDetails: mockGetInvoicePaymentLinkDetails,
       updateInvoice: mockUpdateInvoice,
-      getInvoicePaymentLink: mockGetInvoicePaymentLink
+      getInvoicePaymentLink: mockGetInvoicePaymentLink,
+      getExchangeRate: mockGetExchangeRate,
+      getInvoice: mockGetInvoice
     }));
*** End Patch
PATCH
```

3) Add new currency conversion tests:
`projects/qbsf/deployment/sf-qb-integration-final/tests/currency-smart-logic.test.js`

```commands
cat <<'EOF' > projects/qbsf/deployment/sf-qb-integration-final/tests/currency-smart-logic.test.js
jest.mock('../src/services/salesforce-api');
jest.mock('../src/services/quickbooks-api');

const apiRoutes = require('../src/routes/api');
const SalesforceAPI = require('../src/services/salesforce-api');
const QuickBooksAPI = require('../src/services/quickbooks-api');

const baseOpportunityData = {
  opportunity: {
    Id: '006000000000001',
    Name: 'Test Opportunity',
    CloseDate: '2025-12-31',
    Opportunity_Number__c: 'OPP-1',
    CurrencyIsoCode: 'EUR',
    Description: 'Test description'
  },
  account: {
    Name: 'Test Account',
    Phone: '555-0000',
    BillingStreet: '123 Main St',
    BillingCity: 'Riga',
    BillingState: 'LV',
    BillingPostalCode: 'LV-1000',
    BillingCountry: 'Latvia',
    Email__c: ''
  },
  products: [
    {
      TotalPrice: 100,
      Quantity: 1,
      UnitPrice: 100,
      Product2: {
        QB_Item_ID__c: 'QB-ITEM-1',
        Name: 'Test Product',
        Description: 'Test product description'
      }
    }
  ],
  contactEmail: '',
  billingEmail: 'billing@example.com',
  emailSource: 'NONE'
};

const callOpportunityToInvoice = () =>
  new Promise((resolve, reject) => {
    const req = {
      method: 'POST',
      url: '/opportunity-to-invoice',
      headers: { 'x-api-key': 'test-key' },
      body: {
        opportunityId: '006000000000001',
        salesforceInstance: 'https://example.my.salesforce.com',
        quickbooksRealm: '1234567890'
      }
    };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ status: this.statusCode, body: payload });
      }
    };

    apiRoutes.handle(req, res, (error) => {
      if (error) {
        reject(error);
      }
    });
  });

const callUpdateInvoice = () =>
  new Promise((resolve, reject) => {
    const req = {
      method: 'POST',
      url: '/update-invoice',
      headers: { 'x-api-key': 'test-key' },
      body: {
        opportunityId: '006000000000001',
        qbInvoiceId: 'QB-INV-1',
        salesforceInstance: 'https://example.my.salesforce.com',
        quickbooksRealm: '1234567890'
      }
    };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        resolve({ status: this.statusCode, body: payload });
      }
    };

    apiRoutes.handle(req, res, (error) => {
      if (error) {
        reject(error);
      }
    });
  });

describe('smart currency logic', () => {
  let mockGetOpportunityWithRelatedData;
  let mockFindInvoiceByOpportunityId;
  let mockFindOrCreateCustomer;
  let mockCreateInvoice;
  let mockGetExchangeRate;
  let mockGetInvoice;
  let mockGetCustomer;
  let mockUpdateInvoice;
  let mockUpdateOpportunityWithQBInvoiceId;
  let mockUpdateRecord;
  let mockGetInvoicePaymentLinkDetails;

  beforeEach(() => {
    process.env.API_KEY = 'test-key';

    mockGetOpportunityWithRelatedData = jest.fn().mockResolvedValue(baseOpportunityData);
    mockUpdateOpportunityWithQBInvoiceId = jest.fn().mockResolvedValue(undefined);
    mockUpdateRecord = jest.fn().mockResolvedValue(undefined);

    SalesforceAPI.mockImplementation(() => ({
      getOpportunityWithRelatedData: mockGetOpportunityWithRelatedData,
      updateOpportunityWithQBInvoiceId: mockUpdateOpportunityWithQBInvoiceId,
      updateRecord: mockUpdateRecord
    }));

    mockFindInvoiceByOpportunityId = jest.fn().mockResolvedValue(null);
    mockFindOrCreateCustomer = jest.fn();
    mockCreateInvoice = jest.fn().mockResolvedValue({ Invoice: { Id: 'QB-INV-1' } });
    mockGetExchangeRate = jest.fn();
    mockGetInvoice = jest.fn().mockResolvedValue({
      Invoice: {
        Id: 'QB-INV-1',
        CurrencyRef: { value: 'USD' },
        CustomerRef: { value: 'QB-CUST-1' },
        TxnDate: '2025-12-30'
      }
    });
    mockGetCustomer = jest.fn().mockResolvedValue({
      Customer: { Id: 'QB-CUST-1', CurrencyRef: { value: 'USD' } }
    });
    mockUpdateInvoice = jest.fn().mockResolvedValue({ Id: 'QB-INV-1' });
    mockGetInvoicePaymentLinkDetails = jest.fn().mockResolvedValue({
      link: null,
      reason: 'INVOICE_NO_BILLEMAIL',
      message: 'Invoice has no BillEmail - QB cannot generate payment link'
    });

    QuickBooksAPI.mockImplementation(() => ({
      findInvoiceByOpportunityId: mockFindInvoiceByOpportunityId,
      findOrCreateCustomer: mockFindOrCreateCustomer,
      createInvoice: mockCreateInvoice,
      getExchangeRate: mockGetExchangeRate,
      getInvoice: mockGetInvoice,
      getCustomer: mockGetCustomer,
      updateInvoice: mockUpdateInvoice,
      getInvoicePaymentLinkDetails: mockGetInvoicePaymentLinkDetails
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('converts when existing customer currency differs', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'USD', isExisting: true });
    mockGetExchangeRate.mockResolvedValue(1.1);

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(response.body.warningCode).toBe('CURRENCY_MISMATCH_CONVERTED');
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CurrencyRef.value).toBe('USD');
    expect(invoicePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(110);
    expect(invoicePayload.Line[0].Amount).toBe(110);
  });

  it('does not convert when customer currency matches', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'EUR', isExisting: true });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(mockGetExchangeRate).not.toHaveBeenCalled();
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CurrencyRef.value).toBe('EUR');
    expect(invoicePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(100);
  });

  it('does not convert for new customer in opportunity currency', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'EUR', isExisting: false });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(mockGetExchangeRate).not.toHaveBeenCalled();
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CurrencyRef.value).toBe('EUR');
  });

  it('blocks when FX rate missing', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'USD', isExisting: true });
    mockGetExchangeRate.mockResolvedValue(null);

    await expect(callOpportunityToInvoice()).rejects.toMatchObject({
      code: 'FX_RATE_MISSING',
      statusCode: 422
    });
    expect(mockCreateInvoice).not.toHaveBeenCalled();
  });

  it('converts on update-invoice when invoice currency differs', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'EUR', isExisting: false });
    mockGetExchangeRate.mockResolvedValue(1.1);

    const response = await callUpdateInvoice();

    expect(response.status).toBe(200);
    expect(response.body.warningCode).toBe('CURRENCY_MISMATCH_CONVERTED');
    const updatePayload = mockUpdateInvoice.mock.calls[0][1];
    expect(updatePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(110);
    expect(updatePayload.Line[0].Amount).toBe(110);
  });
});
EOF
```

4) `projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls`
   - Add mock/coverage for warning code mapping.

```commands
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: projects/qbsf/force-app/main/default/classes/QBInvoiceIntegrationQueueableTest.cls
@@
     @isTest
     static void testFailedHttpResponse() {
@@
     }
+
+    @isTest
+    static void testCurrencyWarningSetsStatus() {
+        QBInvoiceIntegrationQueueable.allowTestCallouts = true;
+        Test.setMock(HttpCalloutMock.class, new WarningCurrencyMock());
+        Opportunity testOpp = [SELECT Id FROM Opportunity WHERE Name = 'Test Opportunity' LIMIT 1];
+
+        Test.startTest();
+        QBInvoiceIntegrationQueueable queueable = new QBInvoiceIntegrationQueueable(new List<Opportunity>{testOpp});
+        System.enqueueJob(queueable);
+        Test.stopTest();
+        QBInvoiceIntegrationQueueable.allowTestCallouts = false;
+
+        Opportunity updatedOpp = [
+            SELECT QB_Sync_Status__c, QB_Error_Code__c, QB_Error_Message__c
+            FROM Opportunity
+            WHERE Id = :testOpp.Id
+        ];
+        System.assertEquals('Warning', updatedOpp.QB_Sync_Status__c);
+        System.assertEquals('CURRENCY_MISMATCH_CONVERTED', updatedOpp.QB_Error_Code__c);
+        System.assert(updatedOpp.QB_Error_Message__c.contains('Converted'));
+    }
@@
     public class WarningPaymentLinkMock implements HttpCalloutMock {
@@
     }
+
+    public class WarningCurrencyMock implements HttpCalloutMock {
+        public HTTPResponse respond(HTTPRequest req) {
+            HttpResponse res = new HttpResponse();
+            res.setStatusCode(200);
+            res.setBody('{"success": true, "qbInvoiceId": "INV-WARN", "paymentLink": "https://example.com/pay", "paymentLinkStatus": "SUCCESS", "paymentLinkMessage": null, "warningCode": "CURRENCY_MISMATCH_CONVERTED", "warningMessage": "Converted EUR to USD"}');
+            return res;
+        }
+    }
*** End Patch
PATCH
```

## Tests & Validation
- Node middleware tests:
  - `cd projects/qbsf/deployment/sf-qb-integration-final && npm test`
- Apex queueable tests:
  - `sf apex run test --tests QBInvoiceIntegrationQueueableTest --synchronous --target-org myorg`

## Rollback
- Code rollback: `git restore <files>` or revert the commit that introduces currency conversion.
- No data migrations involved; only re-run middleware with prior code.

## Handoff
- Update `projects/qbsf/PROGRESS.md` with ✅ date, summary, and tests run.
- Reference this plan file in the handoff entry.
