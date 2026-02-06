
from sqlalchemy import select
from .base_repository import AsyncBaseRepository
from .models import PromptVersion
from typing import Optional

class AsyncPromptRepository(AsyncBaseRepository):
    async def get_prompt(self, chatbot_id: int, key: str, gender: str, variant: str = 'control') -> Optional[str]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(PromptVersion)
                .filter_by(chatbot_id=chatbot_id, key=key, gender=gender, variant=variant)
                .order_by(PromptVersion.version.desc())
            )
            prompt = result.scalar_one_or_none()
            
            if not prompt and variant != 'control':
                # Fallback to control variant
                result = await session.execute(
                    select(PromptVersion)
                    .filter_by(chatbot_id=chatbot_id, key=key, gender=gender, variant='control')
                    .order_by(PromptVersion.version.desc())
                )
                prompt = result.scalar_one_or_none()
            
            return prompt.content if prompt else None

    async def add_prompt_version(self, chatbot_id: int, key: str, gender: str, content: str, variant: str = 'control'):
        async with self.session_scope() as session:
            result = await session.execute(
                select(PromptVersion)
                .filter_by(chatbot_id=chatbot_id, key=key, gender=gender, variant=variant)
                .order_by(PromptVersion.version.desc())
            )
            latest_version = result.scalar_one_or_none()
            new_version = (latest_version.version + 1) if latest_version else 1

            prompt_version = PromptVersion(
                chatbot_id=chatbot_id,
                key=key,
                gender=gender,
                language='ru',
                content=content,
                version=new_version,
                variant=variant
            )
            session.add(prompt_version)
            return prompt_version