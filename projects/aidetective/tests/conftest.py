import os
import sys
import pytest
import pytest_asyncio
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add the project root directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.models import Base
import database.session

# Test database URL
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(TEST_DB_URL, echo=False)

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Dispose engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def test_session(test_engine):
    """Create a test database session."""
    async_session = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        yield session  # This is the key change - properly yielding the session object
        await session.rollback()

@pytest_asyncio.fixture(scope="function")
async def setup_test_db(test_engine):
    """Initialize test database with test data."""
    # Create database tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Patch database session to use test engine
    original_get_db_session = database.session.get_db_session
    original_engine = database.session.engine
    original_session_factory = database.session.async_session_factory

    # Create test session factory
    test_session_factory = sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    # Replace session with test session
    database.session.engine = test_engine
    database.session.async_session_factory = test_session_factory

    yield

    # Restore original session
    database.session.engine = original_engine
    database.session.async_session_factory = original_session_factory
    database.session.get_db_session = original_get_db_session

@pytest.fixture
def mock_bot():
    """Create a mock bot."""
    from unittest.mock import AsyncMock
    from aiogram import Bot
    bot_mock = AsyncMock(spec=Bot)
    return bot_mock

@pytest.fixture
def mock_message(mock_bot):
    """Create a mock message."""
    from unittest.mock import AsyncMock, MagicMock
    from aiogram.types import Message, User, Chat

    message = AsyncMock(spec=Message)
    message.from_user = MagicMock(spec=User)
    message.from_user.id = 123456789
    message.from_user.username = "test_user"
    message.from_user.first_name = "Test"
    message.from_user.last_name = "User"
    message.chat = MagicMock(spec=Chat)
    message.chat.id = 123456789
    message.bot = mock_bot

    # Make sure answer is a coroutine function
    message.answer = AsyncMock()
    return message

@pytest.fixture
def mock_callback_query(mock_bot, mock_message):
    """Create a mock callback query."""
    from unittest.mock import AsyncMock
    from aiogram.types import CallbackQuery

    callback_query = AsyncMock(spec=CallbackQuery)
    callback_query.from_user = mock_message.from_user
    callback_query.message = mock_message
    callback_query.data = "test_data"
    callback_query.bot = mock_bot

    # Make sure answer is a coroutine function
    callback_query.answer = AsyncMock()
    return callback_query

@pytest.fixture
def mock_state():
    """Create a mock FSM state."""
    from unittest.mock import AsyncMock
    from aiogram.fsm.context import FSMContext

    state = AsyncMock(spec=FSMContext)
    state.get_data.return_value = {}
    state.set_state = AsyncMock()
    state.update_data = AsyncMock()
    return state