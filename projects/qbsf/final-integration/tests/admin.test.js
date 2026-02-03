/**
 * Tests for admin routes
 */
const request = require('supertest');
const app = require('../src/app');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');

// Mock API Key for testing
const API_KEY = config.security.apiKey || 'test-api-key';

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn()
}));

describe('Admin Routes', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should require API key authentication', async () => {
    const res = await request(app).get('/admin/status');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
  
  it('should get admin status', async () => {
    const res = await request(app)
      .get('/admin/status')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBeDefined();
    expect(res.body.status.server).toBeDefined();
    expect(res.body.status.server.uptime).toBeDefined();
    expect(res.body.status.scheduler).toBeDefined();
  });
  
  it('should get logs when log file exists', async () => {
    // Mock file exists
    fs.existsSync.mockReturnValue(true);
    // Mock log content
    fs.readFileSync.mockReturnValue('2023-05-01T12:00:00.000Z [INFO]: Test log message\n2023-05-01T12:01:00.000Z [ERROR]: Test error message');
    
    const res = await request(app)
      .get('/admin/logs')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.logs).toBeInstanceOf(Array);
    expect(res.body.logs.length).toBe(2);
    expect(res.body.logs[0].level).toBe('INFO');
    expect(res.body.logs[1].level).toBe('ERROR');
  });
  
  it('should get empty logs when log file does not exist', async () => {
    // Mock file does not exist
    fs.existsSync.mockReturnValue(false);
    
    const res = await request(app)
      .get('/admin/logs')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.logs).toBeInstanceOf(Array);
    expect(res.body.logs.length).toBe(0);
  });
  
  it('should filter logs by level', async () => {
    // Mock file exists
    fs.existsSync.mockReturnValue(true);
    // Mock log content
    fs.readFileSync.mockReturnValue('2023-05-01T12:00:00.000Z [INFO]: Test log message\n2023-05-01T12:01:00.000Z [ERROR]: Test error message');
    
    const res = await request(app)
      .get('/admin/logs?level=ERROR')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.logs).toBeInstanceOf(Array);
    expect(res.body.logs.length).toBe(1);
    expect(res.body.logs[0].level).toBe('ERROR');
  });
  
  it('should clear logs', async () => {
    // Mock file exists
    fs.existsSync.mockReturnValue(true);
    
    const res = await request(app)
      .post('/admin/logs/clear')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
  
  it('should handle errors in status endpoint', async () => {
    // Mock process.uptime to throw an error
    const originalUptime = process.uptime;
    process.uptime = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    const res = await request(app)
      .get('/admin/status')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    
    // Restore original function
    process.uptime = originalUptime;
  });
  
  it('should handle errors in logs endpoint', async () => {
    // Mock file exists but reading throws an error
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockImplementation(() => {
      throw new Error('Test error');
    });
    
    const res = await request(app)
      .get('/admin/logs')
      .set('X-API-Key', API_KEY);
      
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});