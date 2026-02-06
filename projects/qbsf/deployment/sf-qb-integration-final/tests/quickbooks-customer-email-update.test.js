const QuickBooksAPI = require('../src/services/quickbooks-api');

describe('findOrCreateCustomer updates existing customer email', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockExistingCustomerByName = (customer) => {
    jest.spyOn(QuickBooksAPI.prototype, 'getAccessToken').mockResolvedValue('token');
    return jest.spyOn(QuickBooksAPI.prototype, 'request').mockImplementation((method, endpoint) => {
      if (method === 'get' && endpoint.startsWith('query?query=')) {
        const soql = decodeURIComponent(endpoint.replace('query?query=', ''));
        expect(soql).toContain('PrimaryEmailAddr');
        expect(soql).toContain('SyncToken');

        return Promise.resolve({
          QueryResponse: {
            Customer: [customer]
          }
        });
      }

      throw new Error(`Unexpected request: ${method} ${endpoint}`);
    });
  };

  it('updates email when new email is non-blank and different', async () => {
    mockExistingCustomerByName({
      Id: 'CUST-1',
      DisplayName: 'Test Account',
      PrimaryEmailAddr: { Address: ' old@x.com ' },
      SyncToken: '0'
    });

    const updateCustomerSpy = jest
      .spyOn(QuickBooksAPI.prototype, 'updateCustomer')
      .mockResolvedValue({ Customer: { Id: 'CUST-1' } });

    const api = new QuickBooksAPI('123');
    const customerResult = await api.findOrCreateCustomer({
      DisplayName: 'Test Account',
      PrimaryEmailAddr: { Address: ' new@x.com ' }
    });

    expect(customerResult.id).toBe('CUST-1');
    expect(updateCustomerSpy).toHaveBeenCalledWith('CUST-1', {
      PrimaryEmailAddr: { Address: 'new@x.com' },
      SyncToken: '0'
    });
  });

  it('does not update when email is unchanged', async () => {
    mockExistingCustomerByName({
      Id: 'CUST-1',
      DisplayName: 'Test Account',
      PrimaryEmailAddr: { Address: 'same@x.com' },
      SyncToken: '0'
    });

    const updateCustomerSpy = jest
      .spyOn(QuickBooksAPI.prototype, 'updateCustomer')
      .mockResolvedValue({ Customer: { Id: 'CUST-1' } });

    const api = new QuickBooksAPI('123');
    const customerResult = await api.findOrCreateCustomer({
      DisplayName: 'Test Account',
      PrimaryEmailAddr: { Address: 'same@x.com' }
    });

    expect(customerResult.id).toBe('CUST-1');
    expect(updateCustomerSpy).not.toHaveBeenCalled();
  });

  it('does not update when new email is blank', async () => {
    mockExistingCustomerByName({
      Id: 'CUST-1',
      DisplayName: 'Test Account',
      PrimaryEmailAddr: { Address: 'old@x.com' },
      SyncToken: '0'
    });

    const updateCustomerSpy = jest
      .spyOn(QuickBooksAPI.prototype, 'updateCustomer')
      .mockResolvedValue({ Customer: { Id: 'CUST-1' } });

    const api = new QuickBooksAPI('123');
    const customerResult = await api.findOrCreateCustomer({
      DisplayName: 'Test Account'
    });

    expect(customerResult.id).toBe('CUST-1');
    expect(updateCustomerSpy).not.toHaveBeenCalled();
  });
});
