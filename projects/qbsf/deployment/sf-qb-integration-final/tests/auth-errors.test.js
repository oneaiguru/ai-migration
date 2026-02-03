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

describe('auth errors from middleware', () => {
  beforeEach(() => {
    process.env.API_KEY = 'test-key';

    SalesforceAPI.mockImplementation(() => ({
      getOpportunityWithRelatedData: jest.fn(),
      updateRecord: jest.fn(),
      updateOpportunityWithQBInvoiceId: jest.fn()
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 with errorCode + reauthorizeUrl for AUTH_EXPIRED', async () => {
    QuickBooksAPI.mockImplementation(() => ({
      findInvoiceByOpportunityId: jest.fn().mockRejectedValue({
        isAuthError: true,
        code: 'AUTH_EXPIRED',
        message: 'QuickBooks refresh token expired - reauthorization required'
      })
    }));

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      errorCode: 'AUTH_EXPIRED',
      error: 'QuickBooks refresh token expired - reauthorization required',
      reauthorizeUrl: 'https://sqint.atocomm.eu/auth/quickbooks'
    });
  });

  it('returns 401 with errorCode + reauthorizeUrl for NO_TOKENS', async () => {
    QuickBooksAPI.mockImplementation(() => ({
      findInvoiceByOpportunityId: jest.fn().mockRejectedValue({
        isAuthError: true,
        code: 'NO_TOKENS',
        message: 'QuickBooks not connected - authorization required'
      })
    }));

    const response = await callOpportunityToInvoice();

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      errorCode: 'NO_TOKENS',
      error: 'QuickBooks not connected - authorization required',
      reauthorizeUrl: 'https://sqint.atocomm.eu/auth/quickbooks'
    });
  });
});

