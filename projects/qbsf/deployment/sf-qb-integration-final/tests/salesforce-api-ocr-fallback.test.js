const SalesforceAPI = require('../src/services/salesforce-api');

describe('OpportunityContactRole fallback', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockRecords = () =>
    jest.spyOn(SalesforceAPI.prototype, 'getRecord').mockImplementation((sobject) => {
      if (sobject === 'Opportunity') return { Id: '006', AccountId: '001' };
      if (sobject === 'Account') return { Id: '001', Name: 'Acct', Email__c: '' };
      return {};
    });

  it('prefers primary OCR email when available', async () => {
    mockRecords();

    const querySpy = jest
      .spyOn(SalesforceAPI.prototype, 'query')
      .mockImplementation((query) => {
        if (query.includes('FROM OpportunityLineItem')) {
          return Promise.resolve({ records: [] });
        }
        if (query.includes('FROM OpportunityContactRole')) {
          return Promise.resolve({
            records: [{ Contact: { Email: 'ocr@example.com' } }]
          });
        }
        if (query.includes('FROM Contact')) {
          return Promise.resolve({ records: [{ Email: 'contact@example.com' }] });
        }
        return Promise.resolve({ records: [] });
      });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe('ocr@example.com');
    expect(result.emailSource).toBe('PRIMARY_CONTACT_ROLE');
    expect(result.contactEmail).toBe('ocr@example.com');
    const contactCalls = querySpy.mock.calls.filter(([query]) =>
      query.includes('FROM Contact')
    );
    expect(contactCalls.length).toBe(0);
  });

  it('falls back to Contact when OCR is missing', async () => {
    mockRecords();

    const querySpy = jest
      .spyOn(SalesforceAPI.prototype, 'query')
      .mockImplementation((query) => {
        if (query.includes('FROM OpportunityLineItem')) {
          return Promise.resolve({ records: [] });
        }
        if (query.includes('FROM OpportunityContactRole')) {
          return Promise.resolve({ records: [] });
        }
        if (query.includes('FROM Contact')) {
          return Promise.resolve({ records: [{ Email: 'contact@example.com' }] });
        }
        return Promise.resolve({ records: [] });
      });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe('contact@example.com');
    expect(result.emailSource).toBe('CONTACT_FALLBACK');
    expect(result.contactEmail).toBe('contact@example.com');
    expect(
      querySpy.mock.calls.some(([query]) => query.includes('FROM Contact'))
    ).toBe(true);
  });
});
