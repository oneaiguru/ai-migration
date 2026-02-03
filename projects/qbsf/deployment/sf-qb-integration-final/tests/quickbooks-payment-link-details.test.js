const QuickBooksAPI = require('../src/services/quickbooks-api');

describe('getInvoicePaymentLinkDetails', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns SUCCESS when invoice link exists', async () => {
    jest.spyOn(QuickBooksAPI.prototype, 'request').mockResolvedValue({
      Invoice: {
        InvoiceLink: 'https://pay.example/123',
        BillEmail: { Address: 'billing@example.com' }
      }
    });

    const api = new QuickBooksAPI('123');
    const result = await api.getInvoicePaymentLinkDetails('INV-1');

    expect(result).toEqual({
      link: 'https://pay.example/123',
      reason: 'SUCCESS',
      billEmail: 'billing@example.com'
    });
  });

  it('returns INVOICE_NO_BILLEMAIL when BillEmail is missing', async () => {
    jest.spyOn(QuickBooksAPI.prototype, 'request').mockResolvedValue({
      Invoice: {}
    });

    const api = new QuickBooksAPI('123');
    const result = await api.getInvoicePaymentLinkDetails('INV-1');

    expect(result).toEqual({
      link: null,
      reason: 'INVOICE_NO_BILLEMAIL',
      billEmail: null,
      message: 'Invoice has no BillEmail - QB cannot generate payment link'
    });
  });

  it('returns QB_PAYMENTS_DISABLED when BillEmail exists without link', async () => {
    jest.spyOn(QuickBooksAPI.prototype, 'request').mockResolvedValue({
      Invoice: {
        BillEmail: { Address: 'billing@example.com' }
      }
    });

    const api = new QuickBooksAPI('123');
    const result = await api.getInvoicePaymentLinkDetails('INV-1');

    expect(result).toEqual({
      link: null,
      reason: 'QB_PAYMENTS_DISABLED',
      billEmail: 'billing@example.com',
      message: 'Invoice has BillEmail but no InvoiceLink - check QB Payments settings'
    });
  });

  it('returns AUTH_EXPIRED on 401 errors', async () => {
    const error = new Error('Unauthorized');
    error.response = { status: 401 };

    jest.spyOn(QuickBooksAPI.prototype, 'request').mockRejectedValue(error);

    const api = new QuickBooksAPI('123');
    const result = await api.getInvoicePaymentLinkDetails('INV-1');

    expect(result).toEqual({
      link: null,
      reason: 'AUTH_EXPIRED',
      message: 'QuickBooks authentication expired - reauthorization required'
    });
  });

  it('returns API_ERROR for non-auth failures', async () => {
    const error = new Error('Something went wrong');

    jest.spyOn(QuickBooksAPI.prototype, 'request').mockRejectedValue(error);

    const api = new QuickBooksAPI('123');
    const result = await api.getInvoicePaymentLinkDetails('INV-1');

    expect(result).toEqual({
      link: null,
      reason: 'API_ERROR',
      message: 'Something went wrong'
    });
  });
});
