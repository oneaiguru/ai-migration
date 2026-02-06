/**
 * Tests for webhook routes
 */
const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config');

// Mock API Key for testing
const API_KEY = config.security.apiKey || 'test-api-key';

describe('Webhook Routes', () => {
  it('should require API key authentication for Salesforce webhook', async () => {
    const res = await request(app)
      .post('/webhook/salesforce/opportunity')
      .send({
        event: 'opportunity.update',
        data: { id: '123' }
      });
      
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
  
  it('should require API key authentication for QuickBooks webhook', async () => {
    const res = await request(app)
      .post('/webhook/quickbooks/invoice')
      .send({
        event: 'invoice.update',
        data: { id: '123' }
      });
      
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
  
  it('should require event and data for Salesforce webhook', async () => {
    const res = await request(app)
      .post('/webhook/salesforce/opportunity')
      .set('X-API-Key', API_KEY)
      .send({
        // Missing event and data
      });
      
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  
  it('should require event and data for QuickBooks webhook', async () => {
    const res = await request(app)
      .post('/webhook/quickbooks/invoice')
      .set('X-API-Key', API_KEY)
      .send({
        // Missing event and data
      });
      
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  
  it('should process Salesforce webhook successfully', async () => {
    const res = await request(app)
      .post('/webhook/salesforce/opportunity')
      .set('X-API-Key', API_KEY)
      .send({
        event: 'opportunity.update',
        data: { id: '123', stage: 'Closed Won' }
      });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeDefined();
  });
  
  it('should process QuickBooks webhook successfully', async () => {
    const res = await request(app)
      .post('/webhook/quickbooks/invoice')
      .set('X-API-Key', API_KEY)
      .send({
        event: 'invoice.update',
        data: { id: '123', status: 'Paid' }
      });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBeDefined();
  });
  
  it('should handle errors in Salesforce webhook processing', async () => {
    // Create a spy on console.error to prevent actual error logging during test
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Force an error by sending invalid JSON in the request body
    const res = await request(app)
      .post('/webhook/salesforce/opportunity')
      .set('X-API-Key', API_KEY)
      .set('Content-Type', 'application/json')
      .send('{"event": "opportunity.update", "data": {'); // Invalid JSON
      
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    
    // Restore the original console.error
    errorSpy.mockRestore();
  });
  
  it('should handle errors in QuickBooks webhook processing', async () => {
    // Create a spy on console.error to prevent actual error logging during test
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Force an error by sending invalid JSON in the request body
    const res = await request(app)
      .post('/webhook/quickbooks/invoice')
      .set('X-API-Key', API_KEY)
      .set('Content-Type', 'application/json')
      .send('{"event": "invoice.update", "data": {'); // Invalid JSON
      
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    
    // Restore the original console.error
    errorSpy.mockRestore();
  });
});