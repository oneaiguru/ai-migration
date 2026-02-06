# main.py
from dotenv import load_dotenv
load_dotenv()  # Make sure this comes first

import asyncio
import logging
import sys
import os
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import Message
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

from config.settings import Settings
from bot.commands import register_commands
from bot.conversation import start_conversation, help_command
from database.session import init_db, close_db
from utils.logger import setup_logger
from utils.exceptions import DatabaseError
from bot.middleware.security import SecurityMiddleware

# Configure logging
setup_logger()
logger = logging.getLogger(__name__)

async def main():
    """Main entry point for the bot application"""
    try:
        # Load settings
        settings = Settings()
        logger.info("Settings loaded successfully and token configured")

        if not settings.TELEGRAM_TOKEN:
            raise ValueError("TELEGRAM_TOKEN must be configured before starting the bot")

        # Initialize bot and dispatcher
        storage = MemoryStorage()
        bot = Bot(token=settings.TELEGRAM_TOKEN)
        dp = Dispatcher(storage=storage)

        # Apply middleware to all handlers
        dp.message.middleware(SecurityMiddleware())
        dp.callback_query.middleware(SecurityMiddleware())

        # Register command handlers
        register_commands(dp)

        logger.info("Security middleware registered")

        # Initialize database with explicit database URL
        logger.info("Initializing database connection")
        try:
            await init_db(settings.DATABASE_URL)
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.critical(f"Failed to initialize database: {e}")
            raise DatabaseError(f"Database initialization failed: {e}")

        # Log successful setup
        logger.info("Sherlock AI Detective Bot initialized and ready")

        # Register signal handlers on the running loop for graceful shutdown
        if sys.platform != 'win32':
            import signal
            loop = asyncio.get_running_loop()
            for sig_name in ('SIGINT', 'SIGTERM'):
                sig = getattr(signal, sig_name)
                loop.add_signal_handler(sig, lambda s=sig: asyncio.create_task(shutdown(s)))
            logger.info("Signal handlers registered")

        # Start polling
        logger.info("Starting bot polling")
        await dp.start_polling(bot)

    except Exception as e:
        logger.critical(f"Critical error starting bot: {e}", exc_info=True)
        # Send notification of failure (in a production app, you might want to send an email or other alert)
        sys.exit(1)

async def shutdown(signal_type=None):
    """Graceful shutdown procedure"""
    logger.info(f"Received shutdown signal: {signal_type}")

    try:
        # Close database connections
        logger.info("Closing database connections")
        await close_db()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

    # Close any other resources here

    logger.info("Shutdown complete")

if __name__ == "__main__":
    try:
        # Start the bot
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.warning("Bot stopped by keyboard interrupt")
    except Exception as e:
        logger.critical(f"Unhandled exception: {e}", exc_info=True)
    finally:
        # Ensure proper cleanup
        try:
            asyncio.run(shutdown())
        except Exception as e:
            logger.error(f"Error during final cleanup: {e}")

        # Exit with error code if there was an exception
        if sys.exc_info()[0] is not None:
            sys.exit(1)
