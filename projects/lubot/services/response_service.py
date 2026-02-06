# services/response_service.py

from typing import Optional
import asyncio
from utils.logger import get_logger
from utils.custom_exceptions import AIException, RateLimitException
from utils.localization import get_text
from openai import RateLimitError
from managers.chat_manager import ChatManager
from ai.prompt_manager import PromptManager
from services.ab_test_service import ABTestService

class ResponseGenerationService:
    def __init__(self, chat_manager: ChatManager, 
                 prompt_manager: PromptManager, 
                 ab_test_service: ABTestService):
        self.chat_manager = chat_manager
        self.prompt_manager = prompt_manager
        self.ab_test_service = ab_test_service
        self.logger = get_logger(__name__)

    async def generate_response(self, user_id: int, chatbot_id: int, 
                              message: str, user_gender: str) -> str:
        try:
            # Get A/B test variants
            model_variant = await self.ab_test_service.get_user_variant(
                user_id, chatbot_id, "response_generation")
            prompt_variant = await self.ab_test_service.get_user_variant(
                user_id, chatbot_id, "prompt_set")

            # Get the appropriate system prompt and chat instance
            system_prompt = self.prompt_manager.get_prompt(prompt_variant, user_gender)
            chat = self.chat_manager.get_chat(user_gender, model_variant)
            
            if not chat:
                self.chat_manager.initialize_chat(user_gender, model_variant, system_prompt)
                chat = self.chat_manager.get_chat(user_gender, model_variant)

            # Generate response
            response = await chat(message)

            # Process response based on its type
            if isinstance(response, str):
                return response
            elif hasattr(response, 'choices') and len(response.choices) > 0:
                return response.choices[0].message.content
            else:
                return get_text('no_response_generated')

        except RateLimitError as e:
            self.logger.warning(f"Rate limit exceeded for user {user_id}: {e}")
            raise RateLimitException(get_text('rate_limit_exceeded'))
        except Exception as e:
            self.logger.error(f"Error generating response: {str(e)}")
            raise AIException(get_text('error_processing_message'))