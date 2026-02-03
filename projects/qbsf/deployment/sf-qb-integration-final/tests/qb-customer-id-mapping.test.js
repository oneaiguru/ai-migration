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
    CurrencyIsoCode: 'USD',
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
  billingEmail: null,
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

describe('legacy QB customer ID handling', () => {
  let mockGetOpportunityWithRelatedData;
  let mockUpdateOpportunityWithQBInvoiceId;
  let mockUpdateRecord;
  let mockFindOrCreateCustomer;
  let mockCreateInvoice;
  let mockGetInvoicePaymentLinkDetails;
  let mockFindInvoiceByOpportunityId;
  let mockGetCustomer;
  let mockGetExchangeRate;

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

    mockFindOrCreateCustomer = jest.fn();
    mockCreateInvoice = jest.fn().mockResolvedValue({ Invoice: { Id: 'QB-INV-1' } });
    mockGetInvoicePaymentLinkDetails = jest.fn().mockResolvedValue({
      link: null,
      reason: 'INVOICE_NO_BILLEMAIL',
      message: 'Invoice has no BillEmail - QB cannot generate payment link'
    });
    mockFindInvoiceByOpportunityId = jest.fn().mockResolvedValue(null);
    mockGetCustomer = jest.fn().mockResolvedValue({
      Customer: { Id: 'QB-CUST-LEGACY', CurrencyRef: { value: 'USD' } }
    });
    mockGetExchangeRate = jest.fn().mockResolvedValue(1);

    QuickBooksAPI.mockImplementation(() => ({
      findInvoiceByOpportunityId: mockFindInvoiceByOpportunityId,
      findOrCreateCustomer: mockFindOrCreateCustomer,
      createInvoice: mockCreateInvoice,
      getInvoicePaymentLinkDetails: mockGetInvoicePaymentLinkDetails,
      getCustomer: mockGetCustomer,
      getExchangeRate: mockGetExchangeRate
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes legacy string customer IDs into invoice mapping', async () => {
    mockFindOrCreateCustomer.mockResolvedValue('QB-CUST-LEGACY');

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CustomerRef.value).toBe('QB-CUST-LEGACY');
  });
});
