import logging
from logging.handlers import RotatingFileHandler
from braintrust.async_logger import init_async_logger
from config.settings import BRAINTRUST_API_KEY

class LoggerManager:
    _instance = None
    
    def __init__(self):
        self.bt_logger = init_async_logger(
            project="lobo",
            api_key=BRAINTRUST_API_KEY,
            async_flush=True
        )
        self.loggers = {}

    @classmethod
    async def get_instance(cls):
        if cls._instance is None:
            cls._instance = LoggerManager()
        return cls._instance

    async def setup_logger(self, name, log_file='application.log', level=logging.INFO):
        if name in self.loggers:
            return self.loggers[name]

        logger = logging.getLogger(name)
        logger.setLevel(level)

        console_handler = logging.StreamHandler()
        console_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)

        file_handler = RotatingFileHandler(log_file, maxBytes=1024*1024, backupCount=5)
        file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

        self.loggers[name] = logger
        return logger

    async def log_analytics(self, event_type, event_data):
        try:
            await self.bt_logger.alog(event=event_type, metadata=event_data)
        except Exception as e:
            logger = await self.get_logger('analytics')
            logger.error(f"Error logging to Braintrust: {str(e)}")
        finally:
            await self.bt_logger.aflush()

    async def get_logger(self, name):
        if name not in self.loggers:
            return await self.setup_logger(name)
        return self.loggers[name]

# Global instance with async initialization
logger_manager = None

async def init_logger_manager():
    global logger_manager
    logger_manager = await LoggerManager.get_instance()

async def setup_logger(name, **kwargs):
    if logger_manager is None:
        await init_logger_manager()
    return await logger_manager.setup_logger(name, **kwargs)

async def get_logger(name):
    if logger_manager is None:
        await init_logger_manager()
    return await logger_manager.get_logger(name)

async def log_analytics(event_type, event_data):
    if logger_manager is None:
        await init_logger_manager()
    return await logger_manager.log_analytics(event_type, event_data)