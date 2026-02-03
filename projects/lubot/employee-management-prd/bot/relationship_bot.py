from typing import Tuple, Optional
import os
import asyncio
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from database.models import User, Partner
from utils.logger import get_logger, log_analytics  
from utils.custom_exceptions import ValidationError, DatabaseException, AIException
from utils.localization import get_text
from utils.redis_manager import RedisManager

from services.referral_service import ReferralService
from services.author_service import AuthorService
from services.chatbot_service import ChatbotService
from services.partner_service import PartnerService
from services.ab_test_service import ABTestService
from services.analytics_service import AnalyticsService
from services.response_service import ResponseGenerationService
from ai.prompt_manager import PromptManager
from managers.chat_manager import ChatManager
from handlers.message_handler import MessageHandler

from database.chatbot_repository import ChatbotRepository
from database.conversation_repository import ConversationRepository
from database.session_repository import SessionRepository
from database.token_usage_repository import TokenUsageRepository
from database.interaction_repository import InteractionRepository
from database.partner_repository import PartnerRepository
from database.user_repository import UserRepository
from database.feedback_repository import FeedbackRepository
from database.ab_test_repository import ABTestRepository
from database.referral_repository import ReferralRepository
from managers.chat_manager import ChatManager
from services.response_service import ResponseGenerationService
from services.analytics_service import AnalyticsService

from config.settings import (
    REDIS_HOST, 
    REDIS_PORT, 
    REDIS_DB, 
    OPENAI_API_KEY
)
class RelationshipBot:
    def __init__(self, user_repository: UserRepository, 
                 referral_repository: ReferralRepository,
                 partner_repository: PartnerRepository,
                 bot_username: str,
                 chatbot_id: int):
        
        # Set up logger
        self.logger = get_logger(__name__)
        
        # Basic attributes
        self.bot_username = bot_username
        self.chatbot_id = chatbot_id
        
        # Initialize repositories
        
        # Set up logger
        self.logger = get_logger(__name__)
        self.chatbot_repository = ChatbotRepository()
        self.conversation_repository = ConversationRepository()
        self.session_repository = SessionRepository()
        self.token_usage_repository = TokenUsageRepository()
        self.interaction_repository = InteractionRepository()
        self.feedback_repository = FeedbackRepository()
        self.ab_test_repository = ABTestRepository()
        self.bot_username = bot_username
        # Initialize Redis manager with proper error handling
        try:
            self.redis_manager = RedisManager(REDIS_HOST, REDIS_PORT, REDIS_DB)
        except Exception as e:
            self.logger.error(f"Failed to initialize Redis connection: {e}")
            raise AIException("Failed to initialize Redis connection")
        
        # Initialize managers first
        self.prompt_manager = PromptManager(chatbot_id)  # Initialize prompt_manager before services that depend on it
        self.chatbot_id = chatbot_id
        
        # Initialize services that depend on managers
        self.referral_service = ReferralService()
        self.author_service = AuthorService()
        self.chatbot_service = ChatbotService()
        self.partner_service = PartnerService(partner_repository)
        self.ab_test_service = ABTestService()
        
        # Initialize handlers
        
        self.user_repository = user_repository
        # Initialize the response service after prompt_manager is available
        self.response_service = ResponseGenerationService(
            self.chat_manager,
            self.prompt_manager,
            self.ab_test_service
        )
        
        # Initialize analytics service
        self.analytics_service = AnalyticsService(
            self.session_repository,
            self.feedback_repository,
            self.token_usage_repository
        )
        
        # Set up environment
        os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
        
        # Initialize executor for async operations
        self.executor = ThreadPoolExecutor()
        
        # Initialize chat instances
        
        self.conversation_repository = ConversationRepository()
        self.session_repository = SessionRepository()
        self.token_usage_repository = TokenUsageRepository()
        self.interaction_repository = InteractionRepository()
        self.feedback_repository = FeedbackRepository()
        self.ab_test_repository = ABTestRepository()
        
        # Initialize Redis manager with proper error handling
        try:
            self.redis_manager = RedisManager(REDIS_HOST, REDIS_PORT, REDIS_DB)
        except Exception as e:
            self.logger.error(f"Failed to initialize Redis connection: {e}")
            raise AIException("Failed to initialize Redis connection")
        
        # Initialize managers first
        self.prompt_manager = PromptManager(chatbot_id)  # Initialize prompt_manager before services that depend on it
        self.chat_manager = ChatManager()
        
        # Initialize services that depend on managers
        self.referral_service = ReferralService()
        self.author_service = AuthorService()
        self.chatbot_service = ChatbotService()
        self.partner_service = PartnerService(partner_repository)
        self.ab_test_service = ABTestService()
        
        # Initialize handlers
        self.message_handler = MessageHandler(self)
        
        # Initialize the response service after prompt_manager is available
        self.response_service = ResponseGenerationService(
            self.chat_manager,
            self.prompt_manager,
            self.ab_test_service
        )
        
        # Initialize analytics service
        self.analytics_service = AnalyticsService(
            self.session_repository,
            self.feedback_repository,
            self.token_usage_repository
        )
        
        # Set up environment
        os.environ['OPENAI_API_KEY'] = OPENAI_API_KEY
        
        # Initialize executor for async operations
        self.executor = ThreadPoolExecutor()
        
        # Initialize chat instances
        
        
    
    async def initialize(self):
        """
        Async initialization method to be called after construction.
        This replaces the synchronous chat initialization in __init__.
        """
        try:
            await self.chat_manager.initialize_default_instances()
        except Exception as e:
            self.logger.error(f"Failed to initialize chat instances: {e}")
            raise AIException("Failed to initialize chat instances")

    async def init_chat_instances(self):
        try:
            await self.chat_manager.initialize_default_instances()
        except Exception as e:
            self.logger.error(f"Failed to initialize chat instances: {e}")
            raise AIException("Failed to initialize chat instances")


    @classmethod
    async def create(cls, user_repository: UserRepository, 
                    referral_repository: ReferralRepository,
                    partner_repository: PartnerRepository,
                    bot_username: str,
                    chatbot_id: int):
        """
        Factory method to create and initialize a RelationshipBot instance.
        """
        bot = cls(user_repository, referral_repository, partner_repository, 
                 bot_username, chatbot_id)
        await bot.initialize()
        return bot
    def generate_referral_link(self, user_id: int, chatbot_id: int) -> str:
        return self.referral_service.generate_referral_link(user_id, chatbot_id)
    def get_referral_status(self, user_id: int, chatbot_id: int) -> str:
        return self.referral_service.get_referral_status(user_id, chatbot_id)

    async def create_or_get_user(self, user_id: int, chatbot_id: int, 
                                username: Optional[str]) -> Tuple[User, Optional[str]]:
        try:
            # Run database operations in executor
            user = await asyncio.get_event_loop().run_in_executor(
                self.executor, 
                self.user_repository.get_user, 
                user_id, 
                chatbot_id
            )
            
            if not user:
                user = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    self.user_repository.create_user,
                    user_id,
                    chatbot_id,
                    username
                )
                self.logger.info(f"Created new user: {user_id} for chatbot: {chatbot_id}")
            
            active_partner = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self.get_active_partner,
                user_id,
                chatbot_id
            )
            
            if not active_partner:
                return user, get_text('no_active_partner')
            
            return user, None
            
        except Exception as e:
            self.logger.error(f"Error creating/getting user {user_id}: {str(e)}")
            raise DatabaseException(f"Error creating/getting user: {str(e)}")
         

    async def generate_response(self, user_id: int, chatbot_id: int, 
                              message: str, variant) -> str:
        user = await asyncio.get_event_loop().run_in_executor(
            self.executor,
            self.user_repository.get_user,
            user_id,
            chatbot_id
        )
        gender = user.gender if user else get_text('gender_default')
        
        return await self.response_service.generate_response(
            user_id, 
            chatbot_id, 
            message, 
            gender
        )

    async def cleanup(self):
        """
        Cleanup method to properly close resources
        """
        if hasattr(self, 'executor'):
            self.executor.shutdown(wait=True)
        if hasattr(self, 'redis_manager'):
            await self.redis_manager.cleanup()
    async def handle_feedback(self, user_id: int, chatbot_id: int, 
                            is_positive: bool) -> None:
        try:
            session_id = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self.session_repository.create_or_get_active_session,
                user_id,
                chatbot_id
            )
            
            latest_interaction = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self.interaction_repository.get_latest_interaction,
                session_id,
                user_id,
                chatbot_id
            )
            
            if latest_interaction:
                await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    self.feedback_repository.handle_feedback,
                    session_id,
                    user_id,
                    chatbot_id,
                    latest_interaction.id,
                    is_positive
                )
                
                await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    self.ab_test_service.record_feedback,
                    user_id,
                    chatbot_id,
                    "response_generation_method",
                    is_positive
                )
            else:
                raise ValidationError(
                    f"No recent interaction found for user {user_id}"
                )
                
        except Exception as e:
            self.logger.error(f"Error handling feedback: {str(e)}")
            raise AIException(get_text("error_handling_feedback"))

    # Partner management methods
    def get_partners(self, user_id: int, chatbot_id: int) -> list:
        return self.partner_service.get_partners(user_id, chatbot_id)

    def get_active_partner(self, user_id: int, chatbot_id: int) -> Optional[Partner]:
        return self.partner_service.get_active_partner(user_id, chatbot_id)

    def set_active_partner(self, user_id: int, chatbot_id: int, 
                          partner_id: int) -> str:
        return self.partner_service.set_active_partner(user_id, chatbot_id, partner_id)

    def add_partner(self, user_id: int, chatbot_id: int, 
                   partner_identifier: str) -> str:
        return self.partner_service.add_partner(user_id, chatbot_id, partner_identifier)

    def remove_partner(self, user_id: int, chatbot_id: int, 
                      partner_id: int) -> str:
        return self.partner_service.remove_partner(user_id, chatbot_id, partner_id)

    # User management methods
    def get_user_gender(self, user_id: int, chatbot_id: int) -> str:
        return self.user_repository.get_user(user_id, chatbot_id).gender


    async def set_user_gender(self, user_id: int, chatbot_id: int, gender: str) -> None:
        try:
            await asyncio.get_event_loop().run_in_executor(
                None,
                self.user_repository.update_user,
                user_id,
                chatbot_id,
                gender
            )
        except Exception as e:
            self.logger.error(f"Error setting user gender: {str(e)}")
            raise AIException(get_text("error_setting_user_gender"))


    # Analytics methods
    def get_user_engagement_metrics(self, chatbot_id: int, 
                                  start_date: datetime, 
                                  end_date: datetime) -> str:
        return self.analytics_service.get_engagement_metrics(
            chatbot_id, 
            start_date, 
            end_date
        )
    def get_user_manual(self, chatbot_id: int) -> str:
        manual_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'manual.md')
        with open(manual_path, 'r', encoding='utf-8') as file:
            return file.read()

    def get_contact_info(self) -> str:
        return get_text('contact_info')

    def switch_chatbot(self, user_id: int, new_chatbot_id: int) -> str:
        try:
            user = self.user_repository.get_user(user_id, new_chatbot_id)
            if not user:
                user = self.user_repository.create_user(user_id, new_chatbot_id, None)
            
            chatbot = self.chatbot_service.get_chatbot(new_chatbot_id)
            if not chatbot:
                return get_text('chatbot_not_found')
            
            return get_text('chatbot_switched', chatbot_name=chatbot.name)
            
        except Exception as e:
            self.logger.error(f"Error switching chatbot: {str(e)}")
            raise AIException(get_text('error_switching_chatbot'))

    async def initialize_services(self):
        """Initialize services asynchronously"""
        await self.chat_manager.initialize_default_instances()
        # Add other async initializations here if needed

    async def handle_message(self, user_id: int, chatbot_id: int, message: str):
        return await self.message_handler.handle_message(user_id, chatbot_id, message)

    async def generate_response(self, user_id: int, chatbot_id: int, message: str, variant):
        return await self.response_service.generate_response(
            user_id, chatbot_id, message, variant)

    async def get_engagement_metrics(self, chatbot_id: int, start_date, end_date):
        return await self.analytics_service.get_engagement_metrics(
            chatbot_id, start_date, end_date)

    async def get_feedback_trends(self, chatbot_id: int, start_date, end_date):
        return await self.analytics_service.get_feedback_analysis(
            chatbot_id, start_date, end_date)
