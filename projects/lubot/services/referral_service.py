
from telegram import Bot
from telegram.error import TelegramError
from database.referral_repository import AsyncReferralRepository  # Updated import
from database.chatbot_repository import ChatbotRepository
from database.user_repository import AsyncUserRepository  # Updated import
from utils.logger import get_logger
from utils.custom_exceptions import AIException
from utils.localization import get_text

class AsyncReferralService:  # Renamed to AsyncReferralService
    def __init__(self):
        self.user_repository = AsyncUserRepository()  # Updated instantiation
        self.referral_repository = AsyncReferralRepository()  # Updated instantiation
        self.chatbot_repository = ChatbotRepository()
        self.logger = get_logger(__name__)

    async def generate_referral_link(self, user_id: int, chatbot_id: int) -> str:  # Made async
        try:
            chatbot_id = int(chatbot_id)
            code = await self.referral_repository.get_or_create_referral_code(user_id, chatbot_id)
            bot_username = await self.get_bot_username(chatbot_id)
            return get_text('referral_link', bot_username=bot_username, code=code)
        except ValueError as e:
            self.logger.error(f"Invalid chatbot_id: {str(e)}")
            raise AIException(get_text("invalid_input_error"))
        except Exception as e:
            self.logger.error(f"Error generating referral link: {str(e)}")
            raise AIException(get_text("error_generating_referral_link"))

    async def get_bot_username(self, chatbot_id: int) -> str:  # Made async
        chatbot = await self.chatbot_repository.get_chatbot(chatbot_id)
        if not chatbot:
            raise AIException("Chatbot not found")
        
        try:
            bot = Bot(token=chatbot.telegram_token)
            bot_info = await bot.get_me()  # Already async
            return bot_info.username
        except TelegramError as e:
            self.logger.error(f"Error getting bot info: {str(e)}")
            raise AIException("Error retrieving bot information")

    async def get_referral_status(self, user_id: int, chatbot_id: int) -> str:  # Made async
        try:
            user_data = await self.referral_repository.get_user_referral_data(user_id, chatbot_id)
            if not user_data['referral_count']:
                return get_text('no_referrals_yet')
            return get_text('referral_status', 
                          count=user_data['referral_count'], 
                          bonus=user_data['referral_bonus_balance'])
        except Exception as e:
            self.logger.error(f"Error getting referral status: {str(e)}")
            raise AIException(get_text("error_getting_referral_status"))
