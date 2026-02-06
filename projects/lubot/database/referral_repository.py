# database/referral_repository.py
from .base_repository import AsyncBaseRepository
from .models import User, Transaction
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select

class AsyncReferralRepository(AsyncBaseRepository):
    async def set_user_referral_code(self, user_id: int, chatbot_id: int, code: str):
        async with self.session_scope() as session:
            result = await session.execute(
                select(User).filter_by(id=user_id, chatbot_id=chatbot_id)
            )
            user = result.scalar_one_or_none()
            if user:
                user.referral_code = code
                user.referral_code_created_at = datetime.now(timezone.utc)
                await session.flush()

    async def add_referral_bonus(self, user_id: int, chatbot_id: int, bonus_amount: float):
        async with self.session_scope() as session:
            result = await session.execute(
                select(User).filter_by(id=user_id, chatbot_id=chatbot_id)
            )
            user = result.scalar_one_or_none()
            if user:
                user.referral_bonus_balance += bonus_amount
                user.balance += bonus_amount

                transaction = Transaction(
                    user_id=user_id,
                    chatbot_id=chatbot_id,
                    amount=bonus_amount,
                    description="Referral bonus"
                )
                session.add(transaction)
                await session.flush()

    async def get_user_referral_data(self, user_id: int, chatbot_id: int) -> dict:
        async with self.session_scope() as session:
            result = await session.execute(
                select(User).filter_by(id=user_id, chatbot_id=chatbot_id)
            )
            user = result.scalar_one_or_none()
            if user:
                return {
                    'referral_code': user.referral_code,
                    'referral_count': user.referral_count,
                    'referral_bonus_balance': user.referral_bonus_balance
                }
            return None

    async def get_or_create_referral_code(self, user_id: int, chatbot_id: int) -> str:
        async with self.session_scope() as session:
            result = await session.execute(
                select(User).filter_by(id=user_id, chatbot_id=chatbot_id)
            )
            user = result.scalar_one_or_none()
            if user and not user.referral_code:
                user.referral_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
                user.referral_code_created_at = datetime.now(timezone.utc)
                await session.flush()
            return user.referral_code if user else None

    async def apply_referral(self, new_user_id: int, chatbot_id: int, referral_code: str) -> bool:
        async with self.session_scope() as session:
            referrer_result = await session.execute(
                select(User).filter_by(referral_code=referral_code, chatbot_id=chatbot_id)
            )
            referrer = referrer_result.scalar_one_or_none()
            
            if referrer:
                new_user_result = await session.execute(
                    select(User).filter_by(id=new_user_id, chatbot_id=chatbot_id)
                )
                new_user = new_user_result.scalar_one_or_none()
                if new_user:
                    new_user.referred_by_id = referrer.id
                    referrer.referral_count += 1
                    await session.flush()
                    return True
            return False

    async def get_referrer_id(self, referral_code: str) -> Optional[int]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(User).filter_by(referral_code=referral_code)
            )
            referrer = result.scalar_one_or_none()
            return referrer.id if referrer else None