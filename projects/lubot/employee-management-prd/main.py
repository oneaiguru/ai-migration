
# main.py
import asyncio
import signal
from bot.telegram_bot_manager import TelegramBotManager
from utils.logger import setup_logger
import logging

async def shutdown(signal, loop, bot_manager):
    """Cleanup tasks tied to the service's shutdown."""
    logging.info(f"Received exit signal {signal.name}...")
    logging.info("Closing database connections...")
    logging.info("Shutting down bot manager...")
    await bot_manager.stop_bots()
    tasks = [t for t in asyncio.all_tasks() if t is not asyncio.current_task()]
    [task.cancel() for task in tasks]
    logging.info(f"Cancelling {len(tasks)} outstanding tasks")
    await asyncio.gather(*tasks, return_exceptions=True)
    loop.stop()

def handle_exception(loop, context):
    msg = context.get("exception", context["message"])
    logging.error(f"Caught exception: {msg}")
    logging.info("Shutting down...")
    asyncio.create_task(shutdown(signal.SIGTERM, loop))

async def main():
    # Setup logging
    logger = setup_logger('root', level=logging.INFO)
    bt_logger = logger
    
    # Get the current event loop
    loop = asyncio.get_running_loop()
    
    # Add signal handlers
    signals = (signal.SIGHUP, signal.SIGTERM, signal.SIGINT)
    bot_manager = None
    
    try:
        # Initialize bot manager
        bot_manager = TelegramBotManager(bt_logger)
        
        # Add signal handlers
        for s in signals:
            loop.add_signal_handler(
                s, 
                lambda s=s: asyncio.create_task(shutdown(s, loop, bot_manager))
            )
        
        # Set exception handler
        loop.set_exception_handler(handle_exception)
        
        # Start bot manager
        await bot_manager.start_bots()
        
        # Keep the loop running
        while True:
            await asyncio.sleep(3600)  # Sleep for an hour
            
    except Exception as e:
        logger.error(f"Failed to start or run bots: {str(e)}", exc_info=True)
        if bot_manager:
            await bot_manager.stop_bots()
        raise
    finally:
        logger.info("Cleanup complete.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Process interrupted by user")
    except Exception as e:
        logging.error(f"Process terminated with error: {e}")