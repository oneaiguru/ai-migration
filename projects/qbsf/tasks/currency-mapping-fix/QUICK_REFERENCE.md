# Quick Reference: Currency Mapping Fix

## Problem Statement
Integration uses `Product2.CurrencyIsoCode` (EUR) instead of `Opportunity.CurrencyIsoCode` (USD)

## The Fix
Replace all occurrences of:
```
Product2.CurrencyIsoCode  →  Opportunity.CurrencyIsoCode
```

## Files to Search
```bash
# Search across entire project
grep -r "Product2.CurrencyIsoCode" /Users/m/ai/projects/qbsf/

# Search in specific directories
grep -r "CurrencyIsoCode" /Users/m/ai/projects/qbsf/force-app/
grep -r "currencyCode" /Users/m/ai/projects/qbsf/deployment/
```

## Evidence (Screenshots)
- `images/photo_2026-01-26_13-13-50.jpg` - Product with EUR currency
- `images/photo_2026-01-26_13-14-18.jpg` - Opportunity with USD currency
- `images/photo_2026-01-26_13-14-19.jpg` - QB Log showing wrong EUR currency

## Test Case
1. Create Opportunity with USD currency
2. Add product (even if product default is EUR)
3. Trigger integration
4. Check QB Integration Log - should show USD (not EUR)
5. Verify invoice amount matches opportunity

## Related Issues
- QB Support confirmed: No Euro payments available
- Roman is frustrated: 3 weeks waiting for this one-field fix
- Deadline: Demo needed ASAP
