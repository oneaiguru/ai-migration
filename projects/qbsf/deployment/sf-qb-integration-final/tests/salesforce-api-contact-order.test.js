const SalesforceAPI = require('../src/services/salesforce-api');

describe('contact query order', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds ORDER BY LastModifiedDate DESC', async () => {
    jest
      .spyOn(SalesforceAPI.prototype, 'getRecord')
      .mockImplementation((sobject) => {
        if (sobject === 'Opportunity') return { Id: '006', AccountId: '001' };
        if (sobject === 'Account') return { Id: '001', Name: 'Acct', Email__c: '' };
        return {};
      });

    const querySpy = jest
      .spyOn(SalesforceAPI.prototype, 'query')
      .mockImplementation((query) => {
        if (query.includes('FROM OpportunityLineItem')) {
          return Promise.resolve({ records: [] });
        }
        if (query.includes('FROM Contact')) {
          expect(query).toContain('ORDER BY LastModifiedDate DESC');
          return Promise.resolve({ records: [] });
        }
        return Promise.resolve({ records: [] });
      });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    await api.getOpportunityWithRelatedData('006');
    expect(querySpy).toHaveBeenCalled();
  });
});
