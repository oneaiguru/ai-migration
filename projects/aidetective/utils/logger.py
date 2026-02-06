import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path
import functools
import time
from datetime import datetime

from config.settings import Settings

# ANSI color codes for terminal output
COLORS = {
    'DEBUG': '\033[36m',     # Cyan
    'INFO': '\033[32m',      # Green
    'WARNING': '\033[33m',   # Yellow
    'ERROR': '\033[31m',     # Red
    'CRITICAL': '\033[41m',  # Red background
    'RESET': '\033[0m'       # Reset
}

class ColoredFormatter(logging.Formatter):
    """Custom formatter to add colors to console logs"""

    def format(self, record):
        """Add colors to the log record"""
        levelname = record.levelname
        message = super().format(record)

        # Add color if the levelname is in our colors dictionary
        if levelname in COLORS:
            return f"{COLORS[levelname]}{message}{COLORS['RESET']}"
        return message

def setup_logger():
    """Configure application logging

    Sets up console and file logging with appropriate formatting and log levels
    based on application settings. Ensures log directories exist and implements
    proper log rotation.
    """
    settings = Settings()

    # Get log level from settings
    log_level = getattr(logging, settings.LOG_LEVEL, logging.INFO)

    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Configure formatters
    console_formatter = ColoredFormatter(
        "%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    file_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers to avoid duplicates
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Add console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # Check disk space before adding file handler
    try:
        # Check if we have at least 100MB free
        if os.path.exists(log_dir) and os.statvfs(log_dir).f_bavail * os.statvfs(log_dir).f_frsize < 100 * 1024 * 1024:
            # If disk space is low, log warning but continue without file logging
            root_logger.warning("Low disk space detected. File logging disabled.")
            return
    except Exception as e:
        # If stat check fails, continue but log the issue
        root_logger.warning(f"Could not check disk space: {e}. Continuing with limited logging.")

    try:
        # Add file handler with more aggressive rotation settings
        current_date = datetime.now().strftime("%Y%m%d")
        log_file = log_dir / f"sherlock_bot_{current_date}.log"
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=5 * 1024 * 1024,  # 5 MB max size
            backupCount=3,  # Keep 3 backup files max
            encoding="utf-8"
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(file_formatter)  # No colors in file logs
        root_logger.addHandler(file_handler)

        # Periodic log cleanup for old files
        cleanup_old_logs(log_dir)

    except Exception as e:
        root_logger.warning(f"Could not set up file logging: {e}. Continuing with console logging only.")

    # Set higher log level for some verbose third-party libraries
    logging.getLogger("aiogram").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("aiohttp").setLevel(logging.WARNING)

    # Log setup complete
    root_logger.info(f"Logging initialized with level: {settings.LOG_LEVEL}")

def cleanup_old_logs(log_dir, max_age_days=7):
    """Clean up old log files

    Args:
        log_dir: Directory containing log files
        max_age_days: Maximum age of log files in days
    """
    try:
        current_time = time.time()
        max_age_seconds = max_age_days * 24 * 60 * 60

        for log_file in log_dir.glob("*.log*"):
            file_age = current_time - os.path.getmtime(log_file)
            if file_age > max_age_seconds:
                try:
                    os.remove(log_file)
                    logging.debug(f"Removed old log file: {log_file}")
                except OSError:
                    # Ignore if file can't be removed
                    pass
    except Exception as e:
        logging.warning(f"Error cleaning up old logs: {e}")

def get_logger(name):
    """Get a logger with the given name

    Args:
        name: Logger name, typically __name__ of the calling module

    Returns:
        Logger instance
    """
    return logging.getLogger(name)

def async_log_decorator(func):
    """Decorator to catch and log exceptions in async functions

    Args:
        func: The async function to decorate

    Returns:
        Decorated function
    """
    @functools.wraps(func)
    async def async_wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__module__)
        try:
            result = await func(*args, **kwargs)
            return result
        except Exception as e:
            logger.exception(f"Error in {func.__name__}: {str(e)}")
            raise
    return async_wrapper

def sync_log_decorator(func):
    """Decorator to catch and log exceptions in sync functions

    Args:
        func: The sync function to decorate

    Returns:
        Decorated function
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__module__)
        try:
            result = func(*args, **kwargs)
            return result
        except Exception as e:
            logger.exception(f"Error in {func.__name__}: {str(e)}")
            raise
    return wrapper