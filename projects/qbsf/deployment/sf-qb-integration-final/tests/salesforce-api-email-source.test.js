const SalesforceAPI = require('../src/services/salesforce-api');

describe('billing email selection priority + source', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockSf = ({ oppEmail, accountEmail, ocrEmail, contactEmail }) => {
    jest.spyOn(SalesforceAPI.prototype, 'getRecord').mockImplementation((sobject) => {
      if (sobject === 'Opportunity') {
        return {
          Id: '006',
          AccountId: '001',
          Email_for_invoice__c: oppEmail
        };
      }

      if (sobject === 'Account') {
        return {
          Id: '001',
          Name: 'Acct',
          Email__c: accountEmail
        };
      }

      return {};
    });

    return jest.spyOn(SalesforceAPI.prototype, 'query').mockImplementation((query) => {
      if (query.includes('FROM OpportunityLineItem')) {
        return Promise.resolve({ records: [] });
      }

      if (query.includes('FROM OpportunityContactRole')) {
        return Promise.resolve({
          records: ocrEmail ? [{ Contact: { Email: ocrEmail } }] : []
        });
      }

      if (query.includes('FROM Contact')) {
        return Promise.resolve({
          records: contactEmail ? [{ Email: contactEmail }] : []
        });
      }

      return Promise.resolve({ records: [] });
    });
  };

  it('prefers Opportunity.Email_for_invoice__c over all other sources', async () => {
    const querySpy = mockSf({
      oppEmail: '  opp@x.com  ',
      accountEmail: '  account@x.com  ',
      ocrEmail: '  ocr@x.com  ',
      contactEmail: '  contact@x.com  '
    });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe('opp@x.com');
    expect(result.emailSource).toBe('OPPORTUNITY_FIELD');
    expect(result.contactEmail).toBe(null);

    expect(
      querySpy.mock.calls.some(([query]) => query.includes('FROM OpportunityContactRole'))
    ).toBe(false);
    expect(querySpy.mock.calls.some(([query]) => query.includes('FROM Contact'))).toBe(false);
  });

  it('prefers Primary OpportunityContactRole over Account + Contact fallback', async () => {
    const querySpy = mockSf({
      oppEmail: '   ',
      accountEmail: '  account@x.com  ',
      ocrEmail: '  ocr@x.com  ',
      contactEmail: '  contact@x.com  '
    });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe('ocr@x.com');
    expect(result.emailSource).toBe('PRIMARY_CONTACT_ROLE');
    expect(result.contactEmail).toBe('ocr@x.com');

    expect(querySpy.mock.calls.some(([query]) => query.includes('FROM Contact'))).toBe(false);
  });

  it('falls back to Account.Email__c when Opportunity + OCR have no email', async () => {
    const querySpy = mockSf({
      oppEmail: '',
      accountEmail: '  account@x.com  ',
      ocrEmail: null,
      contactEmail: '  contact@x.com  '
    });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe('account@x.com');
    expect(result.emailSource).toBe('ACCOUNT_FIELD');
    expect(result.contactEmail).toBe(null);

    expect(querySpy.mock.calls.some(([query]) => query.includes('FROM Contact'))).toBe(false);
  });

  it('falls back to most recently modified Contact when all higher priorities are blank', async () => {
    const querySpy = mockSf({
      oppEmail: '',
      accountEmail: '   ',
      ocrEmail: null,
      contactEmail: '  contact@x.com  '
    });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe('contact@x.com');
    expect(result.emailSource).toBe('CONTACT_FALLBACK');
    expect(result.contactEmail).toBe('contact@x.com');

    expect(querySpy.mock.calls.some(([query]) => query.includes('FROM Contact'))).toBe(true);
  });

  it('returns NONE when no email is available', async () => {
    mockSf({
      oppEmail: '',
      accountEmail: '',
      ocrEmail: null,
      contactEmail: null
    });

    const api = new SalesforceAPI('https://example.my.salesforce.com');
    const result = await api.getOpportunityWithRelatedData('006');

    expect(result.billingEmail).toBe(null);
    expect(result.emailSource).toBe('NONE');
    expect(result.contactEmail).toBe(null);
  });
});

