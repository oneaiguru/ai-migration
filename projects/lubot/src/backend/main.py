import asyncio
from bot.telegram_bot_manager import TelegramBotManager
from utils.logger import get_logger, setup_logger  # Import setup_logger
from config.settings import BRAINTRUST_API_KEY
from braintrust import init_logger
from config.settings import DATABASE_URL
import logging

async def main():
    # Initialize logger
    setup_logger('root', level=logging.INFO)
    logger = get_logger(__name__)
    
    # Initialize BrainTrust logger
    bt_logger = init_logger(
        project="lobo",
        api_key=BRAINTRUST_API_KEY,
        async_flush=True,
    )
    
    # Initialize TelegramBotManager
    bot_manager = TelegramBotManager(bt_logger)
    await bot_manager.start_bots()
    
    # Handle graceful shutdown
    try:
        while True:
            await asyncio.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Received shutdown signal. Stopping bots...")
    finally:
        bot_manager.stop_bots()
        if bt_logger:
            await bt_logger.flush()

if __name__ == "__main__":
    asyncio.run(main())
