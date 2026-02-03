const QuickBooksAPI = require('../src/services/quickbooks-api');

describe('findOrCreateCustomer handles duplicate name errors', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reuses existing customer when create hits duplicate name', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getAccessToken').mockResolvedValue('token');
    const requestSpy = jest.spyOn(api, 'request');

    requestSpy
      .mockResolvedValueOnce({
        QueryResponse: { Customer: [] }
      })
      .mockRejectedValueOnce(
        new Error('QuickBooks API validation error: Duplicate Name Exists Error')
      )
      .mockResolvedValueOnce({
        QueryResponse: {
          Customer: [
            {
              Id: 'CUST-1',
              DisplayName: 'Testiruem',
              SyncToken: '0',
              CurrencyRef: { value: 'USD' }
            }
          ]
        }
      });

    const result = await api.findOrCreateCustomer({
      DisplayName: 'testiruem',
      CompanyName: 'testiruem'
    });

    expect(result).toEqual({ id: 'CUST-1', currency: 'USD', isExisting: true });
    expect(requestSpy.mock.calls.length).toBeGreaterThanOrEqual(3);

    const lookupCall = requestSpy.mock.calls[2] || requestSpy.mock.calls[requestSpy.mock.calls.length - 1];
    expect(lookupCall[0]).toBe('get');
    expect(lookupCall[1]).toContain('query?query=');
    const soql = decodeURIComponent(lookupCall[1].replace('query?query=', ''));
    expect(soql).toContain('DisplayName LIKE');
    expect(soql).toContain('MAXRESULTS');
  });

  it('returns existing customer immediately when already present', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getAccessToken').mockResolvedValue('token');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValueOnce({
      QueryResponse: {
        Customer: [
          {
            Id: 'CUST-EXIST',
            DisplayName: 'Testiruem',
            CompanyName: 'Testiruem',
            CurrencyRef: { value: 'EUR' }
          }
        ]
      }
    });

    const result = await api.findOrCreateCustomer({
      DisplayName: 'testiruem',
      CompanyName: 'testiruem'
    });

    expect(result).toEqual({ id: 'CUST-EXIST', currency: 'EUR', isExisting: true });
    expect(requestSpy).toHaveBeenCalledTimes(1);
  });
});
