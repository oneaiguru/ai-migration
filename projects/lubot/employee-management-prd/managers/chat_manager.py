
# chat_manager.py
from typing import Optional, Dict
from cosette import Chat
from utils.logger import get_logger
from utils.custom_exceptions import AIException
from prompts import get_prompt
from config.settings import config
import asyncio
from contextlib import asynccontextmanager

class ChatManager:
    def __init__(self):
        self.chat_instances: Dict[str, Chat] = {}
        self.logger = get_logger(__name__)
        self._locks: Dict[str, asyncio.Lock] = {}

    def _get_lock(self, chat_key: str) -> asyncio.Lock:
        """Get or create a lock for a specific chat instance"""
        if chat_key not in self._locks:
            self._locks[chat_key] = asyncio.Lock()
        return self._locks[chat_key]

    @asynccontextmanager
    async def _chat_lock(self, chat_key: str):
        """Context manager for chat instance locks"""
        lock = self._get_lock(chat_key)
        await lock.acquire()
        try:
            yield
        finally:
            lock.release()

    async def initialize_chat(self, gender: str, variant: str, system_prompt: str) -> None:
        """Initialize a new chat instance for the given gender and variant."""
        chat_key = f"{gender.lower()}_{variant}"
        
        async with self._chat_lock(chat_key):
            if chat_key not in self.chat_instances:
                try:
                    # Run chat initialization in thread pool
                    chat = await asyncio.to_thread(
                        Chat, model=variant, sp=system_prompt
                    )
                    self.chat_instances[chat_key] = chat
                    self.logger.info(f"Initialized Chat instance for {chat_key}")
                except Exception as e:
                    self.logger.error(f"Failed to initialize Chat for {chat_key}: {e}")
                    raise AIException(f"Failed to initialize Chat for {chat_key}")

    async def get_chat(self, gender: str, variant: str) -> Optional[Chat]:
        """Get an existing chat instance for the given gender and variant."""
        chat_key = f"{gender.lower()}_{variant}"
        async with self._chat_lock(chat_key):
            return self.chat_instances.get(chat_key)

    async def initialize_default_instances(self) -> None:
        """Initialize default chat instances for all gender/variant combinations."""
        genders = ['Мужчина', 'Женщина', 'Не хочу указывать']
        variants = ['gpt-4o', 'gpt-4o-mini']
        
        # Create tasks for all initializations
        tasks = []
        for gender in genders:
            for variant in variants:
                system_prompt = get_prompt('chat_system_prompt', gender)
                tasks.append(self.initialize_chat(gender, variant, system_prompt))
        
        # Run all initializations concurrently
        await asyncio.gather(*tasks)

    async def reset_chat(self, gender: str, variant: str) -> None:
        """Reset a specific chat instance."""
        chat_key = f"{gender.lower()}_{variant}"
        async with self._chat_lock(chat_key):
            if chat_key in self.chat_instances:
                system_prompt = get_prompt('chat_system_prompt', gender)
                await self.initialize_chat(gender, variant, system_prompt)
