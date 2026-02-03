import functools
import time
import logging

def retry_operation(max_retries=3, delay_base=1, logger=None):
    """
    Decorator that implements retry logic with exponential backoff.
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            last_exception = None
            while retries <= max_retries:  # Changed < to <= to match test expectations
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if retries < max_retries:  # Only sleep if we're going to retry
                        delay = delay_base * (2 ** retries)
                        if logger:
                            logger.warning(f"Attempt {retries + 1} failed, retrying in {delay}s: {str(e)}")
                        time.sleep(delay)
                    retries += 1

            if logger:
                logger.error(f"Failed after {max_retries} retries: {str(last_exception)}")
            raise last_exception
        return wrapper
    return decorator