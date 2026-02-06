import pytest
import pytest_asyncio
from unittest.mock import patch, AsyncMock

from bot.conversation import start_conversation, help_command, select_story
from bot.states import UserStates

# Test constants
TEST_USER_ID = 123456789

@pytest.mark.asyncio
async def test_start_command(setup_test_db, test_session, mock_message, mock_state):
    """Test start command handler"""
    # Configure mock message
    mock_message.from_user.id = TEST_USER_ID
    mock_message.from_user.username = "test_user"
    mock_message.from_user.first_name = "Test"
    mock_message.from_user.last_name = "User"

    # Create a mock session context manager
    class MockSessionContext:
        async def __aenter__(self):
            return test_session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            await test_session.rollback()

    # Patch get_db_session to return our mock session
    with patch('bot.conversation.get_db_session', return_value=MockSessionContext()):
        # Call start_conversation handler
        await start_conversation(mock_message, mock_state)

        # Verify state was set
        mock_state.set_state.assert_called_once_with(UserStates.story_selection)

        # Verify message.answer was called at least twice (for welcome & stories)
        assert mock_message.answer.call_count >= 2

@pytest.mark.asyncio
async def test_help_command(mock_message, mock_state):
    """Test help command handler"""
    # Call help_command handler
    await help_command(mock_message, mock_state)

    # Verify message.answer was called
    mock_message.answer.assert_called_once()

    # Verify help message contains key phrases
    call_args = mock_message.answer.call_args[0][0]
    assert "Помощь" in call_args
    assert "/start" in call_args
    assert "/help" in call_args

@pytest.mark.asyncio
async def test_select_story(setup_test_db, test_session, mock_callback_query, mock_state):
    """Test story selection handler"""
    # Configure mock callback query
    mock_callback_query.data = "story_1"

    # Create test story in database
    from database.models import Story, StoryNode
    from database.repositories.story_repository import StoryRepository

    story_repo = StoryRepository(test_session)
    story = await story_repo.create_story(
        title="Test Story",
        description="Test description",
        difficulty="easy",
        is_premium=False
    )

    # Create start node
    start_node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="start",
        content="Start content",
        transitions={"option1": "node1"}
    )

    # Commit changes
    await test_session.commit()

    # Create a mock session context manager
    class MockSessionContext:
        async def __aenter__(self):
            return test_session

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            await test_session.rollback()

    # Patch get_db_session
    with patch('bot.conversation.get_db_session', return_value=MockSessionContext()):
        # Call select_story handler
        await select_story(mock_callback_query, mock_state)

        # Verify callback was answered
        mock_callback_query.answer.assert_called_once()

        # Verify state was updated
        mock_state.update_data.assert_called_once()
        mock_state.set_state.assert_called_once_with(UserStates.investigation)

        # Verify messages were sent
        assert mock_callback_query.message.answer.call_count >= 1