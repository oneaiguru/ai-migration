import logging
from telegram import Update
from telegram.ext import CallbackContext
from utils.custom_exceptions import BotException, DatabaseException, AIException, RateLimitException, ValidationError
from utils.localization import get_text

logger = logging.getLogger(__name__)

async def handle_error(update: Update, context: CallbackContext):
    """Centralized error handler for all modules"""
    try:
        raise context.error
    except BotException as e:
        await handle_bot_exception(update, context, e)
    except Exception as e:
        await handle_unexpected_exception(update, context, e)

async def handle_bot_exception(update: Update, context: CallbackContext, e: BotException):
    """Handle known bot exceptions"""
    if isinstance(e, DatabaseException):
        logger.error(f"Database error: {str(e)}")
        await send_error_message(update, context, get_text("database_error"))
    elif isinstance(e, AIException):
        logger.error(f"AI error: {str(e)}")
        await send_error_message(update, context, get_text("ai_error"))
    elif isinstance(e, RateLimitException):
        logger.warning(f"Rate limit exceeded: {str(e)}")
        await send_error_message(update, context, get_text("rate_limit_exceeded"))
    elif isinstance(e, ValidationError):
        logger.warning(f"Validation error: {str(e)}")
        await send_error_message(update, context, get_text("validation_error"))
    else:
        logger.error(f"Bot error: {str(e)}")
        await send_error_message(update, context, get_text("unexpected_error_response"))

async def handle_unexpected_exception(update: Update, context: CallbackContext, e: Exception):
    """Handle unexpected exceptions"""
    logger.critical(f"Unexpected error: {str(e)}", exc_info=True)
    await send_error_message(update, context, get_text("unexpected_error_response"))

async def send_error_message(update: Update, context: CallbackContext, message: str):
    """Send error message to user"""
    if update and update.effective_chat:
        try:
            await context.bot.send_message(chat_id=update.effective_chat.id, text=message)
        except Exception as e:
            logger.error(f"Failed to send error message: {str(e)}")

def handle_errors(func):
    """Decorator to handle errors in service methods"""
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger = await get_logger(func.__module__)
            logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
            raise
    return wrapper