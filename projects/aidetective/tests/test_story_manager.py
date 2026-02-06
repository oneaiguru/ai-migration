# tests/test_story_manager.py
import pytest
import os
import json
from unittest.mock import MagicMock, patch, AsyncMock

from story_engine.story_manager import StoryManager
from utils.exceptions import StoryError

@pytest.fixture
def mock_story_repo():
    """Create a mock StoryRepository"""
    repo = AsyncMock()
    
    # Mock story
    story = MagicMock()
    story.id = 1
    story.title = "Test Story"
    story.description = "Test description"
    
    # Mock node
    start_node = MagicMock()
    start_node.node_id = "start"
    start_node.content = "Start node content"
    start_node.transitions = {"option1": "node1", "option2": "node2"}
    
    next_node = MagicMock()
    next_node.node_id = "node1"
    next_node.content = "Next node content"
    next_node.transitions = {"option3": "node3", "option4": "node4"}
    
    # Configure mocks
    repo.get_all.return_value = [story]
    repo.get_free_stories.return_value = [story]
    repo.get_by_id.return_value = story
    repo.get_story_node.side_effect = lambda story_id, node_id: {
        "start": start_node,
        "node1": next_node
    }.get(node_id)
    
    return repo

@pytest.fixture
def mock_investigation_repo():
    """Create a mock InvestigationRepository"""
    repo = AsyncMock()
    
    # Mock investigation
    investigation = MagicMock()
    investigation.id = 1
    investigation.user_id = 123
    investigation.story_id = 1
    investigation.current_node = "start"
    investigation.completed = False
    
    # Mock character state
    character_state = MagicMock()
    character_state.character_id = 1
    character_state.status = "witness"
    character_state.character.id = 1
    character_state.character.name = "Test Character"
    
    # Configure mocks
    repo.start_investigation.return_value = investigation
    repo.get_by_id.return_value = investigation
    repo.get_character_states.return_value = [character_state]
    repo.get_discovered_evidence.return_value = []
    
    return repo

@pytest.mark.asyncio
async def test_get_available_stories(mock_story_repo, mock_investigation_repo):
    """Test getting available stories"""
    story_manager = StoryManager(mock_story_repo, mock_investigation_repo)
    
    # Test free stories
    free_stories = await story_manager.get_available_stories(is_premium=False)
    assert len(free_stories) == 1
    assert free_stories[0]["id"] == 1
    assert free_stories[0]["title"] == "Test Story"
    mock_story_repo.get_free_stories.assert_called_once()
    
    # Test all stories (premium)
    all_stories = await story_manager.get_available_stories(is_premium=True)
    assert len(all_stories) == 1
    assert all_stories[0]["id"] == 1
    mock_story_repo.get_all.assert_called_once()

@pytest.mark.asyncio
async def test_start_story(mock_story_repo, mock_investigation_repo):
    """Test starting a story"""
    story_manager = StoryManager(mock_story_repo, mock_investigation_repo)
    
    # Test successful start
    result = await story_manager.start_story(123, 1)
    assert result["investigation_id"] == 1
    assert result["story_id"] == 1
    assert result["story_title"] == "Test Story"
    assert result["current_node"] == "start"
    assert result["content"] == "Start node content"
    assert result["transitions"] == {"option1": "node1", "option2": "node2"}
    
    mock_investigation_repo.start_investigation.assert_called_once_with(123, 1)
    mock_story_repo.get_by_id.assert_called_once_with(1)
    mock_story_repo.get_story_node.assert_called_once_with(1, "start")
    
    # Test story not found
    mock_story_repo.get_by_id.return_value = None
    with pytest.raises(StoryError):
        await story_manager.start_story(123, 2)

    # Test start node not found
    mock_story_repo.get_by_id.return_value = MagicMock(id=1)
    mock_story_repo.get_story_node.side_effect = None
    mock_story_repo.get_story_node.return_value = None
    with pytest.raises(StoryError):
        await story_manager.start_story(123, 1)

@pytest.mark.asyncio
async def test_advance_story(mock_story_repo, mock_investigation_repo):
    """Test advancing a story"""
    story_manager = StoryManager(mock_story_repo, mock_investigation_repo)
    
    # Test successful advance
    result = await story_manager.advance_story(1, "option1")
    assert result["investigation_id"] == 1
    assert result["current_node"] == "node1"
    assert result["content"] == "Next node content"
    assert result["transitions"] == {"option3": "node3", "option4": "node4"}
    
    mock_investigation_repo.get_by_id.assert_called_once_with(1)
    mock_story_repo.get_story_node.assert_any_call(1, "start")
    mock_story_repo.get_story_node.assert_any_call(1, "node1")
    mock_investigation_repo.update_node.assert_called_once_with(1, "node1")
    
    # Test investigation not found
    mock_investigation_repo.get_by_id.return_value = None
    with pytest.raises(StoryError):
        await story_manager.advance_story(2, "option1")
    
    # Test current node not found
    mock_investigation_repo.get_by_id.return_value = MagicMock(id=1, story_id=1, current_node="invalid")
    mock_story_repo.get_story_node.side_effect = lambda story_id, node_id: None
    with pytest.raises(StoryError):
        await story_manager.advance_story(1, "option1")
    
    # Test invalid choice
    mock_investigation_repo.get_by_id.return_value = MagicMock(id=1, story_id=1, current_node="start")
    mock_story_repo.get_story_node.side_effect = lambda story_id, node_id: {
        "start": MagicMock(transitions={"valid": "node1"})
    }.get(node_id)
    with pytest.raises(StoryError):
        await story_manager.advance_story(1, "invalid")

@pytest.mark.asyncio
async def test_get_current_state(mock_story_repo, mock_investigation_repo):
    """Test getting current state"""
    story_manager = StoryManager(mock_story_repo, mock_investigation_repo)
    
    # Test successful state retrieval
    result = await story_manager.get_current_state(1)
    assert result["investigation_id"] == 1
    assert result["story_id"] == 1
    assert result["story_title"] == "Test Story"
    assert result["current_node"] == "start"
    assert result["content"] == "Start node content"
    assert result["transitions"] == {"option1": "node1", "option2": "node2"}
    assert len(result["characters"]) == 1
    assert result["characters"][0]["name"] == "Test Character"
    assert len(result["evidence"]) == 0
    assert result["completed"] is False
    
    mock_investigation_repo.get_by_id.assert_called_once_with(1)
    mock_story_repo.get_story_node.assert_called_once_with(1, "start")
    mock_story_repo.get_by_id.assert_called_once_with(1)
    mock_investigation_repo.get_character_states.assert_called_once_with(1)
    mock_investigation_repo.get_discovered_evidence.assert_called_once_with(1)
    
    # Test investigation not found
    mock_investigation_repo.get_by_id.return_value = None
    with pytest.raises(StoryError):
        await story_manager.get_current_state(2)
    
    # Test current node not found
    mock_investigation_repo.get_by_id.return_value = MagicMock(id=1, story_id=1, current_node="invalid")
    mock_story_repo.get_story_node.side_effect = lambda story_id, node_id: None
    with pytest.raises(StoryError):
        await story_manager.get_current_state(1)

@pytest.mark.asyncio
async def test_import_story_from_file(mock_story_repo, mock_investigation_repo, tmp_path):
    """Test importing a story from file"""
    # Create a test story file
    story_data = {
        "id": 1,
        "title": "Test Story",
        "description": "Test description",
        "difficulty": "easy",
        "is_premium": False,
        "characters": [
            {
                "id": 1,
                "name": "Test Character",
                "description": "Test character description",
                "initial_status": "witness"
            }
        ],
        "evidence": [
            {
                "id": 1,
                "name": "Test Evidence",
                "description": "Test evidence description",
                "scene": "Test Scene"
            }
        ],
        "nodes": [
            {
                "node_id": "start",
                "content": "Start node content",
                "transitions": {"option1": "node1", "option2": "node2"}
            }
        ]
    }
    
    # Write story to temporary file
    test_file = tmp_path / "test_story.json"
    with open(test_file, "w") as f:
        json.dump(story_data, f)
    
    # Mock import_story_data
    mock_story = MagicMock(id=1, title="Test Story")
    mock_story_repo.import_story_data.return_value = mock_story
    
    # Test successful import
    story_id = await StoryManager.import_story_from_file(mock_story_repo, str(test_file))
    assert story_id == 1
    mock_story_repo.import_story_data.assert_called_once_with(story_data)
    
    # Test file not found
    with pytest.raises(StoryError):
        await StoryManager.import_story_from_file(mock_story_repo, "nonexistent.json")
