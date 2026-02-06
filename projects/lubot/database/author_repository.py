
from .base_repository import AsyncBaseRepository
from .models import Author
from datetime import datetime, timezone
from sqlalchemy import select

class AsyncAuthorRepository(AsyncBaseRepository):
    async def get_author(self, author_id: int):
        async with self.session_scope() as session:
            result = await session.execute(
                select(Author).filter_by(id=author_id)
            )
            return result.scalar_one_or_none()

    async def create_author(self, username: str, email: str, password_hash: str):
        async with self.session_scope() as session:
            author = Author(
                username=username,
                email=email,
                password_hash=password_hash,
                created_at=datetime.now(timezone.utc)
            )
            session.add(author)
            await session.flush()
            return author

    async def update_author(self, author_id: int, **kwargs):
        async with self.session_scope() as session:
            result = await session.execute(
                select(Author).filter_by(id=author_id)
            )
            author = result.scalar_one_or_none()
            if author:
                for key, value in kwargs.items():
                    setattr(author, key, value)
            return author