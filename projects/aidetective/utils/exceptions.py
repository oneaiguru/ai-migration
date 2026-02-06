# utils/exceptions.py

class SherlockBotError(Exception):
    """Base exception for Sherlock Bot"""
    
    def __init__(self, message="An error occurred in the Sherlock Bot"):
        self.message = message
        super().__init__(self.message)

class DatabaseError(SherlockBotError):
    """Exception raised for database errors"""
    
    def __init__(self, message="Database error occurred"):
        self.message = message
        super().__init__(self.message)

class AIClientError(SherlockBotError):
    """Exception raised for AI client errors"""
    
    def __init__(self, message="AI client error occurred"):
        self.message = message
        super().__init__(self.message)

class StoryError(SherlockBotError):
    """Exception raised for story engine errors"""
    
    def __init__(self, message="Story engine error occurred"):
        self.message = message
        super().__init__(self.message)

class MediaError(SherlockBotError):
    """Exception raised for media handling errors"""
    
    def __init__(self, message="Media handling error occurred"):
        self.message = message
        super().__init__(self.message)

class InvalidStateError(SherlockBotError):
    """Exception raised for invalid state transitions"""
    
    def __init__(self, message="Invalid state transition"):
        self.message = message
        super().__init__(self.message)

class UserError(SherlockBotError):
    """Exception raised for user-related errors"""
    
    def __init__(self, message="User error occurred"):
        self.message = message
        super().__init__(self.message)

class ConfigError(SherlockBotError):
    """Exception raised for configuration errors"""
    
    def __init__(self, message="Configuration error occurred"):
        self.message = message
        super().__init__(self.message)

def handle_exception(func):
    """Decorator to handle exceptions in bot handlers
    
    Catches exceptions, logs them, and returns a user-friendly error message
    
    Args:
        func: The function to decorate
        
    Returns:
        Decorated function
    """
    import logging
    import functools
    import traceback
    from aiogram.types import Message, CallbackQuery
    
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except SherlockBotError as e:
            # Find the messaging object explicitly by type checking
            message = None
            for arg in args:
                if isinstance(arg, Message):
                    message = arg
                    break
                elif isinstance(arg, CallbackQuery):
                    message = arg.message
                    break
            
            # Log the error
            logging.error(f"Handled error in {func.__name__}: {str(e)}")
            
            # Send error message to user if possible
            if message and hasattr(message, 'answer'):
                await message.answer(f"Произошла ошибка: {str(e)}")
            
            return None
        except Exception as e:
            # Find the messaging object explicitly by type checking
            message = None
            for arg in args:
                if isinstance(arg, Message):
                    message = arg
                    break
                elif isinstance(arg, CallbackQuery):
                    message = arg.message
                    break
            
            # Log the unhandled error
            logging.error(f"Unhandled error in {func.__name__}: {str(e)}")
            logging.error(traceback.format_exc())
            
            # Send generic error message to user if possible
            if message and hasattr(message, 'answer'):
                await message.answer(
                    "Произошла неизвестная ошибка. Пожалуйста, попробуйте позже или обратитесь к администратору."
                )
            
            return None
    
    return wrapper
