from typing import Dict, List, Optional, Any
import json
import logging
from pathlib import Path

from database.repositories.story_repository import StoryRepository
from database.repositories.investigation_repository import InvestigationRepository
from utils.exceptions import StoryError
from utils.logger import async_log_decorator

logger = logging.getLogger(__name__)

class StoryManager:
    """Manager for story operations and game flow"""

    def __init__(
        self,
        story_repository: StoryRepository,
        investigation_repository: InvestigationRepository
    ):
        """Initialize the story manager

        Args:
            story_repository: Repository for story operations
            investigation_repository: Repository for investigation operations
        """
        self.story_repository = story_repository
        self.investigation_repository = investigation_repository

    @async_log_decorator
    async def get_available_stories(self, is_premium: bool = False) -> List[Dict[str, Any]]:
        """Get available stories based on user's subscription status

        Args:
            is_premium: Whether the user has premium access

        Returns:
            List of story dictionaries with basic information
        """
        try:
            if is_premium:
                stories = await self.story_repository.get_all()
            else:
                stories = await self.story_repository.get_free_stories()

            # Return a consistent format (dictionaries) regardless of input type
            result = []
            for story in stories:
                if isinstance(story, dict):
                    result.append(story)
                else:
                    result.append({
                        "id": story.id,
                        "title": story.title,
                        "description": story.description,
                        "difficulty": getattr(story, "difficulty", "easy"),
                        "is_premium": getattr(story, "is_premium", False)
                    })

            logger.debug(f"Retrieved stories: {result}")
            logger.debug(f"Story type: {type(result)} and item type: {type(result[0]) if result else None}")

            return result
        except Exception as e:
            logger.error(f"Error getting available stories: {e}")
            return []

    @async_log_decorator
    async def start_story(self, user_id: int, story_id: int) -> Dict[str, Any]:
        """Start a new investigation for a user

        Args:
            user_id: User ID
            story_id: Story ID

        Returns:
            Dictionary with investigation information

        Raises:
            StoryError: If story cannot be started
        """
        try:
            logger.info(f"Started story {story_id} for user {user_id}")
            # Start investigation
            investigation = await self.investigation_repository.start_investigation(user_id, story_id)

            # Get story and start node
            story = await self.story_repository.get_by_id(story_id)
            if not story:
                raise StoryError(f"Story with ID {story_id} not found")

            start_node = await self.story_repository.get_story_node(story_id, investigation.current_node)
            if not start_node:
                raise StoryError(f"Start node not found for story {story_id}")

            # Return a dictionary with all relevant information
            return {
                "investigation_id": investigation.id,
                "story_id": story_id,
                "story_title": story.title,
                "description": story.description,
                "current_node": investigation.current_node,
                "content": start_node.content,
                "transitions": start_node.transitions or {}
            }
        except Exception as e:
            logger.error(f"Failed to create investigation for user {user_id}, story {story_id}")
            raise StoryError(f"Failed to start investigation")

    @async_log_decorator
    async def advance_story(
        self,
        investigation_id: int,
        choice: str
    ) -> Dict[str, Any]:
        """Advance the story based on user's choice

        Args:
            investigation_id: Investigation ID
            choice: User's choice

        Returns:
            Dictionary with next node information

        Raises:
            StoryError: If story cannot be advanced
        """
        try:
            # Get current investigation
            investigation = await self.investigation_repository.get_by_id(investigation_id)
            if not investigation:
                raise StoryError(f"Investigation {investigation_id} not found")

            # Get current node
            current_node = await self.story_repository.get_story_node(
                investigation.story_id,
                investigation.current_node
            )
            if not current_node:
                raise StoryError(f"Current node {investigation.current_node} not found")

            # Check if choice is valid
            transitions = current_node.transitions or {}
            if not transitions or choice not in transitions:
                raise StoryError(f"Invalid choice: {choice}")

            # Get next node
            next_node_id = transitions[choice]
            next_node = await self.story_repository.get_story_node(
                investigation.story_id,
                next_node_id
            )
            if not next_node:
                raise StoryError(f"Next node {next_node_id} not found")

            # Update investigation node
            await self.investigation_repository.update_node(investigation_id, next_node_id)

            # Check for evidence discovery in this node
            # This would be expanded in future versions to automatically discover evidence
            # based on node content or special node properties

            return {
                "investigation_id": investigation_id,
                "current_node": next_node_id,
                "content": next_node.content,
                "transitions": next_node.transitions or {}
            }
        except StoryError as e:
            # Re-raise specific story errors
            raise
        except Exception as e:
            logger.error(f"Error advancing story: {e}")
            raise StoryError(f"Failed to advance story: {e}")

    @async_log_decorator
    async def get_current_state(self, investigation_id: int) -> Dict[str, Any]:
        """Get the current state of an investigation

        Args:
            investigation_id: Investigation ID

        Returns:
            Dictionary with current investigation state

        Raises:
            StoryError: If state cannot be retrieved
        """
        try:
            # Get investigation
            investigation = await self.investigation_repository.get_by_id(investigation_id)
            if not investigation:
                raise StoryError(f"Investigation {investigation_id} not found")

            # Get current node
            current_node = await self.story_repository.get_story_node(
                investigation.story_id,
                investigation.current_node
            )
            if not current_node:
                raise StoryError(f"Current node {investigation.current_node} not found")

            # Get story
            story = await self.story_repository.get_by_id(investigation.story_id)
            if not story:
                raise StoryError(f"Story {investigation.story_id} not found")

            # Get character states
            character_states = await self.investigation_repository.get_character_states(investigation_id)
            characters = []
            for cs in character_states:
                character = cs.character
                characters.append({
                    "id": character.id,
                    "name": character.name,
                    "status": cs.status,
                    "notes": cs.notes
                })

            # Get discovered evidence
            evidence_list = await self.investigation_repository.get_discovered_evidence(investigation_id)

            return {
                "investigation_id": investigation_id,
                "story_id": investigation.story_id,
                "story_title": story.title,
                "current_node": investigation.current_node,
                "content": current_node.content,
                "transitions": current_node.transitions or {},
                "characters": characters,
                "evidence": evidence_list,
                "completed": investigation.completed
            }
        except StoryError as e:
            # Re-raise specific story errors
            raise
        except Exception as e:
            logger.error(f"Error getting investigation state: {e}")
            raise StoryError(f"Failed to get investigation state: {e}")

    @staticmethod
    @async_log_decorator
    async def import_story_from_file(story_repository: StoryRepository, file_path: str) -> Optional[int]:
        """Import a story from a JSON file

        Args:
            story_repository: Repository for story operations
            file_path: Path to the story JSON file

        Returns:
            ID of the imported story or None if import failed

        Raises:
            StoryError: If story cannot be imported
        """
        try:
            # Check if file exists
            path = Path(file_path)
            if not path.exists():
                raise StoryError(f"Story file not found: {file_path}")

            # Load JSON
            with open(path, 'r', encoding='utf-8') as f:
                story_data = json.load(f)

            # Import story
            story = await story_repository.import_story_data(story_data)
            logger.info(f"Successfully imported story: {story.title} (ID: {story.id})")

            return story.id
        except Exception as e:
            logger.error(f"Error importing story from file: {e}")
            raise StoryError(f"Failed to import story: {e}")

    @async_log_decorator
    async def get_story_statistics(self, story_id: int) -> Dict[str, Any]:
        """Get statistics for a story

        Args:
            story_id: Story ID

        Returns:
            Dictionary with story statistics

        Raises:
            StoryError: If statistics cannot be retrieved
        """
        try:
            # Get story
            story = await self.story_repository.get_by_id(story_id)
            if not story:
                raise StoryError(f"Story with ID {story_id} not found")

            # Get investigation count
            investigation_count = await self.investigation_repository.get_story_investigation_count(story_id)

            # Get completion count and rate
            completion_count = await self.investigation_repository.get_story_completion_count(story_id)
            completion_rate = (completion_count / investigation_count) * 100 if investigation_count > 0 else 0

            # Get average time to complete
            avg_time = await self.investigation_repository.get_average_completion_time(story_id)

            return {
                "story_id": story_id,
                "title": story.title,
                "investigation_count": investigation_count,
                "completion_count": completion_count,
                "completion_rate": round(completion_rate, 2),
                "average_completion_time": avg_time
            }
        except StoryError as e:
            # Re-raise specific story errors
            raise
        except Exception as e:
            logger.error(f"Error getting story statistics: {e}")
            raise StoryError(f"Failed to get story statistics: {e}")

    @async_log_decorator
    async def export_story_to_file(self, story_id: int, output_path: str) -> bool:
        """Export a story to a JSON file

        Args:
            story_id: Story ID
            output_path: Path to save the story JSON file

        Returns:
            True if export successful, False otherwise

        Raises:
            StoryError: If story cannot be exported
        """
        try:
            # Get story
            story = await self.story_repository.get_by_id(story_id)
            if not story:
                raise StoryError(f"Story with ID {story_id} not found")

            # Get nodes
            nodes = await self.story_repository.get_story_nodes(story_id)

            # Get characters
            characters = await self.story_repository.get_story_characters(story_id)

            # Get evidence
            evidence = await self.story_repository.get_story_evidence(story_id)

            # Build story data
            story_data = {
                "title": story.title,
                "description": story.description,
                "difficulty": story.difficulty,
                "is_premium": story.is_premium,
                "nodes": [
                    {
                        "node_id": node.node_id,
                        "content": node.content,
                        "transitions": node.transitions
                    } for node in nodes
                ],
                "characters": [
                    {
                        "name": character.name,
                        "description": character.description,
                        "initial_status": character.initial_status
                    } for character in characters
                ],
                "evidence": [
                    {
                        "name": ev.name,
                        "description": ev.description,
                        "scene": ev.scene
                    } for ev in evidence
                ]
            }

            # Save to file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(story_data, f, ensure_ascii=False, indent=2)

            logger.info(f"Successfully exported story {story.title} to {output_path}")
            return True

        except Exception as e:
            logger.error(f"Error exporting story: {e}")
            raise StoryError(f"Failed to export story: {e}")