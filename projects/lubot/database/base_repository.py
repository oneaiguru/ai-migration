
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import async_sessionmaker
from contextlib import asynccontextmanager
from config.settings import ASYNC_DATABASE_URL
from utils.logger import get_logger
from utils.custom_exceptions import DatabaseException
from database.models import Base

class AsyncBaseRepository:
    def __init__(self):
        self.engine = create_async_engine(
            ASYNC_DATABASE_URL,
            echo=False,
            pool_size=20,
            max_overflow=10
        )
        self.async_session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        self.logger = get_logger(__name__)

    @asynccontextmanager
    async def session_scope(self):
        session = self.async_session_maker()
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            self.logger.error(f"Database error: {type(e).__name__}: {e}")
            raise DatabaseException(f"Database error: {str(e)}") from e
        finally:
            await session.close()

    async def initialize_tables(self):
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
