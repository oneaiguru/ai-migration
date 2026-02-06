from telegram.ext import Application
from bot.telegram_bot import TelegramBot
from bot.relationship_bot import RelationshipBot
from database.chatbot_repository import ChatbotRepository
from database.user_repository import UserRepository
from database.referral_repository import ReferralRepository
from utils.logger import get_logger
from services.chatbot_service import ChatbotService
from database.partner_repository import PartnerRepository
import asyncio

class TelegramBotManager:
    def __init__(self, bt_logger):
        self.chatbot_repository = ChatbotRepository()
        self.chatbot_service = ChatbotService()
        self.partner_repository = PartnerRepository()
        self.bt_logger = bt_logger
        self.logger = get_logger(__name__)
        self.bots = []
        self._running = False
        self._startup_lock = asyncio.Lock()

    async def start_bots(self):
        if self._running:
            self.logger.warning("Bots are already running")
            return

        async with self._startup_lock:
            if self._running:
                return
            
            try:
                chatbots = self.chatbot_repository.get_all_chatbots()
                startup_tasks = []

                for chatbot in chatbots:
                    bot_info = await self.chatbot_service.get_bot_info(chatbot.id)
                    
                    # Create repositories
                    user_repository = UserRepository()
                    referral_repository = ReferralRepository()
                    
                    # Initialize relationship bot
                    relationship_bot = await RelationshipBot.create(
                        user_repository,
                        referral_repository,
                        self.partner_repository,
                        "bot_username",
                        chatbot.id
                    )
                    
                    # Build and initialize telegram bot
                    application = Application.builder().token(chatbot.telegram_token).build()
                    telegram_bot = TelegramBot(application, chatbot.id, relationship_bot, self.bt_logger)
                    await telegram_bot.setup()
                    
                    self.bots.append(telegram_bot)
                    startup_tasks.append(application.run_polling(allowed_updates=["message", "callback_query"]))
                    
                    self.logger.info(f"Started bot for chatbot ID {chatbot.id}")
                
                self._running = True
                
                # Run all bots concurrently
                await asyncio.gather(*startup_tasks)
                
            except Exception as e:
                self.logger.error(f"Failed to start bots: {str(e)}")
                await self.stop_bots()
                raise

    async def stop_bots(self):
        """Gracefully stop all bots and cleanup resources."""
        stop_tasks = []
        for bot in self.bots:
            if hasattr(bot, 'relationship_bot'):
                # Cleanup relationship bot resources
                await bot.relationship_bot.cleanup()
            # Stop the telegram bot
            stop_tasks.append(bot.application.stop())
        
        if stop_tasks:
            await asyncio.gather(*stop_tasks, return_exceptions=True)
        
        self.bots.clear()
        self._running = False
        self.logger.info("All bots have been stopped.")

    async def __aenter__(self):
        """Async context manager entry."""
        await self.start_bots()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.stop_bots()

# Remove utils/event_loop.py as it's no longer needed
# The system now relies on asyncio.run() for event loop management