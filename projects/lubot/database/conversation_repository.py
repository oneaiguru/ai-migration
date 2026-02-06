# database/conversation_repository.py
from .base_repository import AsyncBaseRepository
from .models import Conversation
from typing import List
class AsyncConversationRepository(AsyncBaseRepository):
    async def add_conversation(self, user_id: int, chatbot_id: int, 
                             message: str, response: str):
        async with self.session_scope() as session:
            conversation = Conversation(
                user_id=user_id,
                chatbot_id=chatbot_id,
                message=message,
                response=response
            )
            session.add(conversation)

    async def get_recent_conversations(self, user_id: int, chatbot_id: int, 
                                     limit: int = 5):
        async with self.session_scope() as session:
            result = await session.execute(
                select(Conversation)
                .filter_by(user_id=user_id, chatbot_id=chatbot_id)
                .order_by(Conversation.timestamp.desc())
                .limit(limit)
            )
            return result.scalars().all()