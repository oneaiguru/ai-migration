
from sqlalchemy import select, update, delete
from .base_repository import AsyncBaseRepository
from .models import Partner
from typing import Optional, List
from utils.custom_exceptions import ValidationError

class AsyncPartnerRepository(AsyncBaseRepository):
    async def get_partner(self, user_id: int, chatbot_id: int, partner_id: int) -> Optional[Partner]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(Partner).filter_by(
                    user_id=user_id,
                    chatbot_id=chatbot_id,
                    id=partner_id
                )
            )
            return result.scalar_one_or_none()

    async def create_partner(self, user_id: int, chatbot_id: int, name: str) -> Partner:
        async with self.session_scope() as session:
            # Deactivate existing partners
            await session.execute(
                update(Partner)
                .where(Partner.user_id == user_id, Partner.chatbot_id == chatbot_id)
                .values(is_active=False)
            )
            
            partner = Partner(
                user_id=user_id,
                chatbot_id=chatbot_id,
                name=name,
                is_active=True
            )
            session.add(partner)
            await session.flush()
            return partner

    async def get_partners(self, user_id: int, chatbot_id: int) -> List[Partner]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(Partner).filter_by(
                    user_id=user_id,
                    chatbot_id=chatbot_id
                )
            )
            return result.scalars().all()

    async def get_active_partner(self, user_id: int, chatbot_id: int) -> Optional[Partner]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(Partner).filter_by(
                    user_id=user_id,
                    chatbot_id=chatbot_id,
                    is_active=True
                )
            )
            return result.scalar_one_or_none()