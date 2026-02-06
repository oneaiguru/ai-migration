import logging
from typing import Optional

import requests

logger = logging.getLogger(__name__)


def get_latest_bitcoin_hash() -> Optional[str]:
    """Fetch the latest Bitcoin block hash with basic error handling."""
    try:
        response = requests.get("https://blockchain.info/rawblock/latest", timeout=5)
        response.raise_for_status()
        data = response.json()
        return data.get("hash")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to fetch latest Bitcoin hash: %s", exc)
        return None


def is_outcome_odd(block_hash: str) -> bool:
    """Return True if the last digit of the hash is odd."""
    try:
        last_digit = int(block_hash[-1])
        return last_digit % 2 == 1
    except Exception as exc:  # noqa: BLE001
        logger.warning("Invalid block hash %s: %s", block_hash, exc)
        return False


def is_too_close_to_draw() -> bool:
    # Placeholder for scheduling logic; always allow for now.
    return False
