# chatbot_repository.py
from .base_repository import AsyncBaseRepository
from database.models import Chatbot
from datetime import datetime, timezone



class AsyncChatbotRepository(AsyncBaseRepository):
    async def get_chatbot(self, chatbot_id: int):
        async with self.session_scope() as session:
            result = await session.execute(
                select(Chatbot).filter_by(id=chatbot_id)
            )
            return result.scalar_one_or_none()

    async def get_all_chatbots(self):
        async with self.session_scope() as session:
            result = await session.execute(select(Chatbot))
            return result.scalars().all()

    async def create_chatbot(self, author_id: int, description: str = None, 
                           telegram_token: str = None, avatar: str = None):
        async with self.session_scope() as session:
            chatbot = Chatbot(
                author_id=author_id,
                description=description,
                telegram_token=telegram_token,
                avatar=avatar,
                created_at=datetime.now(timezone.utc)
            )
            session.add(chatbot)
            await session.flush()
            return chatbot

    async def update_chatbot(self, chatbot_id: int, **kwargs):
        async with self.session_scope() as session:
            chatbot = await self.get_chatbot(chatbot_id)
            for key, value in kwargs.items():
                setattr(chatbot, key, value)
            return chatbot