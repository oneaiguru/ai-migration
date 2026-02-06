# database/user_repository.py
from .base_repository import AsyncBaseRepository
from .models import User
from datetime import datetime, timezone
import string
import random

class AsyncUserRepository(AsyncBaseRepository):
    async def get_user(self, user_id: int, chatbot_id: int):
        async with self.session_scope() as session:
            result = await session.execute(
                select(User).filter_by(id=user_id, chatbot_id=chatbot_id)
            )
            return result.scalar_one_or_none()

    async def create_user(self, user_id: int, chatbot_id: int, username: str):
        async with self.session_scope() as session:
            user = User(
                id=user_id,
                chatbot_id=chatbot_id,
                username=username,
                referral_code=''.join(random.choices(string.ascii_uppercase + string.digits, k=8)),
                referral_code_created_at=datetime.now(timezone.utc)
            )
            session.add(user)
            await session.flush()
            return user

    async def update_user_balance(self, user_id: int, chatbot_id: int, amount: float):
        async with self.session_scope() as session:
            user = await self.get_user(user_id, chatbot_id)
            if user:
                user.balance += amount
                await session.flush()