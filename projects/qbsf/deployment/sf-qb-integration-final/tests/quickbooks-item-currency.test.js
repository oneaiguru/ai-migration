const QuickBooksAPI = require('../src/services/quickbooks-api');

describe('QuickBooks item currency selection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('selects the first matching currency item', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'request').mockResolvedValueOnce({
      QueryResponse: {
        Item: [
          { Id: '0', Name: 'Base Service', Type: 'Service' },
          { Id: '1', Name: 'USD Service', Type: 'Service', CurrencyRef: { value: 'USD' } },
          { Id: '2', Name: 'EUR Service', Type: 'Service', CurrencyRef: { value: 'EUR' } }
        ]
      }
    });

    const item = await api.getFirstAvailableItem('eur');

    expect(item).toEqual({ id: '2', name: 'EUR Service' });
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it('falls back to base currency items when invoice currency differs', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    jest.spyOn(api, 'request').mockResolvedValueOnce({
      QueryResponse: {
        Item: [{ Id: '1', Name: 'USD Service', Type: 'Service', CurrencyRef: { value: 'USD' } }]
      }
    });

    const item = await api.getFirstAvailableItem('EUR');

    expect(item).toEqual({ id: '1', name: 'USD Service' });
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it('throws a clear error when no items match currency or base currency', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    jest.spyOn(api, 'request')
      .mockResolvedValueOnce({
        QueryResponse: {
          Item: [{ Id: '1', Name: 'GBP Service', Type: 'Service', CurrencyRef: { value: 'GBP' } }]
        }
      })
      .mockResolvedValueOnce({
        QueryResponse: {
          Item: [{ Id: '2', Name: 'GBP Product', Type: 'NonInventory', CurrencyRef: { value: 'GBP' } }]
        }
      });

    await expect(api.getFirstAvailableItem('EUR')).rejects.toMatchObject({
      code: 'QB_ITEM_CURRENCY_UNAVAILABLE',
      statusCode: 422
    });
    expect(api.request).toHaveBeenCalledTimes(2);
  });

  it('falls back to base item when currency differs and CurrencyRef is missing', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'request').mockResolvedValueOnce({
      QueryResponse: {
        Item: [
          { Id: '1', Name: 'Base Service', Type: 'Service' },
          { Id: '2', Name: 'Base Service 2', Type: 'Service' }
        ]
      }
    });

    const item = await api.getFirstAvailableItem('EUR');

    expect(item).toEqual({ id: '1', name: 'Base Service' });
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it('prefers base item when currency is missing', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    jest.spyOn(api, 'request').mockResolvedValueOnce({
      QueryResponse: {
        Item: [
          { Id: '1', Name: 'EUR Service', Type: 'Service', CurrencyRef: { value: 'EUR' } },
          { Id: '2', Name: 'Base Service', Type: 'Service' }
        ]
      }
    });

    const item = await api.getFirstAvailableItem();

    expect(item).toEqual({ id: '2', name: 'Base Service' });
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it('uses base currency item when currency is missing and no base items exist', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    jest.spyOn(api, 'request').mockResolvedValueOnce({
      QueryResponse: {
        Item: [
          { Id: '1', Name: 'EUR Service', Type: 'Service', CurrencyRef: { value: 'EUR' } },
          { Id: '2', Name: 'USD Service', Type: 'Service', CurrencyRef: { value: 'USD' } }
        ]
      }
    });

    const item = await api.getFirstAvailableItem();

    expect(item).toEqual({ id: '2', name: 'USD Service' });
    expect(api.request).toHaveBeenCalledTimes(1);
  });

  it('throws when currency is missing and only foreign items exist', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    jest.spyOn(api, 'request')
      .mockResolvedValueOnce({
        QueryResponse: {
          Item: [
            { Id: '1', Name: 'EUR Service', Type: 'Service', CurrencyRef: { value: 'EUR' } }
          ]
        }
      })
      .mockResolvedValueOnce({
        QueryResponse: {
          Item: [
            { Id: '2', Name: 'EUR Product', Type: 'NonInventory', CurrencyRef: { value: 'EUR' } }
          ]
        }
      });

    await expect(api.getFirstAvailableItem()).rejects.toMatchObject({
      code: 'QB_ITEM_CURRENCY_UNAVAILABLE',
      statusCode: 422
    });
    expect(api.request).toHaveBeenCalledTimes(2);
  });

  it('throws when there are no items at all', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    jest.spyOn(api, 'request')
      .mockResolvedValueOnce({
        QueryResponse: { Item: [] }
      })
      .mockResolvedValueOnce({
        QueryResponse: { Item: [] }
      });

    await expect(api.getFirstAvailableItem('EUR')).rejects.toMatchObject({
      code: 'QB_ITEM_CURRENCY_UNAVAILABLE',
      statusCode: 422
    });
    expect(api.request).toHaveBeenCalledTimes(2);
  });

  it('uses invoice currency when resolving DYNAMIC items on create', async () => {
    const api = new QuickBooksAPI('123');
    const getItemSpy = jest.spyOn(api, 'getFirstAvailableItem').mockResolvedValue({
      id: 'ITEM-EUR',
      name: 'Service EUR'
    });
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValue({
      Invoice: { Id: 'INV-1' }
    });

    const invoiceData = {
      CurrencyRef: { value: 'eur' },
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: 'DYNAMIC' }
          }
        }
      ]
    };

    await api.createInvoice(invoiceData);

    expect(getItemSpy).toHaveBeenCalledWith('EUR');
    expect(invoiceData.Line[0].SalesItemLineDetail.ItemRef.value).toBe('ITEM-EUR');
    expect(requestSpy).toHaveBeenCalledWith('post', 'invoice', invoiceData);
  });

  it('skips item lookup when no DYNAMIC items on create', async () => {
    const api = new QuickBooksAPI('123');
    const getItemSpy = jest.spyOn(api, 'getFirstAvailableItem');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValue({
      Invoice: { Id: 'INV-2' }
    });

    const invoiceData = {
      CurrencyRef: { value: 'usd' },
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: 'ITEM-USD' }
          }
        }
      ]
    };

    await api.createInvoice(invoiceData);

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalledWith('post', 'invoice', invoiceData);
  });

  it('uses invoice currency when resolving DYNAMIC items on update', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getInvoice').mockResolvedValue({
      Invoice: {
        Id: 'INV-1',
        SyncToken: '1',
        CurrencyRef: { value: 'GBP' }
      }
    });
    const getItemSpy = jest.spyOn(api, 'getFirstAvailableItem').mockResolvedValue({
      id: 'ITEM-GBP',
      name: 'Service GBP'
    });
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValue({ Invoice: { Id: 'INV-1' } });

    const updateData = {
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: 'DYNAMIC' }
          }
        }
      ]
    };

    await api.updateInvoice('INV-1', updateData);

    expect(getItemSpy).toHaveBeenCalledWith('GBP');
    expect(updateData.Line[0].SalesItemLineDetail.ItemRef.value).toBe('ITEM-GBP');
    expect(requestSpy).toHaveBeenCalled();
  });

  it('preserves item currency error when resolving DYNAMIC items on update', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getInvoice').mockResolvedValue({
      Invoice: {
        Id: 'INV-4',
        SyncToken: '3',
        CurrencyRef: { value: 'EUR' }
      }
    });
    const currencyError = new Error('No active QuickBooks items available for currency EUR.');
    currencyError.code = 'QB_ITEM_CURRENCY_UNAVAILABLE';
    currencyError.statusCode = 422;
    const getItemSpy = jest.spyOn(api, 'getFirstAvailableItem').mockRejectedValue(currencyError);

    const updateData = {
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: 'DYNAMIC' }
          }
        }
      ]
    };

    await expect(api.updateInvoice('INV-4', updateData)).rejects.toMatchObject({
      code: 'QB_ITEM_CURRENCY_UNAVAILABLE',
      statusCode: 422
    });
    expect(getItemSpy).toHaveBeenCalledWith('EUR');
  });

  it('skips item lookup when no DYNAMIC items on update', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getInvoice').mockResolvedValue({
      Invoice: {
        Id: 'INV-3',
        SyncToken: '2',
        CurrencyRef: { value: 'USD' }
      }
    });
    const getItemSpy = jest.spyOn(api, 'getFirstAvailableItem');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValue({ Invoice: { Id: 'INV-3' } });

    const updateData = {
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: 'ITEM-USD' }
          }
        }
      ]
    };

    await api.updateInvoice('INV-3', updateData);

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(requestSpy).toHaveBeenCalled();
  });

  it('preserves currency mismatch detail for ItemRef errors on update', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getInvoice').mockResolvedValue({
      Invoice: {
        Id: 'INV-5',
        SyncToken: '4',
        CurrencyRef: { value: 'EUR' }
      }
    });
    jest.spyOn(api, 'getFirstAvailableItem').mockResolvedValue({
      id: 'ITEM-EUR',
      name: 'Service EUR'
    });
    jest.spyOn(api, 'request').mockRejectedValue(
      new Error('QuickBooks API validation error (Field: ItemRef): You can only use one foreign currency per transaction')
    );

    const updateData = {
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          SalesItemLineDetail: {
            ItemRef: { value: 'DYNAMIC' }
          }
        }
      ]
    };

    await expect(api.updateInvoice('INV-5', updateData)).rejects.toThrow(
      'You can only use one foreign currency per transaction'
    );
  });
});
