import os
from dotenv import load_dotenv

from typing import NamedTuple

# Load environment variables from .env file
load_dotenv()


class BotConfig(NamedTuple):
    GENDER_SELECTION: str = "GENDER_SELECTION"
    CHATBOT_SELECTION: str = "CHATBOT_SELECTION"


# Create singleton instance
bot_config = BotConfig()

# Redis Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))
REDIS_CHANNEL = os.getenv('REDIS_CHANNEL', 'prompt_updates')


# Configuration variables for direct use
TELEGRAM_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
ASYNC_DATABASE_URL = os.getenv('DATABASE_URL')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PREDIBASE_API_KEY = os.getenv('PREDIBASE_API_KEY')
BRAINTRUST_API_KEY = os.getenv('BRAINTRUST_API_KEY', '').strip()


# Configuration dictionary for structured access
config = {
    'referral': {
        'bonus_amount': float(os.getenv('REFERRAL_BONUS_AMOUNT', 10.0)),
        'code_length': int(os.getenv('REFERRAL_CODE_LENGTH', 8)),
        'expiration_days': int(os.getenv('REFERRAL_CODE_EXPIRATION_DAYS', 30)),
    },

    # Include other structured settings as needed
}

# Max message length and token limits
MAX_MESSAGE_LENGTH = int(os.getenv('MAX_MESSAGE_LENGTH', 1000))
TOKEN_LIMIT = int(os.getenv('TOKEN_LIMIT', 10000))

# Model prices structured
MODEL_PRICES = {
    'gpt-4o': {
        'input': float(os.getenv('GPT4O_INPUT_PRICE', 3.75)) / 1_000_000,
        'output': float(os.getenv('GPT4O_OUTPUT_PRICE', 15.00)) / 1_000_000
    },
    'gpt-4o-mini': {
        'input': float(os.getenv('GPT4O_MINI_INPUT_PRICE', 0.15)) / 1_000_000,
        'output': float(os.getenv('GPT4O_MINI_OUTPUT_PRICE', 0.60)) / 1_000_000
    }
}
