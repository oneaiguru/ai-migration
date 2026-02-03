#!/usr/bin/env node
/**
 * Lightweight guard to prevent unsupported fields in QuickBooks queries.
 * Fails if we include forbidden fields like CurrencyRef in Item/Customer SELECTs.
 */
const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, '..', 'src', 'services', 'quickbooks-api.js');

const content = fs.readFileSync(TARGET_FILE, 'utf8');

const forbiddenPatterns = [
  {
    description: 'CurrencyRef in Item query',
    regex: /SELECT[^;]*CurrencyRef[^;]*FROM\s+Item/i
  },
  {
    description: 'CurrencyRef in Customer query',
    regex: /SELECT[^;]*CurrencyRef[^;]*FROM\s+Customer/i
  }
];

const failures = forbiddenPatterns
  .map((rule) => ({
    rule: rule.description,
    matched: rule.regex.test(content)
  }))
  .filter((r) => r.matched);

if (failures.length) {
  console.error('QBO query lint failed: forbidden fields detected:');
  failures.forEach((f) => console.error(`- ${f.rule}`));
  process.exit(1);
}

console.log('QBO query lint passed: no forbidden fields in queries.');
