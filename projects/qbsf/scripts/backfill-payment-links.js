const SalesforceAPI = require('../deployment/sf-qb-integration-final/src/services/salesforce-api');
const QuickBooksAPI = require('../deployment/sf-qb-integration-final/src/services/quickbooks-api');

function escapeQuickBooksQueryValue(value) {
  return String(value).replace(/'/g, "\\'");
}

function isQuickBooksInvoiceNotFoundMessage(message) {
  if (!message) {
    return false;
  }

  const normalized = String(message).toLowerCase();
  return normalized.includes('resource not found') && normalized.includes('invoice/');
}

async function resolveInvoiceByDocNumberForOpportunity(qbApi, opportunityId, docNumber) {
  const escapedDocNumber = escapeQuickBooksQueryValue(docNumber);
  const query = `SELECT Id, DocNumber FROM Invoice WHERE DocNumber = '${escapedDocNumber}' AND PrivateNote LIKE '%SF_OPP:${opportunityId}%' MAXRESULTS 1`;
  const response = await qbApi.request('get', `query?query=${encodeURIComponent(query)}`);
  return response.QueryResponse?.Invoice?.[0] || null;
}

function printUsage() {
  // eslint-disable-next-line no-console
  console.log(`
Backfill QuickBooks payment links into Salesforce Opportunities.

Usage:
  node projects/qbsf/scripts/backfill-payment-links.js [--dry-run] [--limit N] [--sleep-ms MS]

Required env vars:
  SF_INSTANCE_URL   Salesforce instance URL (e.g. https://xxx.my.salesforce.com)
  QB_REALM_ID       QuickBooks company/realm id

Options:
  --dry-run         Do not update Salesforce; only print what would change
  --limit N         Limit number of Opportunities processed
  --sleep-ms MS     Sleep between records (default: 500)
  -h, --help        Show this help
`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    limit: null,
    sleepMs: 500,
    help: false
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--limit') {
      const raw = argv[i + 1];
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`Invalid --limit value: ${raw}`);
      }
      options.limit = parsed;
      i += 1;
      continue;
    }

    if (arg === '--sleep-ms') {
      const raw = argv[i + 1];
      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Invalid --sleep-ms value: ${raw}`);
      }
      options.sleepMs = parsed;
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function backfillPaymentLinks(options) {
  if (!process.env.SF_INSTANCE_URL) {
    throw new Error('Missing required env var: SF_INSTANCE_URL');
  }
  if (!process.env.QB_REALM_ID) {
    throw new Error('Missing required env var: QB_REALM_ID');
  }

  const sfApi = new SalesforceAPI(process.env.SF_INSTANCE_URL);
  const qbApi = new QuickBooksAPI(process.env.QB_REALM_ID);

  const query = `
    SELECT Id, QB_Invoice_ID__c, QB_Payment_Link__c
    FROM Opportunity
    WHERE QB_Invoice_ID__c != null
    AND QB_Payment_Link__c = null
    AND (QB_Payment_Link_Status__c = null OR QB_Payment_Link_Status__c != 'QB_PAYMENTS_DISABLED')
    ${options.limit ? `LIMIT ${options.limit}` : ''}
  `;

  const result = await sfApi.query(query);
  // eslint-disable-next-line no-console
  console.log(
    `Found ${result.records.length} opportunities to backfill${options.dryRun ? ' (dry-run)' : ''}`
  );

  for (const opp of result.records) {
    try {
      let invoiceIdForLookup = opp.QB_Invoice_ID__c;
      let linkResult = await qbApi.getInvoicePaymentLinkDetails(invoiceIdForLookup);

      let resolvedInvoice = null;
      if (
        linkResult.reason === 'API_ERROR' &&
        isQuickBooksInvoiceNotFoundMessage(linkResult.message)
      ) {
        try {
          resolvedInvoice = await resolveInvoiceByDocNumberForOpportunity(
            qbApi,
            opp.Id,
            opp.QB_Invoice_ID__c
          );
          if (resolvedInvoice?.Id && resolvedInvoice.Id !== invoiceIdForLookup) {
            invoiceIdForLookup = resolvedInvoice.Id;
            linkResult = await qbApi.getInvoicePaymentLinkDetails(invoiceIdForLookup);
          }
        } catch (resolveError) {
          // Keep the original linkResult; resolution is best-effort.
        }
      }
      const paymentLink = linkResult.link || null;

      const updatePayload = {
        QB_Payment_Link__c: paymentLink,
        QB_Payment_Link_Status__c: linkResult.reason,
        QB_Error_Message__c: paymentLink ? null : linkResult.message,
        ...(resolvedInvoice?.Id && resolvedInvoice.Id !== opp.QB_Invoice_ID__c
          ? {
              QB_Invoice_ID__c: resolvedInvoice.Id,
              QB_Invoice_Number__c: resolvedInvoice.DocNumber || opp.QB_Invoice_ID__c
            }
          : {})
      };

      if (options.dryRun) {
        // eslint-disable-next-line no-console
        console.log(`${opp.Id}: would set ${linkResult.reason}`);
        // eslint-disable-next-line no-console
        console.log(updatePayload);
      } else {
        await sfApi.updateRecord('Opportunity', opp.Id, updatePayload);
        // eslint-disable-next-line no-console
        console.log(`${opp.Id}: ${linkResult.reason}`);
      }

      await new Promise((resolve) => setTimeout(resolve, options.sleepMs));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`${opp.Id}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    const options = parseArgs(process.argv);
    if (options.help) {
      printUsage();
      return;
    }

    await backfillPaymentLinks(options);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    printUsage();
    process.exitCode = 1;
  }
}

main();
