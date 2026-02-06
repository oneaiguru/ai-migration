
from .base_repository import AsyncBaseRepository
from .models import LocalizationVersion
from sqlalchemy import select
from typing import Optional, Dict

class AsyncLocalizationRepository(AsyncBaseRepository):
    async def get_localization(self, chatbot_id: int, key: str, language: str) -> Optional[str]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(LocalizationVersion)
                .filter_by(chatbot_id=chatbot_id, key=key, language=language)
                .order_by(LocalizationVersion.version.desc())
            )
            localization = result.scalar_one_or_none()
            return localization.content if localization else None

    async def add_localization_version(self, chatbot_id: int, key: str, language: str, content: str):
        async with self.session_scope() as session:
            result = await session.execute(
                select(LocalizationVersion)
                .filter_by(chatbot_id=chatbot_id, key=key, language=language)
                .order_by(LocalizationVersion.version.desc())
            )
            latest_version = result.scalar_one_or_none()
            new_version = (latest_version.version + 1) if latest_version else 1

            localization_version = LocalizationVersion(
                chatbot_id=chatbot_id,
                key=key,
                language=language,
                content=content,
                version=new_version
            )
            session.add(localization_version)
            await session.flush()
            return localization_version

    async def add_localizations(self, chatbot_id: int, localizations_data: Dict[str, Dict[str, str]]):
        for key, language_dict in localizations_data.items():
            for language, content in language_dict.items():
                await self.add_localization_version(chatbot_id, key, language, content)

    async def get_all_localizations(self, chatbot_id: int, language: str) -> Dict[str, str]:
        async with self.session_scope() as session:
            result = await session.execute(
                select(LocalizationVersion)
                .filter_by(chatbot_id=chatbot_id, language=language)
                .order_by(LocalizationVersion.key, LocalizationVersion.version.desc())
            )
            localizations = result.scalars().all()
            
            result_dict = {}
            for loc in localizations:
                if loc.key not in result_dict:
                    result_dict[loc.key] = loc.content
            return result_dict