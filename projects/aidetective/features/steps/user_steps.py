# features/steps/user_steps.py
import os

# Allow tests to run without real Telegram credentials
os.environ.setdefault("ALLOW_MISSING_TELEGRAM_TOKEN", "true")
os.environ.setdefault("ENVIRONMENT", "testing")

from behave import given, when, then, step
import asyncio
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from unittest.mock import AsyncMock, patch

from database.session import init_db, close_db
from database.models import User, Story, StoryNode, Character, Evidence
from config.settings import Settings
from bot.commands import register_commands
from database.repositories.user_repository import UserRepository
from database.repositories.story_repository import StoryRepository
from database.repositories.investigation_repository import InvestigationRepository

# Mock settings for testing
settings = Settings()
settings.DATABASE_URL = "sqlite+aiosqlite:///test_sherlock.db"
settings.TELEGRAM_TOKEN = "test_token"

# Test data
TEST_USER_ID = 123456789
TEST_USERNAME = "test_user"
TEST_STORY_ID = 1
TEST_STORY_TITLE = "Тайна Теневой Библиотеки"

async def setup_database():
    """Initialize test database and create test data"""
    await init_db(settings.DATABASE_URL)
    
    # Create mock session
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Create test user
        user_repo = UserRepository(session)
        user = await user_repo.create(
            telegram_id=TEST_USER_ID,
            username=TEST_USERNAME
        )
        
        # Create test story
        story_repo = StoryRepository(session)
        story = await story_repo.create_story(
            title=TEST_STORY_TITLE,
            description="Описание тестовой истории",
            difficulty="easy",
            is_premium=False
        )
        
        # Create characters
        director = await story_repo.create_character(
            story_id=story.id,
            name="Директор библиотеки",
            description="Описание директора",
            initial_status="witness"
        )
        
        student = await story_repo.create_character(
            story_id=story.id,
            name="Студент-историк",
            description="Описание студента",
            initial_status="witness"
        )
        
        guard = await story_repo.create_character(
            story_id=story.id,
            name="Ночной сторож",
            description="Описание сторожа",
            initial_status="witness"
        )
        
        # Create evidence
        ink = await story_repo.create_evidence(
            story_id=story.id,
            name="Следы чернил на полу",
            description="Описание следов чернил",
            scene="Кабинет библиотекаря"
        )
        
        bookmark = await story_repo.create_evidence(
            story_id=story.id,
            name="Закладка с именем студента",
            description="Описание закладки",
            scene="Кабинет библиотекаря"
        )
        
        scratches = await story_repo.create_evidence(
            story_id=story.id,
            name="Царапины на двери",
            description="Описание царапин",
            scene="Кабинет библиотекаря"
        )
        
        # Create story nodes
        start_node = await story_repo.create_story_node(
            story_id=story.id,
            node_id="start",
            content="Вы приезжаете к старинному зданию библиотеки...",
            transitions={
                "Осмотреть место преступления": "crime_scene",
                "Поговорить с директором библиотеки": "director_intro",
                "Опросить других свидетелей": "witnesses"
            }
        )
        
        crime_scene_node = await story_repo.create_story_node(
            story_id=story.id,
            node_id="crime_scene",
            content="Вы входите в кабинет библиотекаря...",
            transitions={
                "Изучить книгу на столе": "examine_book",
                "Осмотреть пятна на полу": "examine_ink",
                "Проверить дверь с царапинами": "examine_door",
                "Собрать разбросанные страницы": "examine_pages"
            }
        )
        
        ink_node = await story_repo.create_story_node(
            story_id=story.id,
            node_id="examine_ink",
            content="Вы внимательно изучаете темные пятна на полу...",
            transitions={
                "Продолжить осмотр места преступления": "crime_scene",
                "Поговорить с директором о его ручке": "director_pen"
            }
        )
        
        director_node = await story_repo.create_story_node(
            story_id=story.id,
            node_id="director_intro",
            content="Вы находите директора библиотеки в его кабинете...",
            transitions={
                "Когда вы последний раз видели библиотекаря?": "director_last_seen",
                "Знаете ли вы, над чем работал библиотекарь?": "director_work",
                "Кто имел доступ к кабинету библиотекаря?": "director_access",
                "Вернуться к расследованию": "start"
            }
        )
        
        solution_node = await story_repo.create_story_node(
            story_id=story.id,
            node_id="solve_case",
            content="После тщательного изучения всех улик...",
            transitions={
                "Директор библиотеки": "accuse_director",
                "Студент-историк": "accuse_student",
                "Ночной сторож": "accuse_guard",
                "Продолжить расследование": "continue_investigation"
            }
        )
        
        accusation_node = await story_repo.create_story_node(
            story_id=story.id,
            node_id="accuse_director",
            content="Вы обвиняете директора библиотеки в убийстве...",
            transitions={
                "Начать новое расследование": "start",
                "Выйти": "exit"
            }
        )
        
        await session.commit()

@given('пользователь зарегистрирован в боте')
def step_user_registered(context):
    # Setup test environment
    context.bot = Bot(token=settings.TELEGRAM_TOKEN)
    context.storage = MemoryStorage()
    context.dp = Dispatcher(storage=context.storage)
    context.message = AsyncMock()
    context.message.from_user.id = TEST_USER_ID
    context.message.from_user.username = TEST_USERNAME
    
    # Add event loop for async functions
    loop = asyncio.get_event_loop()
    
    # Initialize test database
    loop.run_until_complete(setup_database())
    
    # Register handlers
    register_commands(context.dp)

@given('доступна история "{story_title}"')
def step_story_available(context, story_title):
    # Story was already created in setup_database
    context.story_title = story_title

@when('пользователь отправляет команду "{command}"')
def step_user_sends_command(context, command):
    context.message.text = command
    
    # Mock the message object
    context.message.answer = AsyncMock()
    
    # Store command for later use
    context.command = command

@then('бот должен отправить приветственное сообщение')
def step_bot_sends_welcome(context):
    # Get handler for /start command
    start_handler = None
    for handler in context.dp.message.handlers:
        if handler.filter.commands and 'start' in handler.filter.commands:
            start_handler = handler.callback
            break
    
    assert start_handler is not None, "Start handler not found"
    
    # Execute handler
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_handler(context.message, context.storage))
    
    # Check that message.answer was called
    context.message.answer.assert_called()
    
    # Check that the welcome message contains the expected text
    call_args = context.message.answer.call_args[0][0]
    assert "Добро пожаловать" in call_args, f"Welcome message not found in: {call_args}"

@then('бот должен предложить доступные расследования')
def step_bot_offers_stories(context):
    # Check that the message contained available stories
    for call_args in context.message.answer.call_args_list:
        message_text = call_args[0][0]
        if "Доступные расследования" in message_text:
            context.stories_message = message_text
            break
    
    assert hasattr(context, 'stories_message'), "Stories message not found"
    assert context.story_title in context.stories_message, f"Story title not found in: {context.stories_message}"

@when('пользователь выбирает "{choice}"')
def step_user_selects_choice(context, choice):
    context.choice = choice
    
    # Mock callback query
    context.callback_query = AsyncMock()
    context.callback_query.message = context.message
    context.callback_query.from_user.id = TEST_USER_ID
    
    # Set data based on choice
    if choice == "Тайна Теневой Библиотеки":
        context.callback_query.data = f"story_{TEST_STORY_ID}"
    elif choice == "Осмотреть место преступления":
        context.callback_query.data = "action_Осмотреть место преступления"
    elif choice == "Осмотреть пятна на полу":
        context.callback_query.data = "action_Осмотреть пятна на полу"
    elif choice == "Поговорить с директором библиотеки":
        context.callback_query.data = "action_Поговорить с директором библиотеки"
    elif choice == "Когда вы последний раз видели библиотекаря?":
        context.callback_query.data = "action_Когда вы последний раз видели библиотекаря?"
    elif choice == "Вернуться к расследованию":
        context.callback_query.data = "back_to_investigation"
    elif choice == "Решить дело":
        context.callback_query.data = "solve_case"
    elif choice == "Директор библиотеки":
        context.callback_query.data = "accuse_1"  # ID of director
    elif choice == "Следы чернил на полу":
        context.callback_query.data = "evidence_1"  # ID of ink evidence
    elif choice == "Анализировать улику":
        context.callback_query.data = "analyze_evidence_1"  # ID of ink evidence
    else:
        assert False, f"Unknown choice: {choice}"

# Additional steps...
# These would be implemented to match all the steps in the feature file
