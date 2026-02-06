/**
 * Tests for logger utility
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Mock fs.existsSync and fs.mkdirSync
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

// Mock winston
jest.mock('winston', () => {
  const mockFormat = {
    combine: jest.fn().mockReturnValue('combined-format'),
    timestamp: jest.fn().mockReturnValue('timestamp-format'),
    printf: jest.fn().mockReturnValue('printf-format'),
    colorize: jest.fn().mockReturnValue('colorize-format')
  };
  
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };
  
  return {
    format: mockFormat,
    createLogger: jest.fn().mockReturnValue(mockLogger),
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  };
});

describe('Logger', () => {
  // Clear the cache to re-initialize the logger
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });
  
  it('should create logs directory if it does not exist', () => {
    // Mock directory not existing
    fs.existsSync.mockReturnValueOnce(false);
    
    // Re-import logger to trigger directory creation
    const logger = require('../src/utils/logger');
    
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.mkdirSync.mock.calls[0][0]).toContain('logs');
    expect(fs.mkdirSync.mock.calls[0][1]).toEqual({ recursive: true });
  });
  
  it('should not create logs directory if it already exists', () => {
    // Mock directory existing
    fs.existsSync.mockReturnValueOnce(true);
    
    // Re-import logger
    const logger = require('../src/utils/logger');
    
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
  
  it('should configure winston logger with correct transport and format', () => {
    // Re-import logger
    const logger = require('../src/utils/logger');
    
    // Check winston configuration
    expect(winston.format.combine).toHaveBeenCalled();
    expect(winston.format.timestamp).toHaveBeenCalled();
    expect(winston.format.printf).toHaveBeenCalled();
    
    // Check if createLogger was called
    expect(winston.createLogger).toHaveBeenCalled();
    
    // Check if transports were created
    expect(winston.transports.Console).toHaveBeenCalled();
    expect(winston.transports.File).toHaveBeenCalledTimes(2); // error log and combined log
  });
  
  it('should set log level based on NODE_ENV', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    
    // Test development environment
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    const devLogger = require('../src/utils/logger');
    expect(winston.createLogger.mock.calls[0][0].level).toBe('debug');
    
    // Test production environment
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const prodLogger = require('../src/utils/logger');
    expect(winston.createLogger.mock.calls[1][0].level).toBe('info');
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });
  
  it('should have the expected logging methods', () => {
    // Re-import logger
    const logger = require('../src/utils/logger');
    
    // Check for logging methods
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });
});