# Error Handling Pattern

This document defines standard error handling patterns to be used throughout the TaskFlow.ai system.

## Error Structure

All errors should follow this standard structure:

```javascript
{
  code: "ERROR_TYPE",  // Uppercase snake_case error code
  message: "Human-readable error message",
  details: { ... }     // Optional object with additional details
}
```

## Error Categories

We organize errors into these categories:

1. **Validation Errors** (codes prefixed with `VALIDATION_`)
   - Input validation failures
   - Data constraint violations

2. **Authentication Errors** (codes prefixed with `AUTH_`)
   - Login failures
   - Token issues
   - Permission denied

3. **Resource Errors** (codes prefixed with `RESOURCE_`)
   - Not found
   - Already exists
   - Conflict states

4. **Service Errors** (codes prefixed with `SERVICE_`)
   - External service failures
   - Timeouts
   - Integration issues

5. **System Errors** (codes prefixed with `SYSTEM_`)
   - Internal errors
   - Unexpected states
   - Database failures

## Implementation Pattern

### API Controllers

```javascript
async function handleRequest(req, res) {
  try {
    // Request processing
    const result = await someService.doSomething();
    return res.json({ success: true, data: result });
  } catch (error) {
    // Convert to standard error format
    const standardError = convertToStandardError(error);
    
    // Log appropriately
    if (standardError.code.startsWith('SYSTEM_')) {
      logger.error('System error occurred', { error: standardError, stack: error.stack });
    } else {
      logger.info('Client error occurred', { code: standardError.code });
    }
    
    // Determine HTTP status
    const status = getStatusForErrorCode(standardError.code);
    
    // Send standardized response
    return res.status(status).json({
      success: false,
      error: standardError
    });
  }
}
```

### Error Utilities

We provide these utility functions:

1. `createError(code, message, details)` - Create a standard error
2. `convertToStandardError(error)` - Convert any error to standard format
3. `getStatusForErrorCode(code)` - Map error codes to HTTP status codes

### Mobile-Desktop Error Handling

For the mobile-desktop bridge:

1. **Synchronization Errors**
   - Handle network connectivity issues gracefully
   - Provide clear error messages for Git conflicts
   - Implement automatic retry mechanisms where appropriate

2. **Environment-Specific Errors**
   - Mobile: Handle limited permissions and capabilities
   - Desktop: Handle missing tools or dependencies

3. **User Recovery Paths**
   - Always provide a clear way for users to recover from errors
   - Save in-progress work whenever possible
   - Include troubleshooting steps in error messages

## Client-Side Handling

When handling errors on the client side:

1. Check the `success` flag on all responses
2. Display user-friendly messages based on error codes
3. Implement automatic retry for transient errors
4. Redirect to login for authentication errors
