#!/usr/bin/env node
/**
 * Diagnostic script to query a QB invoice and see the full response
 * This helps us understand what QB is actually returning for InvoiceLink
 *
 * Usage: node diagnose-qb-invoice.js <invoiceId>
 * Example: node diagnose-qb-invoice.js 2431
 */

const axios = require('axios');

const MIDDLEWARE_URL = process.env.MIDDLEWARE_URL || 'https://sqint.atocomm.eu';
const API_KEY = process.env.MIDDLEWARE_API_KEY;

if (!API_KEY) {
  console.error('Error: Set MIDDLEWARE_API_KEY in your environment before running this script.');
  process.exit(1);
}

async function diagnoseInvoice(invoiceId) {
  console.log(`\n=== Diagnosing QB Invoice ${invoiceId} ===\n`);

  try {
    // We'll need to add a diagnostic endpoint to the middleware
    // For now, let's document what we need to check

    console.log('To diagnose this invoice, we need to:');
    console.log('1. Query QB API: GET /invoice/' + invoiceId + '?minorversion=65&include=invoiceLink');
    console.log('2. Check if response has Invoice.InvoiceLink field');
    console.log('3. Check Invoice.AllowOnlineCreditCardPayment');
    console.log('4. Check Invoice.AllowOnlineACHPayment');
    console.log('5. Check Invoice.BillEmail (required for payment links)');
    console.log('');
    console.log('Key fields to look for:');
    console.log('- InvoiceLink (the payment URL)');
    console.log('- AllowOnlineCreditCardPayment (should be true)');
    console.log('- AllowOnlineACHPayment (should be true)');
    console.log('- BillEmail.Address (customer email for payment)');
    console.log('- LinkedTxn (any related transactions)');

    // Test middleware health first
    console.log('\n--- Testing Middleware Health ---');
    const healthResponse = await axios.get(`${MIDDLEWARE_URL}/api/health`, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('Middleware status:', healthResponse.data.status);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get invoice ID from command line
const invoiceId = process.argv[2] || '2431';
diagnoseInvoice(invoiceId);
