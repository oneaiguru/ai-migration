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
    process.env.QB_INVOICE_CURRENCY_POLICY = 'customer';

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
    delete process.env.QB_INVOICE_CURRENCY_POLICY;
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

  it('converts when new customer currency differs from opportunity', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'USD', isExisting: false });
    mockGetExchangeRate.mockResolvedValue(1.2);

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(response.body.warningCode).toBe('CURRENCY_MISMATCH_CONVERTED');
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CurrencyRef.value).toBe('USD');
    expect(invoicePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(120);
    expect(invoicePayload.Line[0].Amount).toBe(120);
  });

  it('preserves discounted TotalPrice during FX conversion', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'USD', isExisting: true });
    mockGetExchangeRate.mockResolvedValue(2);
    mockGetOpportunityWithRelatedData.mockResolvedValue({
      ...baseOpportunityData,
      products: [
        {
          TotalPrice: 180,
          Quantity: 2,
          UnitPrice: 100,
          Product2: {
            QB_Item_ID__c: 'QB-ITEM-1',
            Name: 'Test Product',
            Description: 'Test product description'
          }
        }
      ]
    });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.Line[0].Amount).toBe(360);
    expect(invoicePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(180);
  });

  it('converts using TotalPrice when UnitPrice is missing', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'USD', isExisting: true });
    mockGetExchangeRate.mockResolvedValue(1.1);
    mockGetOpportunityWithRelatedData.mockResolvedValue({
      ...baseOpportunityData,
      products: [
        {
          TotalPrice: 200,
          Quantity: 2,
          UnitPrice: null,
          Product2: {
            QB_Item_ID__c: 'QB-ITEM-1',
            Name: 'Test Product',
            Description: 'Test product description'
          }
        }
      ]
    });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(110);
    expect(invoicePayload.Line[0].Amount).toBe(220);
  });

  it('converts TotalPrice when Quantity is zero', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'USD', isExisting: true });
    mockGetExchangeRate.mockResolvedValue(1.5);
    mockGetOpportunityWithRelatedData.mockResolvedValue({
      ...baseOpportunityData,
      products: [
        {
          TotalPrice: 200,
          Quantity: 0,
          UnitPrice: null,
          Product2: {
            QB_Item_ID__c: 'QB-ITEM-1',
            Name: 'Test Product',
            Description: 'Test product description'
          }
        }
      ]
    });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.Line[0].Amount).toBe(300);
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

  it('accepts legacy string customer IDs from findOrCreateCustomer', async () => {
    mockFindOrCreateCustomer.mockResolvedValue('QB-CUST-1');
    mockGetCustomer.mockResolvedValue({
      Customer: { Id: 'QB-CUST-1', CurrencyRef: { value: 'EUR' } }
    });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(mockGetCustomer).toHaveBeenCalledWith('QB-CUST-1');
    expect(mockGetExchangeRate).not.toHaveBeenCalled();
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.CustomerRef.value).toBe('QB-CUST-1');
  });

  it('aligns Amount with derived UnitPrice when TotalPrice is not divisible by Quantity', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: 'EUR', isExisting: true });
    mockGetOpportunityWithRelatedData.mockResolvedValue({
      ...baseOpportunityData,
      products: [
        {
          TotalPrice: 100,
          Quantity: 3,
          UnitPrice: null,
          Product2: {
            QB_Item_ID__c: 'QB-ITEM-1',
            Name: 'Test Product',
            Description: 'Test product description'
          }
        }
      ]
    });

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    const invoicePayload = mockCreateInvoice.mock.calls[0][0];
    expect(invoicePayload.Line[0].SalesItemLineDetail.UnitPrice).toBe(33.33);
    expect(invoicePayload.Line[0].Amount).toBe(99.99);
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

  it('blocks when existing customer currency is unknown', async () => {
    mockFindOrCreateCustomer.mockResolvedValue({ id: 'QB-CUST-1', currency: null, isExisting: true });
    mockGetCustomer.mockResolvedValue({ Customer: { Id: 'QB-CUST-1' } });

    await expect(callOpportunityToInvoice()).rejects.toMatchObject({
      code: 'QB_CUSTOMER_CURRENCY_UNKNOWN',
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
