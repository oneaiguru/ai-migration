import os
from typing import Optional


def get_openai_key(required: bool = False) -> Optional[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if required and not api_key:
        raise RuntimeError("OPENAI_API_KEY is required")
    return api_key


def get_telegram_token(required: bool = False) -> Optional[str]:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if required and not token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is required")
    return token


# Do not raise at import time; validation happens where the values are used.
api_key = get_openai_key(required=False)
telegram_bot_token = get_telegram_token(required=False)
