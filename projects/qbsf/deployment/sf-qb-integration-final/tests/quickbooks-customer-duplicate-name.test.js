const QuickBooksAPI = require('../src/services/quickbooks-api');
const config = require('../src/config');

const decodeSoql = (endpoint) => decodeURIComponent(endpoint.replace('query?query=', ''));

describe('findOrCreateCustomer handles duplicate name errors', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reuses existing customer when create hits duplicate name', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getAccessToken').mockResolvedValue('token');
    const requestSpy = jest.spyOn(api, 'request').mockImplementation((method, endpoint) => {
      if (method === 'get' && endpoint.startsWith('query?query=')) {
        const soql = decodeSoql(endpoint);
        if (soql.includes('FROM Customer') && soql.includes('DisplayName =')) {
          return Promise.resolve({ QueryResponse: { Customer: [] } });
        }
        if (soql.includes('FROM Customer')) {
          return Promise.resolve({
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
        }
        if (soql.includes('FROM Vendor') || soql.includes('FROM Employee') || soql.includes('FROM OtherName')) {
          return Promise.resolve({ QueryResponse: {} });
        }
      }
      if (method === 'post' && endpoint === 'customer') {
        return Promise.reject(new Error('QuickBooks API validation error: Duplicate Name Exists Error'));
      }
      return Promise.reject(new Error(`Unexpected request: ${method} ${endpoint}`));
    });

    const result = await api.findOrCreateCustomer({
      DisplayName: 'testiruem',
      CompanyName: 'testiruem'
    });

    expect(result).toEqual({ id: 'CUST-1', currency: 'USD', isExisting: true });
    expect(requestSpy.mock.calls.length).toBeGreaterThanOrEqual(2);

    const lookupCall = requestSpy.mock.calls.find(
      ([method, endpoint]) =>
        method === 'get' &&
        endpoint.includes('query?query=') &&
        decodeSoql(endpoint).includes('DisplayName LIKE')
    );
    expect(lookupCall).toBeTruthy();
    const soql = decodeSoql(lookupCall[1]);
    expect(soql).toContain('DisplayName LIKE');
    expect(soql).toContain('MAXRESULTS');
  });

  it('finds inactive exact match even when active partial exists', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getAccessToken').mockResolvedValue('token');
    const requestSpy = jest.spyOn(api, 'request').mockImplementation((method, endpoint) => {
      if (method === 'get' && endpoint.startsWith('query?query=')) {
        const soql = decodeSoql(endpoint);
        if (soql.includes('FROM Customer') && soql.includes('DisplayName =')) {
          return Promise.resolve({ QueryResponse: { Customer: [] } });
        }
        if (soql.includes('FROM Customer') && soql.includes('Active = false')) {
          return Promise.resolve({
            QueryResponse: {
              Customer: [
                {
                  Id: 'CUST-INACTIVE',
                  DisplayName: 'ATO COMM',
                  CompanyName: 'ATO COMM',
                  Active: false,
                  SyncToken: '1',
                  CurrencyRef: { value: 'USD' }
                }
              ]
            }
          });
        }
        if (soql.includes('FROM Customer')) {
          return Promise.resolve({
            QueryResponse: {
              Customer: [
                {
                  Id: 'CUST-PARTIAL',
                  DisplayName: 'ATO COMM HOLDINGS',
                  CompanyName: 'ATO COMM HOLDINGS',
                  Active: true,
                  SyncToken: '0',
                  CurrencyRef: { value: 'USD' }
                }
              ]
            }
          });
        }
      }
      if (method === 'post' && endpoint === 'customer') {
        return Promise.reject(new Error('QuickBooks API validation error: Duplicate Name Exists Error'));
      }
      return Promise.reject(new Error(`Unexpected request: ${method} ${endpoint}`));
    });

    const result = await api.findOrCreateCustomer({
      DisplayName: 'ATO COMM',
      CompanyName: 'ATO COMM'
    });

    expect(result).toEqual({ id: 'CUST-INACTIVE', currency: 'USD', isExisting: true });
    const inactiveLookup = requestSpy.mock.calls.find(
      ([method, endpoint]) =>
        method === 'get' &&
        endpoint.includes('query?query=') &&
        decodeSoql(endpoint).includes('Active = false')
    );
    expect(inactiveLookup).toBeTruthy();
  });

  it('surfaces vendor conflicts with QB_NAME_CONFLICT when auto-suffix disabled', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getAccessToken').mockResolvedValue('token');
    const requestSpy = jest.spyOn(api, 'request').mockImplementation((method, endpoint) => {
      if (method === 'get' && endpoint.startsWith('query?query=')) {
        const soql = decodeSoql(endpoint);
        if (soql.includes('FROM Customer')) {
          return Promise.resolve({ QueryResponse: { Customer: [] } });
        }
        if (soql.includes('FROM Vendor')) {
          return Promise.resolve({
            QueryResponse: {
              Vendor: [
                {
                  Id: 'VEND-1',
                  DisplayName: 'ATO COMM',
                  CompanyName: 'ATO COMM',
                  Active: true
                }
              ]
            }
          });
        }
        if (soql.includes('FROM Employee') || soql.includes('FROM OtherName')) {
          return Promise.resolve({ QueryResponse: {} });
        }
      }
      if (method === 'post' && endpoint === 'customer') {
        return Promise.reject(new Error('QuickBooks API validation error: Duplicate Name Exists Error'));
      }
      return Promise.reject(new Error(`Unexpected request: ${method} ${endpoint}`));
    });

    try {
      await api.findOrCreateCustomer({
        DisplayName: 'ATO COMM',
        CompanyName: 'ATO COMM'
      });
      throw new Error('Expected name conflict to throw');
    } catch (error) {
      expect(error.code).toBe('QB_NAME_CONFLICT');
      expect(error.statusCode).toBe(422);
      expect(error.message).toContain('Vendor');
    }

    expect(requestSpy).toHaveBeenCalled();
  });

  it('creates suffixed customer when auto-suffix enabled and name conflicts', async () => {
    const api = new QuickBooksAPI('123', {
      ...config.quickbooks,
      duplicateNameAutoSuffix: true,
      duplicateNameSuffix: ' (SF)'
    });
    jest.spyOn(api, 'getAccessToken').mockResolvedValue('token');
    const requestSpy = jest.spyOn(api, 'request').mockImplementation((method, endpoint, data) => {
      if (method === 'get' && endpoint.startsWith('query?query=')) {
        const soql = decodeSoql(endpoint);
        if (soql.includes('FROM Customer')) {
          return Promise.resolve({ QueryResponse: { Customer: [] } });
        }
        if (soql.includes('FROM Vendor')) {
          return Promise.resolve({
            QueryResponse: {
              Vendor: [
                {
                  Id: 'VEND-1',
                  DisplayName: 'ATO COMM',
                  CompanyName: 'ATO COMM',
                  Active: true
                }
              ]
            }
          });
        }
        if (soql.includes('FROM Employee') || soql.includes('FROM OtherName')) {
          return Promise.resolve({ QueryResponse: {} });
        }
      }
      if (method === 'post' && endpoint === 'customer') {
        if (data?.DisplayName === 'ATO COMM') {
          return Promise.reject(new Error('QuickBooks API validation error: Duplicate Name Exists Error'));
        }
        if (data?.DisplayName === 'ATO COMM (SF)') {
          return Promise.resolve({
            Customer: {
              Id: 'CUST-SUFFIX',
              CurrencyRef: { value: 'USD' }
            }
          });
        }
      }
      return Promise.reject(new Error(`Unexpected request: ${method} ${endpoint}`));
    });

    const result = await api.findOrCreateCustomer({
      DisplayName: 'ATO COMM',
      CompanyName: 'ATO COMM'
    });

    expect(result).toEqual({ id: 'CUST-SUFFIX', currency: 'USD', isExisting: false });
    const suffixCall = requestSpy.mock.calls.find(
      ([method, endpoint, data]) =>
        method === 'post' &&
        endpoint === 'customer' &&
        data?.DisplayName === 'ATO COMM (SF)'
    );
    expect(suffixCall).toBeTruthy();
    expect(suffixCall[2].CompanyName).toBe('ATO COMM');
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
