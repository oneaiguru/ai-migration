# services/chatbot_service.py

import json
from typing import Dict, Any
from database.chatbot_repository import ChatbotRepository
from database.prompt_repository import PromptRepository
from database.localization_repository import LocalizationRepository
from utils.error_handler import handle_errors
from utils.custom_exceptions import ValidationError
import requests
from telegram import Bot
class ChatbotService:
    def __init__(self):
        self.chatbot_repository = ChatbotRepository()
        self.prompt_repository = PromptRepository()
        self.localization_repository = LocalizationRepository()
        
    @handle_errors
    def add_localizations(self, chatbot_id: int, localizations_data: Dict[str, Dict[str, str]]):
        self.localization_repository.add_localizations(chatbot_id, localizations_data)

    @handle_errors
    def get_localization(self, chatbot_id: int, key: str, language: str = 'ru', **kwargs: Any) -> str:
        text = self.localization_repository.get_localization(chatbot_id, key, language)
        if text is None:
            raise ValidationError(f"Localization not found for key: {key}, language: {language}")
        return text.format(**kwargs) if kwargs else text

    @handle_errors
    def create_chatbot(self, author_id: int, description: str = None, telegram_token: str = None, avatar: str = None):
        return self.chatbot_repository.create_chatbot(author_id, description, telegram_token, avatar)

    @handle_errors
    def get_chatbot(self, chatbot_id: int):
        return self.chatbot_repository.get_chatbot(chatbot_id)

 

    @handle_errors
    def update_chatbot(self, chatbot_id: int, **kwargs):
        return self.chatbot_repository.update_chatbot(chatbot_id, **kwargs)

    @handle_errors
    def delete_chatbot(self, chatbot_id: int):
        return self.chatbot_repository.delete_chatbot(chatbot_id)

    @handle_errors
    def add_prompts(self, chatbot_id: int, prompts_file: str):
        with open(prompts_file, 'r', encoding='utf-8') as file:
            prompts_data = json.load(file)

        prompts = self._process_prompts(prompts_data)
        self.prompt_repository.add_prompts(chatbot_id, prompts)

    @handle_errors
    def add_localizations_from_file(self, chatbot_id: int, localizations_file: str):
        with open(localizations_file, 'r', encoding='utf-8') as file:
            localizations_data = json.load(file)

        self.localization_repository.add_localizations(chatbot_id, localizations_data)

    def _process_prompts(self, prompts_data: Dict[str, Any]) -> Dict[str, Any]:
        processed_prompts = {}

        for key, value in prompts_data.items():
            if isinstance(value, dict) and 'Мужчина' in value and 'Женщина' in value:
                processed_prompts[key] = value
            elif isinstance(value, str):
                processed_prompts[key] = {
                    'Мужчина': value,
                    'Женщина': value,
                    'Не хочу указывать': value
                }
            elif isinstance(value, dict) and ('text_men' in key or 'text_women' in key):
                gender = 'Мужчина' if 'text_men' in key else 'Женщина'
                for sub_key, sub_value in value.items():
                    full_key = f"{key}_{sub_key}"
                    processed_prompts[full_key] = {gender: sub_value}
            else:
                raise ValidationError(f"Invalid prompt format for key: {key}")

        return processed_prompts
    def get_prompt(self, chatbot_id: int, key: str, gender: str) -> str:
        prompt = self.prompt_repository.get_prompt(chatbot_id, key, gender)
        if prompt is None:
            raise ValidationError(f"Prompt not found for key: {key}, gender: {gender}")
        return prompt

    def get_localization(self, chatbot_id: int, key: str, language: str = 'ru', **kwargs: Any) -> str:
        text = self.localization_repository.get_localization(chatbot_id, key, language)
        if text is None:
            raise ValidationError(f"Localization not found for key: {key}, language: {language}")
        return text.format(**kwargs) if kwargs else text

    @handle_errors
    async def get_bot_info(self, chatbot_id: int):
        chatbot = self.chatbot_repository.get_chatbot(chatbot_id)
        if not chatbot:
            raise ValidationError(f"Chatbot with ID {chatbot_id} not found")
        
        # Create bot instance
        bot = Bot(chatbot.telegram_token)
        # Get bot info asynchronously
        bot_info = await bot.get_me()
        
        return {
            'id': chatbot.id,
            'name': bot_info.first_name,
            'username': bot_info.username,
            # Add any other relevant information
        }
