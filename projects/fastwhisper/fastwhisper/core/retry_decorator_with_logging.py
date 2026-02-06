import functools
import time
import logging
from logging import handlers

def retry_operation_with_logging(max_retries=3, logger=None):
    """
    Decorator to retry a function with structured logging and exponential backoff.

    Args:
        max_retries (int): Maximum number of retries.
        logger (logging.Logger): Structured logger for logging retries (optional).
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            last_exception = None  # Store the last exception
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    retries += 1
                    backoff_time = 2 ** retries  # Exponential backoff
                    if logger:
                        logger.warning(
                            f"RETRY {retries}/{max_retries} - Function: {func.__name__} - "
                            f"Args: {args}, Kwargs: {kwargs} - Exception: {e} - Backoff: {backoff_time}s"
                        )
                    time.sleep(backoff_time)  # Apply backoff
            if last_exception:
                if logger:
                    logger.error(
                        f"FAILED after {max_retries} retries - Function: {func.__name__} - "
                        f"Args: {args}, Kwargs: {kwargs} - Last Exception: {last_exception}"
                    )
                raise last_exception  # Re-raise the last exception after retries
        return wrapper
    return decorator


def configure_logger(
    log_file: str = "system.log",
    max_bytes: int = 5 * 1024 * 1024,  # 5 MB
    backup_count: int = 3,
    log_level: int = logging.DEBUG,
) -> logging.Logger:
    """
    Configures a logger to log messages to both the console and a file with rotation.

    Args:
        log_file (str): Path to the log file.
        max_bytes (int): Maximum size of the log file before rotation.
        backup_count (int): Number of backup files to keep.
        log_level (int): Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).

    Returns:
        logging.Logger: Configured logger.
    """
    # Create logger
    logger = logging.getLogger("structured_logger")
    logger.setLevel(log_level)

    # Log format
    log_format = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(message)s"
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(log_format)

    # File handler with rotation
    file_handler = handlers.RotatingFileHandler(
        log_file, maxBytes=max_bytes, backupCount=backup_count
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(log_format)

    # Add handlers to the logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
