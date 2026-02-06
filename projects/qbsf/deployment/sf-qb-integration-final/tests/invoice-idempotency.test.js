jest.mock('../src/services/salesforce-api');
jest.mock('../src/services/quickbooks-api');

const apiRoutes = require('../src/routes/api');
const SalesforceAPI = require('../src/services/salesforce-api');
const QuickBooksAPI = require('../src/services/quickbooks-api');

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

describe('invoice idempotency', () => {
  let mockUpdateRecord;
  let mockGetOpportunityWithRelatedData;
  let mockFindInvoiceByOpportunityId;
  let mockGetInvoicePaymentLinkDetails;
  let mockFindOrCreateCustomer;
  let mockCreateInvoice;

  beforeEach(() => {
    process.env.API_KEY = 'test-key';

    mockUpdateRecord = jest.fn().mockResolvedValue(undefined);
    mockGetOpportunityWithRelatedData = jest.fn();

    SalesforceAPI.mockImplementation(() => ({
      updateRecord: mockUpdateRecord,
      getOpportunityWithRelatedData: mockGetOpportunityWithRelatedData
    }));

    mockFindInvoiceByOpportunityId = jest.fn().mockResolvedValue({
      Id: 'QB-INV-EXIST',
      DocNumber: 'QB-INV-100'
    });
    mockGetInvoicePaymentLinkDetails = jest.fn().mockResolvedValue({
      link: 'https://pay.example/qb',
      reason: 'SUCCESS',
      message: null
    });
    mockFindOrCreateCustomer = jest.fn();
    mockCreateInvoice = jest.fn();

    QuickBooksAPI.mockImplementation(() => ({
      findInvoiceByOpportunityId: mockFindInvoiceByOpportunityId,
      getInvoicePaymentLinkDetails: mockGetInvoicePaymentLinkDetails,
      findOrCreateCustomer: mockFindOrCreateCustomer,
      createInvoice: mockCreateInvoice
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reconciles existing invoices before create', async () => {
    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(200);
    expect(response.body.reconciled).toBe(true);
    expect(response.body.qbInvoiceId).toBe('QB-INV-EXIST');
    expect(response.body.paymentLinkStatus).toBe('SUCCESS');

    expect(mockGetOpportunityWithRelatedData).not.toHaveBeenCalled();
    expect(mockFindOrCreateCustomer).not.toHaveBeenCalled();
    expect(mockCreateInvoice).not.toHaveBeenCalled();

    expect(mockUpdateRecord).toHaveBeenNthCalledWith(
      1,
      'Opportunity',
      '006000000000001',
      expect.objectContaining({
        QB_Invoice_ID__c: 'QB-INV-EXIST',
        QB_Invoice_Number__c: 'QB-INV-100'
      })
    );

    expect(mockUpdateRecord).toHaveBeenNthCalledWith(
      2,
      'Opportunity',
      '006000000000001',
      expect.objectContaining({
        QB_Invoice_ID__c: 'QB-INV-EXIST',
        QB_Invoice_Number__c: 'QB-INV-100'
      })
    );
  });
});
