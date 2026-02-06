from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_

from database.models import Story, StoryNode, Character, Evidence

class StoryRepository:
    """Repository for Story model operations"""

    def __init__(self, session: AsyncSession):
        """Initialize the repository with a database session

        Args:
            session: SQLAlchemy async session
        """
        self.session = session

    async def get_all(self) -> List[Story]:
        """Get all stories

        Returns:
            List of all stories
        """
        result = await self.session.execute(select(Story))
        return result.scalars().all()

    async def get_by_id(self, story_id: int) -> Optional[Story]:
        """Get a story by ID

        Args:
            story_id: Story ID

        Returns:
            Story or None if not found
        """
        return await self.session.get(Story, story_id)

    async def get_free_stories(self) -> List[Story]:
        """Get all free stories (non-premium)

        Returns:
            List of free stories
        """
        result = await self.session.execute(
            select(Story).where(Story.is_premium == False)
        )
        return result.scalars().all()

    async def get_premium_stories(self) -> List[Story]:
        """Get all premium stories

        Returns:
            List of premium stories
        """
        result = await self.session.execute(
            select(Story).where(Story.is_premium == True)
        )
        return result.scalars().all()

    async def get_story_node(self, story_id: int, node_id: str) -> Optional[StoryNode]:
        """Get a specific story node

        Args:
            story_id: Story ID
            node_id: Node ID

        Returns:
            StoryNode or None if not found
        """
        result = await self.session.execute(
            select(StoryNode).where(
                StoryNode.story_id == story_id,
                StoryNode.node_id == node_id
            )
        )
        return result.scalars().first()

    async def get_all_story_nodes(self, story_id: int) -> List[StoryNode]:
        """Get all nodes for a story

        Args:
            story_id: Story ID

        Returns:
            List of StoryNode objects
        """
        result = await self.session.execute(
            select(StoryNode).where(StoryNode.story_id == story_id)
        )
        return result.scalars().all()

    async def get_character_by_id(self, character_id: int) -> Optional[Character]:
        """Get a character by ID

        Args:
            character_id: Character ID

        Returns:
            Character or None if not found
        """
        return await self.session.get(Character, character_id)

    async def get_story_characters(self, story_id: int) -> List[Character]:
        """Get all characters in a story

        Args:
            story_id: Story ID

        Returns:
            List of characters
        """
        result = await self.session.execute(
            select(Character).where(Character.story_id == story_id)
        )
        return result.scalars().all()

    async def get_evidence_by_id(self, evidence_id: int) -> Optional[Evidence]:
        """Get evidence by ID

        Args:
            evidence_id: Evidence ID

        Returns:
            Evidence or None if not found
        """
        return await self.session.get(Evidence, evidence_id)

    async def get_story_evidence(self, story_id: int) -> List[Evidence]:
        """Get all evidence in a story

        Args:
            story_id: Story ID

        Returns:
            List of evidence items
        """
        result = await self.session.execute(
            select(Evidence).where(Evidence.story_id == story_id)
        )
        return result.scalars().all()

    async def get_scene_evidence(self, story_id: int, scene: str) -> List[Evidence]:
        """Get all evidence in a specific scene

        Args:
            story_id: Story ID
            scene: Scene name

        Returns:
            List of evidence items in the scene
        """
        result = await self.session.execute(
            select(Evidence).where(
                Evidence.story_id == story_id,
                Evidence.scene == scene
            )
        )
        return result.scalars().all()

    async def create_story(self, title: str, description: str,
                          difficulty: str = "easy", is_premium: bool = False) -> Story:
        """Create a new story

        Args:
            title: Story title
            description: Story description
            difficulty: Difficulty level (easy, medium, hard)
            is_premium: Whether this is a premium story

        Returns:
            Newly created Story
        """
        story = Story(
            title=title,
            description=description,
            difficulty=difficulty,
            is_premium=is_premium
        )
        self.session.add(story)
        await self.session.flush()
        return story

    async def create_character(self, story_id: int, name: str, description: str,
                              initial_status: str = "witness") -> Character:
        """Create a new character

        Args:
            story_id: Story ID
            name: Character name
            description: Character description
            initial_status: Initial status (witness, suspect, criminal)

        Returns:
            Newly created Character
        """
        character = Character(
            story_id=story_id,
            name=name,
            description=description,
            initial_status=initial_status
        )
        self.session.add(character)
        await self.session.flush()
        return character

    async def create_evidence(self, story_id: int, name: str, description: str,
                             image_path: Optional[str] = None, scene: Optional[str] = None) -> Evidence:
        """Create a new evidence item

        Args:
            story_id: Story ID
            name: Evidence name
            description: Evidence description
            image_path: Path to evidence image
            scene: Scene where evidence is found

        Returns:
            Newly created Evidence
        """
        evidence = Evidence(
            story_id=story_id,
            name=name,
            description=description,
            image_path=image_path,
            scene=scene
        )
        self.session.add(evidence)
        await self.session.flush()
        return evidence

    async def create_story_node(self, story_id: int, node_id: str, content: str,
                               transitions: Dict[str, str]) -> StoryNode:
        """Create a new story node

        Args:
            story_id: Story ID
            node_id: Node identifier
            content: Node content text
            transitions: Dict of possible transitions

        Returns:
            Newly created StoryNode
        """
        node = StoryNode(
            story_id=story_id,
            node_id=node_id,
            content=content,
            transitions=transitions
        )
        self.session.add(node)
        await self.session.flush()
        return node

    async def import_story_data(self, story_data: Dict[str, Any]) -> Story:
        """Import a complete story from JSON data

        Args:
            story_data: Story data in JSON format

        Returns:
            Created Story object
        """
        # Create story
        story = await self.create_story(
            title=story_data["title"],
            description=story_data["description"],
            difficulty=story_data.get("difficulty", "easy"),
            is_premium=story_data.get("is_premium", False)
        )

        # Create characters
        for char_data in story_data.get("characters", []):
            await self.create_character(
                story_id=story.id,
                name=char_data["name"],
                description=char_data["description"],
                initial_status=char_data.get("initial_status", "witness")
            )

        # Create evidence
        for evid_data in story_data.get("evidence", []):
            await self.create_evidence(
                story_id=story.id,
                name=evid_data["name"],
                description=evid_data["description"],
                image_path=evid_data.get("image_path"),
                scene=evid_data.get("scene")
            )

        # Create story nodes
        for node_data in story_data.get("nodes", []):
            await self.create_story_node(
                story_id=story.id,
                node_id=node_data["node_id"],
                content=node_data["content"],
                transitions=node_data.get("transitions", {})
            )

        return story