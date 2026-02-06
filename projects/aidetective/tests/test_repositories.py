import pytest
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from database.models import Base, User, Story, Character, Evidence, StoryNode, Investigation
from database.repositories.user_repository import UserRepository
from database.repositories.story_repository import StoryRepository
from database.repositories.investigation_repository import InvestigationRepository

# Test data
TEST_USER_ID = 123456789
TEST_USERNAME = "test_user"
TEST_STORY_ID = 1
TEST_STORY_TITLE = "Тайна Теневой Библиотеки"

@pytest.mark.asyncio
async def test_user_repository(test_session):
    """Test UserRepository operations"""
    # Create repository
    user_repo = UserRepository(test_session)

    # Test create
    user = await user_repo.create(
        telegram_id=123456789,
        username="test_user",
        first_name="Test",
        last_name="User"
    )

    assert user.id is not None
    assert user.telegram_id == 123456789
    assert user.username == "test_user"
    assert user.first_name == "Test"
    assert user.last_name == "User"

    # Test get_by_telegram_id
    retrieved_user = await user_repo.get_by_telegram_id(123456789)
    assert retrieved_user is not None
    assert retrieved_user.id == user.id
    assert retrieved_user.username == "test_user"

    # Test update_last_active
    await user_repo.update_last_active(user.id)

    # Test get_by_id
    retrieved_user = await user_repo.get_by_id(user.id)
    assert retrieved_user is not None
    assert retrieved_user.id == user.id

    # Test update_profile
    updated_user = await user_repo.update_profile(
        user_id=user.id,
        username="updated_user",
        first_name="Updated",
        last_name="User"
    )

    assert updated_user is not None
    assert updated_user.username == "updated_user"
    assert updated_user.first_name == "Updated"
    assert updated_user.last_name == "User"

    # Test get_all_users
    users = await user_repo.get_all_users()
    assert len(users) == 1
    assert users[0].id == user.id

@pytest.mark.asyncio
async def test_story_repository(test_session):
    """Test StoryRepository operations"""
    # Create repository
    story_repo = StoryRepository(test_session)

    # Test create_story
    story = await story_repo.create_story(
        title="Test Story",
        description="Test story description",
        difficulty="easy",
        is_premium=False
    )

    assert story.id is not None
    assert story.title == "Test Story"
    assert story.description == "Test story description"
    assert story.difficulty == "easy"
    assert story.is_premium is False

    # Test get_by_id
    retrieved_story = await story_repo.get_by_id(story.id)
    assert retrieved_story is not None
    assert retrieved_story.id == story.id
    assert retrieved_story.title == "Test Story"

    # Test create_character
    character = await story_repo.create_character(
        story_id=story.id,
        name="Test Character",
        description="Test character description",
        initial_status="witness"
    )

    assert character.id is not None
    assert character.name == "Test Character"
    assert character.story_id == story.id

    # Test get_character_by_id
    retrieved_character = await story_repo.get_character_by_id(character.id)
    assert retrieved_character is not None
    assert retrieved_character.id == character.id
    assert retrieved_character.name == "Test Character"

    # Test create_evidence
    evidence = await story_repo.create_evidence(
        story_id=story.id,
        name="Test Evidence",
        description="Test evidence description",
        scene="Test Scene"
    )

    assert evidence.id is not None
    assert evidence.name == "Test Evidence"
    assert evidence.story_id == story.id

    # Test get_evidence_by_id
    retrieved_evidence = await story_repo.get_evidence_by_id(evidence.id)
    assert retrieved_evidence is not None
    assert retrieved_evidence.id == evidence.id
    assert retrieved_evidence.name == "Test Evidence"

    # Test create_story_node
    node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="test_node",
        content="Test node content",
        transitions={"option1": "next_node1", "option2": "next_node2"}
    )

    assert node.id is not None
    assert node.node_id == "test_node"
    assert node.story_id == story.id

    # Test get_story_node
    retrieved_node = await story_repo.get_story_node(story.id, "test_node")
    assert retrieved_node is not None
    assert retrieved_node.id == node.id
    assert retrieved_node.node_id == "test_node"
    assert retrieved_node.transitions == {"option1": "next_node1", "option2": "next_node2"}

    # Test get_free_stories
    free_stories = await story_repo.get_free_stories()
    assert len(free_stories) == 1
    assert free_stories[0].id == story.id

    # Test get_all
    all_stories = await story_repo.get_all()
    assert len(all_stories) == 1
    assert all_stories[0].id == story.id

@pytest.mark.asyncio
async def test_investigation_repository(test_session):
    """Test InvestigationRepository operations"""
    # Create required data
    user_repo = UserRepository(test_session)
    story_repo = StoryRepository(test_session)

    # Create a test user
    user = await user_repo.create(telegram_id=123456789, username="test_user")

    # Create a test story
    story = await story_repo.create_story(title="Test Story", description="Test description")

    # Create a test character
    character = await story_repo.create_character(
        story_id=story.id,
        name="Test Character",
        description="Test character description",  # Added the missing description parameter
        initial_status="witness"
    )

    # Create a test evidence
    evidence = await story_repo.create_evidence(
        story_id=story.id,
        name="Test Evidence",
        description="Test evidence description",
        scene="Test Scene"
    )

    # Create a test story node
    start_node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="start",
        content="Start node content",
        transitions={"option1": "next_node"}
    )

    # Create repository
    investigation_repo = InvestigationRepository(test_session)

    # Test start_investigation
    investigation = await investigation_repo.start_investigation(user.id, story.id)

    assert investigation.id is not None
    assert investigation.user_id == user.id
    assert investigation.story_id == story.id
    assert investigation.current_node == "start"
    assert investigation.completed is False

    # Test get_by_id
    retrieved_investigation = await investigation_repo.get_by_id(investigation.id)
    assert retrieved_investigation is not None
    assert retrieved_investigation.id == investigation.id

    # Test update_node
    await investigation_repo.update_node(investigation.id, "new_node")
    retrieved_investigation = await investigation_repo.get_by_id(investigation.id)
    assert retrieved_investigation.current_node == "new_node"

    # Test get_character_states
    character_states = await investigation_repo.get_character_states(investigation.id)
    assert len(character_states) == 1
    assert character_states[0].character_id == character.id
    assert character_states[0].status == "witness"

    # Test update_character_status
    await investigation_repo.update_character_status(investigation.id, character.id, "suspect")
    character_state = await investigation_repo.get_character_state(investigation.id, character.id)
    assert character_state.status == "suspect"

    # Test get_evidence_states
    evidence_states = await investigation_repo.get_evidence_states(investigation.id)
    assert len(evidence_states) == 1
    assert evidence_states[0].evidence_id == evidence.id
    assert evidence_states[0].discovered is False

    # Test discover_evidence
    await investigation_repo.discover_evidence(investigation.id, evidence.id)
    evidence_state = await investigation_repo.get_evidence_state(investigation.id, evidence.id)
    assert evidence_state.discovered is True
    assert evidence_state.analyzed is False

    # Test analyze_evidence
    await investigation_repo.analyze_evidence(investigation.id, evidence.id)
    evidence_state = await investigation_repo.get_evidence_state(investigation.id, evidence.id)
    assert evidence_state.analyzed is True

    # Test complete_investigation
    await investigation_repo.complete_investigation(investigation.id)
    retrieved_investigation = await investigation_repo.get_by_id(investigation.id)
    assert retrieved_investigation.completed is True