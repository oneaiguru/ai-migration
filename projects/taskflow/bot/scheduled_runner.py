#!/usr/bin/env python3
import os
import time
import subprocess
import logging
import schedule
import signal
import sys

# Allow running this file directly without package context
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)  # noqa: E402

from config import get_config  # noqa: E402

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("scheduled_runner.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Configuration
config = get_config()
CLAUDE_CHECK_INTERVAL = config.claude_check_interval

# Flag to control the main loop
running = True


def handle_exit(signum, frame):
    """Handle exit signals gracefully"""
    global running
    logger.info(f"Received signal {signum}, shutting down...")
    running = False


# Register signal handlers
signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)


def run_claude_job():
    """Run the Claude runner script"""
    logger.info("Running scheduled Claude job")
    try:
        result = subprocess.run(
            [
                "python",
                os.path.join(os.path.dirname(__file__), "claude_runner.py"),
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            logger.info("Claude job completed successfully")
            if result.stdout.strip():
                logger.info(f"Output: {result.stdout.strip()}")
        else:
            logger.error(f"Claude job failed with code {result.returncode}")
            logger.error(f"Error: {result.stderr.strip()}")

    except Exception as e:
        logger.error(f"Error running Claude job: {str(e)}")


def main():
    """Main function to set up the schedule"""
    logger.info("Starting scheduled runner...")

    # Schedule the Claude job
    if CLAUDE_CHECK_INTERVAL > 0:
        logger.info(f"Scheduling Claude job every {CLAUDE_CHECK_INTERVAL} minutes")
        schedule.every(CLAUDE_CHECK_INTERVAL).minutes.do(run_claude_job)
    else:
        logger.warning(
            "Claude check interval is set to 0 or negative. No scheduled checks will occur."
        )

    # Run job once at startup
    logger.info("Running Claude job at startup")
    run_claude_job()

    # Keep running until signaled to stop
    logger.info("Entering main loop")
    while running:
        schedule.run_pending()
        time.sleep(
            min(60, CLAUDE_CHECK_INTERVAL * 60 / 10)
        )  # Sleep for at most 1 minute, or 1/10 of the interval

    logger.info("Shutting down scheduled runner")


if __name__ == "__main__":
    main()
