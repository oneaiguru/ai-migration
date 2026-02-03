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

const buildOpportunityData = ({ billingEmail, emailSource, oppEmail, accountEmail, contactEmail }) => ({
  ...baseOpportunityData,
  opportunity: {
    ...baseOpportunityData.opportunity,
    Email_for_invoice__c: oppEmail
  },
  account: {
    ...baseOpportunityData.account,
    Email__c: accountEmail
  },
  contactEmail,
  billingEmail,
  emailSource
});

const callOpportunityToInvoice = () =>
  new Promise((resolve, reject) => {
    const req = {
      method: 'POST',
      url: '/opportunity-to-invoice',
      headers: {
        'x-api-key': 'test-key'
      },
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
      headers: {
        'x-api-key': 'test-key'
      },
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

describe('billing email trimming and priority', () => {
  let mockGetOpportunityWithRelatedData;
  let mockUpdateOpportunityWithQBInvoiceId;
  let mockUpdateRecord;
  let mockFindOrCreateCustomer;
  let mockCreateInvoice;
  let mockGetInvoicePaymentLinkDetails;
  let mockFindInvoiceByOpportunityId;
  let mockUpdateInvoice;
  let mockGetInvoicePaymentLink;

  beforeEach(() => {
    process.env.API_KEY = 'test-key';

    mockGetOpportunityWithRelatedData = jest.fn();
    mockUpdateOpportunityWithQBInvoiceId = jest.fn().mockResolvedValue(undefined);
    mockUpdateRecord = jest.fn().mockResolvedValue(undefined);

    SalesforceAPI.mockImplementation(() => ({
      getOpportunityWithRelatedData: mockGetOpportunityWithRelatedData,
      updateOpportunityWithQBInvoiceId: mockUpdateOpportunityWithQBInvoiceId,
      updateRecord: mockUpdateRecord
    }));

    mockFindOrCreateCustomer = jest.fn().mockResolvedValue({
      id: 'QB-CUST-1',
      currency: 'USD',
      isExisting: false
    });
    mockCreateInvoice = jest.fn().mockResolvedValue({ Invoice: { Id: 'QB-INV-1' } });
    mockGetInvoicePaymentLinkDetails = jest.fn().mockResolvedValue({
      link: null,
      reason: 'INVOICE_NO_BILLEMAIL',
      message: 'Invoice has no BillEmail - QB cannot generate payment link'
    });
    mockFindInvoiceByOpportunityId = jest.fn().mockResolvedValue(null);
    mockUpdateInvoice = jest.fn().mockResolvedValue({ Id: 'QB-INV-1' });
    mockGetInvoicePaymentLink = jest.fn().mockResolvedValue(null);
    const mockGetExchangeRate = jest.fn().mockResolvedValue(1);
    const mockGetInvoice = jest.fn().mockResolvedValue({ Invoice: { Id: 'QB-INV-1', CurrencyRef: { value: 'USD' } } });

    QuickBooksAPI.mockImplementation(() => ({
      findInvoiceByOpportunityId: mockFindInvoiceByOpportunityId,
      findOrCreateCustomer: mockFindOrCreateCustomer,
      createInvoice: mockCreateInvoice,
      getInvoicePaymentLinkDetails: mockGetInvoicePaymentLinkDetails,
      updateInvoice: mockUpdateInvoice,
      getInvoicePaymentLink: mockGetInvoicePaymentLink,
      getExchangeRate: mockGetExchangeRate,
      getInvoice: mockGetInvoice
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses billingEmail from getOpportunityWithRelatedData and trims it', async () => {
    mockGetOpportunityWithRelatedData.mockResolvedValue(
      buildOpportunityData({
        billingEmail: '  test@x.com  ',
        emailSource: 'ACCOUNT_FIELD',
        oppEmail: 'other@x.com',
        accountEmail: 'account@x.com',
        contactEmail: 'contact@x.com'
      })
    );

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(mockFindOrCreateCustomer).toHaveBeenCalledTimes(1);
    const customerPayload = mockFindOrCreateCustomer.mock.calls[0][0];
    expect(customerPayload.PrimaryEmailAddr.Address).toBe('test@x.com');
  });

  it('passes the QuickBooks customer id string into the invoice payload', async () => {
    mockGetOpportunityWithRelatedData.mockResolvedValue(
      buildOpportunityData({
        billingEmail: 'billing@x.com',
        emailSource: 'ACCOUNT_FIELD',
        oppEmail: 'other@x.com',
        accountEmail: 'account@x.com',
        contactEmail: 'contact@x.com'
      })
    );

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CustomerRef.value).toBe('QB-CUST-1');
  });

  it('omits PrimaryEmailAddr when billingEmail is blank', async () => {
    mockGetOpportunityWithRelatedData.mockResolvedValue(
      buildOpportunityData({
        billingEmail: '   ',
        emailSource: 'NONE',
        oppEmail: '  other@x.com  ',
        accountEmail: '  account@x.com  ',
        contactEmail: '  contact@x.com  '
      })
    );

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const customerPayload = mockFindOrCreateCustomer.mock.calls[0][0];
    expect(customerPayload.PrimaryEmailAddr).toBeUndefined();
  });

  it('uses billingEmail from getOpportunityWithRelatedData when updating invoice', async () => {
    mockGetOpportunityWithRelatedData.mockResolvedValue(
      buildOpportunityData({
        billingEmail: '  update@x.com  ',
        emailSource: 'PRIMARY_CONTACT_ROLE',
        oppEmail: 'other@x.com',
        accountEmail: 'account@x.com',
        contactEmail: 'contact@x.com'
      })
    );

    const response = await callUpdateInvoice();

    expect(response.status).toBe(200);
    const updatePayload = mockUpdateInvoice.mock.calls[0][1];
    expect(updatePayload.BillEmail).toEqual({ Address: 'update@x.com' });
  });

  it('omits BillEmail when update-invoice billingEmail is blank', async () => {
    mockGetOpportunityWithRelatedData.mockResolvedValue(
      buildOpportunityData({
        billingEmail: ' ',
        emailSource: 'NONE',
        oppEmail: 'update@x.com',
        accountEmail: 'account@x.com',
        contactEmail: 'contact@x.com'
      })
    );

    const response = await callUpdateInvoice();

    expect(response.status).toBe(200);
    const updatePayload = mockUpdateInvoice.mock.calls[0][1];
    expect(updatePayload.BillEmail).toBeUndefined();
  });
});
