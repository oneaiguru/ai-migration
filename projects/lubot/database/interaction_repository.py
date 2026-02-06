
from .base_repository import AsyncBaseRepository
from .models import Interaction
from datetime import datetime, timezone
from sqlalchemy import select

class AsyncInteractionRepository(AsyncBaseRepository):
    async def log_interaction(self, session_id: int, user_id: int, chatbot_id: int, interaction_type: str, content: str):
        async with self.session_scope() as session:
            interaction = Interaction(
                session_id=session_id,
                user_id=user_id,
                chatbot_id=chatbot_id,
                type=interaction_type,
                content=content,
                timestamp=datetime.now(timezone.utc)
            )
            session.add(interaction)
            await session.flush()

    async def get_latest_interaction(self, session_id: int, user_id: int, chatbot_id: int):
        async with self.session_scope() as session:
            result = await session.execute(
                select(Interaction)
                .filter_by(session_id=session_id, user_id=user_id, chatbot_id=chatbot_id)
                .order_by(Interaction.timestamp.desc())
            )
            return result.scalar_one_or_none()
