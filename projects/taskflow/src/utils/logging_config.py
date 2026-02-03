import logging
import logging.handlers
from pathlib import Path


def configure_logging(level=logging.INFO, log_file="taskflow.log"):
    """Configure logging for the application."""
    Path("logs").mkdir(exist_ok=True)

    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(f"logs/{log_file}"),
            logging.StreamHandler(),
        ],
    )

    return logging.getLogger(__name__)

