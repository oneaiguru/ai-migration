import pytest
import pytest_asyncio

from database.repositories.user_repository import UserRepository
from database.repositories.story_repository import StoryRepository
from database.repositories.investigation_repository import InvestigationRepository
from story_engine.story_manager import StoryManager
from utils.exceptions import StoryError

# Test constants
TEST_USER_ID = 123456789
TEST_STORY_ID = 1

@pytest_asyncio.fixture(scope="function")
async def setup_story_data(test_session):
    """Set up test story data."""
    # Create repositories
    user_repo = UserRepository(test_session)
    story_repo = StoryRepository(test_session)

    # Create user
    user = await user_repo.create(
        telegram_id=TEST_USER_ID,
        username="test_user"
    )

    # Create story
    story = await story_repo.create_story(
        title="Test Story",
        description="Test description",
        difficulty="easy",
        is_premium=False
    )

    # Create characters
    character1 = await story_repo.create_character(
        story_id=story.id,
        name="Character 1",
        description="Description 1",
        initial_status="witness"
    )

    character2 = await story_repo.create_character(
        story_id=story.id,
        name="Character 2",
        description="Description 2",
        initial_status="suspect"
    )

    # Create evidence
    evidence1 = await story_repo.create_evidence(
        story_id=story.id,
        name="Evidence 1",
        description="Description 1",
        scene="Scene 1"
    )

    evidence2 = await story_repo.create_evidence(
        story_id=story.id,
        name="Evidence 2",
        description="Description 2",
        scene="Scene 2"
    )

    # Create story nodes
    start_node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="start",
        content="Start content",
        transitions={
            "Option 1": "node1",
            "Option 2": "node2"
        }
    )

    node1 = await story_repo.create_story_node(
        story_id=story.id,
        node_id="node1",
        content="Node 1 content",
        transitions={
            "Back to start": "start",
            "Go to node 3": "node3"
        }
    )

    node2 = await story_repo.create_story_node(
        story_id=story.id,
        node_id="node2",
        content="Node 2 content",
        transitions={
            "Back to start": "start",
            "Go to node 3": "node3"
        }
    )

    node3 = await story_repo.create_story_node(
        story_id=story.id,
        node_id="node3",
        content="Node 3 content",
        transitions={
            "Back to start": "start",
            "Solve case": "solve"
        }
    )

    solve_node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="solve",
        content="Solve content",
        transitions={
            "Accuse Character 1": "accuse_1",
            "Accuse Character 2": "accuse_2"
        }
    )

    accuse1_node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="accuse_1",
        content="Accuse 1 content",
        transitions={
            "Back to start": "start"
        }
    )

    accuse2_node = await story_repo.create_story_node(
        story_id=story.id,
        node_id="accuse_2",
        content="Accuse 2 content",
        transitions={
            "Back to start": "start"
        }
    )

    # Commit all changes
    await test_session.commit()

    return {
        "user_id": user.id,
        "story_id": story.id,
        "character1_id": character1.id,
        "character2_id": character2.id,
        "evidence1_id": evidence1.id,
        "evidence2_id": evidence2.id
    }

@pytest.mark.asyncio
async def test_start_story(setup_test_db, test_session, setup_story_data):
    """Test starting a story"""
    # Create repositories
    story_repo = StoryRepository(test_session)
    investigation_repo = InvestigationRepository(test_session)

    # Create story manager
    story_manager = StoryManager(story_repo, investigation_repo)

    # Get test data
    story_id = setup_story_data["story_id"]
    user_id = setup_story_data["user_id"]

    # Start story
    result = await story_manager.start_story(user_id, story_id)

    # Verify result
    assert result is not None
    assert "investigation_id" in result
    assert result["story_id"] == story_id
    assert result["story_title"] == "Test Story"
    assert result["current_node"] == "start"
    assert result["content"] == "Start content"
    assert "transitions" in result
    assert len(result["transitions"]) == 2
    assert "Option 1" in result["transitions"]

@pytest.mark.asyncio
async def test_advance_story(setup_test_db, test_session, setup_story_data):
    """Test advancing a story"""
    # Create repositories
    story_repo = StoryRepository(test_session)
    investigation_repo = InvestigationRepository(test_session)

    # Create story manager
    story_manager = StoryManager(story_repo, investigation_repo)

    # Get test data
    story_id = setup_story_data["story_id"]
    user_id = setup_story_data["user_id"]

    # Start story
    start_result = await story_manager.start_story(user_id, story_id)
    investigation_id = start_result["investigation_id"]

    # Advance story
    advance_result = await story_manager.advance_story(investigation_id, "Option 1")

    # Verify advance result
    assert advance_result is not None
    assert advance_result["investigation_id"] == investigation_id
    assert advance_result["current_node"] == "node1"
    assert advance_result["content"] == "Node 1 content"
    assert "transitions" in advance_result
    assert len(advance_result["transitions"]) == 2
    assert "Back to start" in advance_result["transitions"]

    # Advance again
    advance_result2 = await story_manager.advance_story(investigation_id, "Go to node 3")

    # Verify second advance
    assert advance_result2["current_node"] == "node3"

    # Try invalid choice
    with pytest.raises(StoryError):
        await story_manager.advance_story(investigation_id, "Invalid option")

@pytest.mark.asyncio
async def test_get_current_state(setup_test_db, test_session, setup_story_data):
    """Test getting current state"""
    # Create repositories
    story_repo = StoryRepository(test_session)
    investigation_repo = InvestigationRepository(test_session)

    # Create story manager
    story_manager = StoryManager(story_repo, investigation_repo)

    # Get test data
    story_id = setup_story_data["story_id"]
    user_id = setup_story_data["user_id"]

    # Start story
    start_result = await story_manager.start_story(user_id, story_id)
    investigation_id = start_result["investigation_id"]

    # Get current state
    state = await story_manager.get_current_state(investigation_id)

    # Verify state
    assert state is not None
    assert state["investigation_id"] == investigation_id
    assert state["story_id"] == story_id
    assert state["current_node"] == "start"
    assert "characters" in state
    assert len(state["characters"]) == 2
    assert state["characters"][0]["name"] == "Character 1"
    assert state["characters"][1]["name"] == "Character 2"
    assert "evidence" in state
    assert len(state["evidence"]) == 0  # No evidence discovered yet
    assert state["completed"] is False

@pytest.mark.asyncio
async def test_evidence_discovery(setup_test_db, test_session, setup_story_data):
    """Test evidence discovery"""
    # Create repositories
    story_repo = StoryRepository(test_session)
    investigation_repo = InvestigationRepository(test_session)

    # Create story manager
    story_manager = StoryManager(story_repo, investigation_repo)

    # Get test data
    story_id = setup_story_data["story_id"]
    user_id = setup_story_data["user_id"]
    evidence_id = setup_story_data["evidence1_id"]

    # Start story
    start_result = await story_manager.start_story(user_id, story_id)
    investigation_id = start_result["investigation_id"]

    # Discover evidence
    await investigation_repo.discover_evidence(investigation_id, evidence_id)

    # Get current state
    state = await story_manager.get_current_state(investigation_id)

    # Verify evidence discovered
    assert len(state["evidence"]) == 1
    assert state["evidence"][0]["name"] == "Evidence 1"
    assert state["evidence"][0]["analyzed"] is False

    # Analyze evidence
    await investigation_repo.analyze_evidence(investigation_id, evidence_id)

    # Get updated state
    updated_state = await story_manager.get_current_state(investigation_id)

    # Verify evidence analyzed
    assert updated_state["evidence"][0]["analyzed"] is True

@pytest.mark.asyncio
async def test_character_status_changes(setup_test_db, test_session, setup_story_data):
    """Test character status changes"""
    # Create repositories
    story_repo = StoryRepository(test_session)
    investigation_repo = InvestigationRepository(test_session)

    # Create story manager
    story_manager = StoryManager(story_repo, investigation_repo)

    # Get test data
    story_id = setup_story_data["story_id"]
    user_id = setup_story_data["user_id"]
    character1_id = setup_story_data["character1_id"]
    character2_id = setup_story_data["character2_id"]

    # Start story
    start_result = await story_manager.start_story(user_id, story_id)
    investigation_id = start_result["investigation_id"]

    # Get initial state
    initial_state = await story_manager.get_current_state(investigation_id)

    # Verify initial character statuses
    assert initial_state["characters"][0]["status"] == "witness"
    assert initial_state["characters"][1]["status"] == "suspect"

    # Change character 1 to suspect
    await investigation_repo.update_character_status(investigation_id, character1_id, "suspect")

    # Change character 2 to criminal
    await investigation_repo.update_character_status(investigation_id, character2_id, "criminal")

    # Get updated state
    updated_state = await story_manager.get_current_state(investigation_id)

    # Verify updated character statuses
    assert updated_state["characters"][0]["status"] == "suspect"
    assert updated_state["characters"][1]["status"] == "criminal"