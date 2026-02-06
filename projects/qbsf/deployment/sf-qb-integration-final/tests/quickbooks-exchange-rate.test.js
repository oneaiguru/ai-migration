const QuickBooksAPI = require('../src/services/quickbooks-api');

describe('QuickBooks exchange rate resolution', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 1 when currencies match', async () => {
    const api = new QuickBooksAPI('123');
    const requestSpy = jest.spyOn(api, 'request');

    const rate = await api.getExchangeRate('usd', 'USD', '2025-01-01');

    expect(rate).toBe(1);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('returns foreign -> home rate directly', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValueOnce({
      ExchangeRate: {
        AsOfDate: '2025-01-01',
        SourceCurrencyCode: 'EUR',
        TargetCurrencyCode: 'USD',
        Rate: 1.2
      }
    });

    const rate = await api.getExchangeRate('EUR', 'USD', '2025-01-01');

    expect(rate).toBeCloseTo(1.2);
    expect(requestSpy).toHaveBeenCalledWith(
      'get',
      'exchangerate?sourcecurrencycode=EUR&asofdate=2025-01-01'
    );
  });

  it('inverts rate when converting home -> foreign', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValueOnce({
      ExchangeRate: {
        AsOfDate: '2025-01-01',
        SourceCurrencyCode: 'EUR',
        TargetCurrencyCode: 'USD',
        Rate: 1.25
      }
    });

    const rate = await api.getExchangeRate('USD', 'EUR', '2025-01-01');

    expect(rate).toBeCloseTo(1 / 1.25);
    expect(requestSpy).toHaveBeenCalledWith(
      'get',
      'exchangerate?sourcecurrencycode=EUR&asofdate=2025-01-01'
    );
  });

  it('computes cross rates via home currency when both are foreign', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest
      .spyOn(api, 'request')
      .mockResolvedValueOnce({
        ExchangeRate: {
          AsOfDate: '2025-01-01',
          SourceCurrencyCode: 'EUR',
          TargetCurrencyCode: 'USD',
          Rate: 1.2
        }
      })
      .mockResolvedValueOnce({
        ExchangeRate: {
          AsOfDate: '2025-01-01',
          SourceCurrencyCode: 'GBP',
          TargetCurrencyCode: 'USD',
          Rate: 1.5
        }
      });

    const rate = await api.getExchangeRate('EUR', 'GBP', '2025-01-01');

    expect(rate).toBeCloseTo(1.2 / 1.5);
    expect(requestSpy).toHaveBeenNthCalledWith(
      1,
      'get',
      'exchangerate?sourcecurrencycode=EUR&asofdate=2025-01-01'
    );
    expect(requestSpy).toHaveBeenNthCalledWith(
      2,
      'get',
      'exchangerate?sourcecurrencycode=GBP&asofdate=2025-01-01'
    );
  });

  it('falls back to yesterday when today is missing and no asOfDate provided', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest
      .spyOn(api, 'request')
      // today missing -> null
      .mockResolvedValueOnce({})
      // yesterday present -> rate 1.1
      .mockResolvedValueOnce({
        ExchangeRate: {
          AsOfDate: '2025-01-02',
          SourceCurrencyCode: 'EUR',
          TargetCurrencyCode: 'USD',
          Rate: 1.1
        }
      });

    const rate = await api.getExchangeRate('EUR', 'USD');

    expect(rate).toBeCloseTo(1.1);
    expect(requestSpy).toHaveBeenNthCalledWith(
      1,
      'get',
      expect.stringContaining('exchangerate?sourcecurrencycode=EUR&asofdate=')
    );
    expect(requestSpy).toHaveBeenNthCalledWith(
      2,
      'get',
      expect.stringContaining('exchangerate?sourcecurrencycode=EUR&asofdate=')
    );
  });

  it('returns null when today and yesterday rates are missing with no asOfDate', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValue({});

    const rate = await api.getExchangeRate('EUR', 'USD');

    expect(rate).toBeNull();
    expect(requestSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('falls back to the prior day when asOfDate rate is missing', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest
      .spyOn(api, 'request')
      // asOfDate missing
      .mockResolvedValueOnce({})
      // prior day present
      .mockResolvedValueOnce({
        ExchangeRate: {
          AsOfDate: '2026-01-09',
          SourceCurrencyCode: 'EUR',
          TargetCurrencyCode: 'USD',
          Rate: 1.163467
        }
      });

    const rate = await api.getExchangeRate('EUR', 'USD', '2026-01-10');

    expect(rate).toBeCloseTo(1.163467);
    expect(requestSpy).toHaveBeenNthCalledWith(
      1,
      'get',
      'exchangerate?sourcecurrencycode=EUR&asofdate=2026-01-10'
    );
    expect(requestSpy).toHaveBeenNthCalledWith(
      2,
      'get',
      'exchangerate?sourcecurrencycode=EUR&asofdate=2026-01-09'
    );
  });

  it('returns null when asOfDate and prior day rates are missing', async () => {
    const api = new QuickBooksAPI('123');
    jest.spyOn(api, 'getCompanyCurrency').mockResolvedValue('USD');
    const requestSpy = jest.spyOn(api, 'request').mockResolvedValue({});

    const rate = await api.getExchangeRate('EUR', 'USD', '2026-01-10');

    expect(rate).toBeNull();
    expect(requestSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(requestSpy.mock.calls[0][1]).toBe('exchangerate?sourcecurrencycode=EUR&asofdate=2026-01-10');
    expect(requestSpy.mock.calls[1][1]).toBe('exchangerate?sourcecurrencycode=EUR&asofdate=2026-01-09');
  });
});
