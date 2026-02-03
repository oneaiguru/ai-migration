/**
 * Tests for scheduler service
 */
const request = require('supertest');
const app = require('../src/app');
const scheduler = require('../src/services/scheduler');
const config = require('../src/config');

// Mock API Key for testing
const API_KEY = config.security.apiKey || 'test-api-key';

describe('Scheduler Routes', () => {
  beforeEach(() => {
    // Mock the scheduler service methods
    scheduler.runInvoiceCreationNow = jest.fn().mockResolvedValue({
      success: true,
      processed: 5,
      successful: 4,
      failed: 1
    });
    
    scheduler.runPaymentCheckNow = jest.fn().mockResolvedValue({
      success: true,
      invoicesProcessed: 10,
      paidInvoicesFound: 3,
      invoicesUpdated: 3
    });
    
    scheduler.jobs = {
      invoiceCreation: {
        nextDate: jest.fn().mockReturnValue({
          toDate: jest.fn().mockReturnValue(new Date())
        })
      },
      paymentCheck: {
        nextDate: jest.fn().mockReturnValue({
          toDate: jest.fn().mockReturnValue(new Date())
        })
      }
    };
  });

  it('should require API key authentication', async () => {
    const res = await request(app).post('/scheduler/invoice-creation');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should trigger invoice creation job', async () => {
    const res = await request(app)
      .post('/scheduler/invoice-creation')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(scheduler.runInvoiceCreationNow).toHaveBeenCalled();
  });
  
  it('should trigger payment check job', async () => {
    const res = await request(app)
      .post('/scheduler/payment-check')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(scheduler.runPaymentCheckNow).toHaveBeenCalled();
  });
  
  it('should get scheduler status', async () => {
    const res = await request(app)
      .get('/scheduler/status')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.jobs).toBeInstanceOf(Array);
    expect(res.body.jobs.length).toBe(2); // invoiceCreation and paymentCheck
  });
  
  it('should handle errors in invoice creation', async () => {
    // Set up the mock to reject with an error
    scheduler.runInvoiceCreationNow = jest.fn().mockRejectedValue(
      new Error('Test error')
    );
    
    const res = await request(app)
      .post('/scheduler/invoice-creation')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });
  
  it('should handle errors in payment check', async () => {
    // Set up the mock to reject with an error
    scheduler.runPaymentCheckNow = jest.fn().mockRejectedValue(
      new Error('Test error')
    );
    
    const res = await request(app)
      .post('/scheduler/payment-check')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });
});

describe('Scheduler Service', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.resetAllMocks();
  });
  
  it('should start and stop the scheduler', () => {
    // Mock scheduler methods
    scheduler.setupInvoiceCreationJob = jest.fn();
    scheduler.setupPaymentCheckJob = jest.fn();
    scheduler.jobs = {
      invoiceCreation: { stop: jest.fn() },
      paymentCheck: { stop: jest.fn() }
    };
    
    // Test start method
    scheduler.start();
    expect(scheduler.setupInvoiceCreationJob).toHaveBeenCalled();
    expect(scheduler.setupPaymentCheckJob).toHaveBeenCalled();
    
    // Test stop method
    scheduler.stop();
    expect(scheduler.jobs.invoiceCreation.stop).toHaveBeenCalled();
    expect(scheduler.jobs.paymentCheck.stop).toHaveBeenCalled();
  });
});