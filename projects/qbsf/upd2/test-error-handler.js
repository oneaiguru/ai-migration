/**
 * Tests for error-handler middleware
 */
const { errorHandler, notFound, apiKeyAuth, AppError } = require('../src/middleware/error-handler');

describe('Error Handler Middleware', () => {
  // Mock request, response, and next
  let req, res, next;
  
  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET',
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock logger to prevent actual logging during tests
    jest.mock('../src/utils/logger', () => ({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    }));
  });
  
  it('should format and return errors', () => {
    const err = new Error('Test error');
    err.statusCode = 400;
    err.code = 'TEST_ERROR';
    
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    // Set to production to test without stack trace
    process.env.NODE_ENV = 'production';
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Test error',
        code: 'TEST_ERROR'
      }
    });
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  it('should include stack trace in development mode', () => {
    const err = new Error('Test error');
    err.stack = 'Error: Test error\n    at <anonymous>:1:1';
    
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    // Set to development to test with stack trace
    process.env.NODE_ENV = 'development';
    
    errorHandler(err, req, res, next);
    
    expect(res.json.mock.calls[0][0].error.stack).toBeDefined();
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  it('should use default status code and error code if not provided', () => {
    const err = new Error('Test error');
    
    errorHandler(err, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].error.code).toBe('INTERNAL_SERVER_ERROR');
  });
  
  it('should create 404 not found errors', () => {
    req.originalUrl = '/nonexistent';
    
    notFound(req, res, next);
    
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });
  
  it('should validate API keys', () => {
    // Save original API_KEY
    const originalApiKey = process.env.API_KEY;
    // Set a test API key
    process.env.API_KEY = 'test-api-key';
    
    // Test with valid API key
    req.headers['x-api-key'] = 'test-api-key';
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next.mock.calls[0][0]).toBeUndefined();
    
    // Reset next mock
    next.mockReset();
    
    // Test with invalid API key
    req.headers['x-api-key'] = 'wrong-api-key';
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('INVALID_API_KEY');
    
    // Test with missing API key
    next.mockReset();
    req.headers['x-api-key'] = undefined;
    apiKeyAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    const missingError = next.mock.calls[0][0];
    expect(missingError).toBeInstanceOf(AppError);
    expect(missingError.statusCode).toBe(401);
    
    // Restore original API_KEY
    process.env.API_KEY = originalApiKey;
  });
  
  it('should create AppError with correct properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR', ['field1', 'field2']);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.validationErrors).toEqual(['field1', 'field2']);
    expect(error.stack).toBeDefined();
  });
});