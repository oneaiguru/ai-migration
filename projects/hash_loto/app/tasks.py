import logging

from celery import Celery

from .database import update_bet_outcome
from .utils import get_latest_bitcoin_hash, is_outcome_odd

logger = logging.getLogger(__name__)

app = Celery("tasks", broker="redis://localhost:6379/0")


@app.task
def update_bet_results():
    latest_hash = get_latest_bitcoin_hash()
    if not latest_hash:
        logger.warning("Skipping bet update: no latest hash available")
        return
    is_odd = is_outcome_odd(latest_hash)
    update_bet_outcome(is_odd)
