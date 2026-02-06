# handlers/message_handler.py
import asyncio
from typing import Tuple, Optional
from database.models import User
from utils.logger import get_logger
from utils.custom_exceptions import AIException, ValidationError
from utils.localization import get_text
from database.user_repository import AsyncUserRepository

class MessageHandler:
    def __init__(self, bot_instance):
        self.bot = bot_instance
        self.logger = get_logger(__name__)
        # Initialize user_repo with an async session
        self.user_repo = AsyncUserRepository()  # Ensure this is correctly set up for async usage

    async def handle_message(self, user_id: int, chatbot_id: int, message: str) -> str:
        # Update session handling for async
        async with self.user_repo.get_session() as session:  # Ensure get_session is async
            user, error = await self.bot.create_or_get_user(session, user_id, chatbot_id, None)
            if error:
                return error
                
            # Get the A/B test variant for this user
            variant = await self.bot.ab_test_service.get_user_variant(
                user_id, chatbot_id, "response_generation_method"
            )
            
            # Generate and return response
            return await self.bot.generate_response(user_id, chatbot_id, message, variant)
            
        except ValidationError as e:
            self.logger.warning(f"Validation error for user {user_id}: {str(e)}")
            return get_text("validation_error")
        except AIException as e:
            self.logger.error(f"AI error for user {user_id}: {str(e)}")
            return str(e)
        except Exception as e:
            self.logger.error(f"Unexpected error handling message: {str(e)}")
            return get_text("unexpected_error")

    async def handle_feedback(self, user_id: int, chatbot_id: int, 
                            interaction_id: int, is_positive: bool) -> None:
        try:
            # Record the feedback
            await self.bot.handle_feedback(user_id, chatbot_id, is_positive)
            self.logger.info(
                f"Feedback recorded for user {user_id}, interaction {interaction_id}: "
                f"{'positive' if is_positive else 'negative'}"
            )
        except Exception as e:
            self.logger.error(f"Error handling feedback: {str(e)}")
            raise AIException(get_text("error_handling_feedback"))
