# ai/prompt_manager.py


import json
from typing import Optional
from redis import Redis
from utils.localization import get_text
from database.prompt_repository import PromptRepository
from database.models import User, Partner
from utils.custom_exceptions import ValidationError
from database.ab_test_repository import ABTestRepository
from config.settings import REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_CHANNEL

class PromptManager:
    def __init__(self, chatbot_id: int):
        self.chatbot_id = chatbot_id
        self.prompt_repository = PromptRepository()
        self.ab_test_repository = ABTestRepository()
        self.redis = Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB)
        self.pubsub = self.redis.pubsub()
        self.pubsub.subscribe(REDIS_CHANNEL)

    def construct_prompt(self, user: User, partner: Partner, context: str, message: str) -> str:
        return get_text('construct_prompt',
                        age=user.age,
                        gender=user.gender,
                        partner_name=partner.name,
                        context=context,
                        message=message)

    def get_prompt(self, key: str, gender: str, user_id: int) -> str:
        cache_key = f"{self.chatbot_id}:{key}:{gender}"
        cached_prompt = self.redis.get(cache_key)
        
        if cached_prompt:
            return cached_prompt.decode('utf-8')

        variant = self.ab_test_repository.handle_ab_test(user_id, self.chatbot_id, "response_generation_method")
        variant_name = variant.variant_name if variant else 'control'

        prompt = self.prompt_repository.get_prompt(
            chatbot_id=self.chatbot_id,
            key=key,
            gender=gender,
            variant=variant_name
        )
        if not prompt:
            prompt = self.prompt_repository.get_prompt(
                chatbot_id=self.chatbot_id,
                key=key,
                gender=gender,
                variant='control'
            )
            if not prompt:
                raise ValidationError(f"Prompt not found for key: {key}, gender: {gender}")

        self.redis.set(cache_key, prompt)
        return prompt

    def add_prompt(self, key: str, gender: str, content: str, variant: str = 'control') -> None:
        self.prompt_repository.add_prompt_version(
            chatbot_id=self.chatbot_id,
            key=key,
            gender=gender,
            content=content,
            variant=variant
        )
        self.invalidate_cache(key, gender, variant)

        update_message = {
            'chatbot_id': self.chatbot_id,
            'action': 'update_prompt',
            'key': key,
            'gender': gender,
            'variant': variant
        }
        self.redis.publish(REDIS_CHANNEL, json.dumps(update_message))

    def remove_prompt(self, key: str, gender: str, variant: str = 'control') -> None:
        # Implement removal logic if necessary
        self.invalidate_cache(key, gender, variant)

    def invalidate_cache(self, key: str, gender: str, variant: str) -> None:
        cache_key = f"{self.chatbot_id}:{key}:{gender}"
        self.redis.delete(cache_key)

    def refresh_prompts(self) -> None:
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                if data['chatbot_id'] == self.chatbot_id and data['action'] == 'update_prompt':
                    self.invalidate_cache(data['key'], data['gender'], data['variant'])

    def __del__(self):
        self.pubsub.unsubscribe(REDIS_CHANNEL)
        self.redis.close()
