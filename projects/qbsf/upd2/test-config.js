/**
 * Tests for configuration module
 */

describe('Config', () => {
  // Save original environment variables
  const originalEnv = { ...process.env };
  
  beforeEach(() => {
    // Clear cache to reload config
    jest.resetModules();
    // Reset environment variables
    process.env = { ...originalEnv };
  });
  
  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  it('should load default values when environment variables are not set', () => {
    // Clear specific environment variables
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.MIDDLEWARE_BASE_URL;
    delete process.env.SF_LOGIN_URL;
    delete process.env.QB_ENVIRONMENT;
    delete process.env.INVOICE_CREATION_CRON;
    delete process.env.PAYMENT_CHECK_CRON;
    
    const config = require('../src/config');
    
    expect(config.server.port).toBe(3000);
    expect(config.server.env).toBe('development');
    expect(config.server.baseUrl).toBe('http://localhost:3000');
    expect(config.salesforce.loginUrl).toBe('https://login.salesforce.com');
    expect(config.quickbooks.environment).toBe('sandbox');
    expect(config.scheduler.invoiceCreationCron).toBe('0 */2 * * *');
    expect(config.scheduler.paymentCheckCron).toBe('0 1 * * *');
  });
  
  it('should use environment variables when set', () => {
    // Set environment variables
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.MIDDLEWARE_BASE_URL = 'https://example.com';
    process.env.SF_CLIENT_ID = 'sf-client-id';
    process.env.SF_CLIENT_SECRET = 'sf-client-secret';
    process.env.SF_REDIRECT_URI = 'https://example.com/auth/salesforce/callback';
    process.env.SF_LOGIN_URL = 'https://test.salesforce.com';
    process.env.QB_CLIENT_ID = 'qb-client-id';
    process.env.QB_CLIENT_SECRET = 'qb-client-secret';
    process.env.QB_REDIRECT_URI = 'https://example.com/auth/quickbooks/callback';
    process.env.QB_ENVIRONMENT = 'production';
    process.env.API_KEY = 'test-api-key';
    process.env.TOKEN_ENCRYPTION_KEY = 'test-encryption-key';
    process.env.INVOICE_CREATION_CRON = '0 */4 * * *';
    process.env.PAYMENT_CHECK_CRON = '0 2 * * *';
    
    const config = require('../src/config');
    
    expect(config.server.port).toBe('4000');
    expect(config.server.env).toBe('production');
    expect(config.server.baseUrl).toBe('https://example.com');
    expect(config.salesforce.clientId).toBe('sf-client-id');
    expect(config.salesforce.clientSecret).toBe('sf-client-secret');
    expect(config.salesforce.redirectUri).toBe('https://example.com/auth/salesforce/callback');
    expect(config.salesforce.loginUrl).toBe('https://test.salesforce.com');
    expect(config.quickbooks.clientId).toBe('qb-client-id');
    expect(config.quickbooks.clientSecret).toBe('qb-client-secret');
    expect(config.quickbooks.redirectUri).toBe('https://example.com/auth/quickbooks/callback');
    expect(config.quickbooks.environment).toBe('production');
    expect(config.security.apiKey).toBe('test-api-key');
    expect(config.security.tokenEncryptionKey).toBe('test-encryption-key');
    expect(config.scheduler.invoiceCreationCron).toBe('0 */4 * * *');
    expect(config.scheduler.paymentCheckCron).toBe('0 2 * * *');
  });
  
  it('should have the expected structure', () => {
    const config = require('../src/config');
    
    // Check server section
    expect(config.server).toBeDefined();
    expect(config.server.port).toBeDefined();
    expect(config.server.env).toBeDefined();
    expect(config.server.baseUrl).toBeDefined();
    
    // Check salesforce section
    expect(config.salesforce).toBeDefined();
    expect(config.salesforce.loginUrl).toBeDefined();
    
    // Check quickbooks section
    expect(config.quickbooks).toBeDefined();
    expect(config.quickbooks.environment).toBeDefined();
    
    // Check security section
    expect(config.security).toBeDefined();
    expect(config.security.apiKey).toBeDefined();
    expect(config.security.tokenEncryptionKey).toBeDefined();
    
    // Check scheduler section
    expect(config.scheduler).toBeDefined();
    expect(config.scheduler.invoiceCreationCron).toBeDefined();
    expect(config.scheduler.paymentCheckCron).toBeDefined();
  });
});