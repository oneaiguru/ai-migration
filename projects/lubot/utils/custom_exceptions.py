# utils/custom_exceptions.py
# Base exception class for the bot application
class BotException(Exception):
    """Base exception class for the bot application."""
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DatabaseException(Exception):
    """Exception raised for database-related errors."""
    pass

class AIException(BotException):
    """Exception raised for AI-related errors."""
    pass

class RateLimitException(BotException):
    """Exception raised when rate limit is exceeded."""
    def __init__(self, message='Rate limit exceeded'):
        super().__init__(message, status_code=429)

class ValidationError(BotException):
    """Exception raised for validation errors in input data."""
    def __init__(self, message='Validation error'):
        super().__init__(message, status_code=422)

class RelationshipBotError(Exception):
    """Base class for RelationshipBot exceptions"""
    pass

class AIModelError(RelationshipBotError):
    """Raised when there's an error with the AI model"""
    pass
