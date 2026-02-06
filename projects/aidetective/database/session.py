import logging
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from sqlalchemy.sql import text

from database.models import Base

logger = logging.getLogger(__name__)

# Global variables for database connection
engine = None
async_session_factory = None

async def init_db(database_url: str) -> None:
    """Initialize database connection and create tables if they don't exist

    Args:
        database_url: Database connection URL
    """
    global engine, async_session_factory

    try:
        # Check if SQLite file directory exists and is writable
        if database_url.startswith('sqlite'):
            # Extract path from URL
            if '+' in database_url:
                # Handle sqlite+aiosqlite:///path pattern
                path = database_url.split('///')[-1]
            else:
                # Handle sqlite:///path pattern
                path = database_url.split(':')[-1]

            # Ensure directory exists
            db_dir = os.path.dirname(os.path.abspath(path))
            if not os.path.exists(db_dir):
                os.makedirs(db_dir, exist_ok=True)

            # Check if we can write to the directory
            if not os.access(db_dir, os.W_OK):
                logger.error(f"No write access to database directory: {db_dir}")
                raise PermissionError(f"No write access to database directory: {db_dir}")

        logger.info(f"Initializing database connection: {database_url}")

        # Create async engine
        engine = create_async_engine(
            database_url,
            echo=False,
            pool_pre_ping=True,  # Verify connection before using from pool
            pool_recycle=3600,   # Recycle connections after 1 hour
            connect_args={"check_same_thread": False} if database_url.startswith('sqlite') else {}
        )

        # Create session factory
        async_session_factory = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )

        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.debug("Database tables created or confirmed")

        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

async def close_db() -> None:
    """Close database connection"""
    global engine
    if engine is not None:
        await engine.dispose()
        logger.info("Database connection closed")

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session as an async context manager

    Yields:
        AsyncSession: Database session

    Raises:
        RuntimeError: If database is not initialized
    """
    global async_session_factory
    if async_session_factory is None:
        raise RuntimeError("Database not initialized")

    session = async_session_factory()
    transaction_successful = False
    try:
        yield session
        await session.commit()
        transaction_successful = True
        logger.debug("Session committed successfully")
    except Exception as e:
        await session.rollback()
        logger.error(f"Unexpected error in database session (rolling back): {e}")
        raise
    finally:
        # Ensure rollback if transaction wasn't successful
        if not transaction_successful:
            try:
                await session.rollback()
                logger.debug("Ensured transaction rollback in finally block")
            except Exception as e:
                logger.error(f"Error during final rollback: {e}")

        try:
            await session.close()
            logger.debug("Session closed successfully")
        except Exception as e:
            logger.error(f"Error closing session: {e}")

async def health_check() -> bool:
    """Perform a database health check

    Returns:
        bool: True if database is healthy, False otherwise
    """
    if engine is None or async_session_factory is None:
        logger.warning("Database not initialized, health check failed")
        return False

    try:
        async with get_db_session() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False

async def run_maintenance() -> None:
    """Run database maintenance tasks

    This could include vacuum operations, statistics updates, etc.
    For SQLite, it runs a VACUUM command to optimize the database.
    """
    if engine is None or async_session_factory is None:
        logger.warning("Database not initialized, cannot run maintenance")
        return

    try:
        # For SQLite
        if str(engine.url).startswith("sqlite"):
            async with get_db_session() as session:
                await session.execute(text("VACUUM"))
                await session.execute(text("PRAGMA optimize"))
                logger.info("SQLite database maintenance completed")
        # For PostgreSQL
        elif str(engine.url).startswith("postgresql"):
            async with get_db_session() as session:
                await session.execute(text("VACUUM ANALYZE"))
                logger.info("PostgreSQL database maintenance completed")
        else:
            logger.info(f"No maintenance defined for database type: {engine.url}")
    except Exception as e:
        logger.error(f"Error during database maintenance: {e}")