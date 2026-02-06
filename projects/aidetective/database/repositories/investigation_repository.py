from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, and_, desc, exists
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload
from datetime import datetime
import logging

from database.models import (
    Investigation, CharacterState, EvidenceState,
    Character, Evidence, User, Story, ConversationEntry
)

logger = logging.getLogger(__name__)

class InvestigationRepository:
    """Repository for Investigation model operations"""

    def __init__(self, session: AsyncSession):
        """Initialize the repository with a database session

        Args:
            session: SQLAlchemy async session
        """
        self.session = session

    async def get_by_id(self, investigation_id: int) -> Optional[Investigation]:
        """Get an investigation by ID

        Args:
            investigation_id: Investigation ID

        Returns:
            Investigation or None if not found
        """
        try:
            return await self.session.get(Investigation, investigation_id)
        except SQLAlchemyError as e:
            logger.error(f"Database error getting investigation {investigation_id}: {e}")
            return None

    async def get_active_investigation(self, user_id: int) -> Optional[Investigation]:
        """Get the most recent active investigation for a user

        Args:
            user_id: User ID

        Returns:
            Most recent Investigation or None if not found
        """
        try:
            result = await self.session.execute(
                select(Investigation)
                .where(and_(
                    Investigation.user_id == user_id,
                    Investigation.completed == False
                ))
                .order_by(desc(Investigation.updated_at))
                .limit(1)
            )
            return result.scalars().first()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting active investigation for user {user_id}: {e}")
            return None

    async def get_completed_investigations(self, user_id: int) -> List[Investigation]:
        """Get all completed investigations for a user

        Args:
            user_id: User ID

        Returns:
            List of completed investigations
        """
        try:
            result = await self.session.execute(
                select(Investigation)
                .where(and_(
                    Investigation.user_id == user_id,
                    Investigation.completed == True
                ))
                .order_by(desc(Investigation.completed_at))
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting completed investigations for user {user_id}: {e}")
            return []

    async def get_completed_investigation_count(self, user_id: int) -> int:
        """Get the count of completed investigations for a user

        Args:
            user_id: User ID

        Returns:
            Count of completed investigations
        """
        try:
            result = await self.session.execute(
                select(Investigation)
                .where(and_(
                    Investigation.user_id == user_id,
                    Investigation.completed == True
                ))
            )
            return len(result.scalars().all())
        except SQLAlchemyError as e:
            logger.error(f"Database error counting completed investigations for user {user_id}: {e}")
            return 0

    async def get_total_evidence_discovered(self, user_id: int) -> int:
        """Get the total count of evidence discovered by a user across all investigations

        Args:
            user_id: User ID

        Returns:
            Count of discovered evidence
        """
        try:
            # First get investigation IDs for this user
            investigations = await self.session.execute(
                select(Investigation.id).where(Investigation.user_id == user_id)
            )
            investigation_ids = [inv[0] for inv in investigations]

            if not investigation_ids:
                return 0

            # Count evidence states
            result = await self.session.execute(
                select(EvidenceState)
                .where(and_(
                    EvidenceState.investigation_id.in_(investigation_ids),
                    EvidenceState.discovered == True
                ))
            )
            return len(result.scalars().all())
        except SQLAlchemyError as e:
            logger.error(f"Database error counting evidence for user {user_id}: {e}")
            return 0

    async def start_investigation(self, user_id: int, story_id: int) -> Optional[Investigation]:
        """Start a new investigation for a user

        Args:
            user_id: User ID
            story_id: Story ID

        Returns:
            Newly created Investigation or None if error

        Raises:
            ValueError: If user or story not found
        """
        try:
            # Get user and story to validate they exist
            user_result = await self.session.execute(
                select(User).where(User.id == user_id)
            )
            user = user_result.scalars().first()

            story_result = await self.session.execute(
                select(Story).where(Story.id == story_id)
            )
            story = story_result.scalars().first()

            if not user or not story:
                raise ValueError(f"User {user_id} or Story {story_id} not found")

            # Create new investigation
            investigation = Investigation(
                user_id=user_id,
                story_id=story_id,
                current_node="start"
            )
            self.session.add(investigation)
            await self.session.flush()

            # Initialize character states
            char_result = await self.session.execute(
                select(Character).where(Character.story_id == story_id)
            )
            characters = char_result.scalars().all()

            for character in characters:
                character_state = CharacterState(
                    investigation_id=investigation.id,
                    character_id=character.id,
                    status=character.initial_status
                )
                self.session.add(character_state)

            # Initialize evidence states
            evid_result = await self.session.execute(
                select(Evidence).where(Evidence.story_id == story_id)
            )
            evidence_items = evid_result.scalars().all()

            for evidence in evidence_items:
                evidence_state = EvidenceState(
                    investigation_id=investigation.id,
                    evidence_id=evidence.id,
                    discovered=False,
                    analyzed=False
                )
                self.session.add(evidence_state)

            await self.session.flush()
            return investigation
        except ValueError:
            # Re-raise validation errors
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error starting investigation for user {user_id}, story {story_id}: {e}")
            return None

    async def update_node(self, investigation_id: int, node_id: str) -> bool:
        """Update the current node of an investigation

        Args:
            investigation_id: Investigation ID
            node_id: New node ID

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                update(Investigation)
                .where(Investigation.id == investigation_id)
                .values(
                    current_node=node_id,
                    updated_at=datetime.utcnow()
                )
            )
            await self.session.flush()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            logger.error(f"Database error updating node for investigation {investigation_id}: {e}")
            return False

    async def complete_investigation(self, investigation_id: int) -> bool:
        """Mark an investigation as completed

        Args:
            investigation_id: Investigation ID

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                update(Investigation)
                .where(Investigation.id == investigation_id)
                .values(
                    completed=True,
                    completed_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
            )
            await self.session.flush()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            logger.error(f"Database error completing investigation {investigation_id}: {e}")
            return False

    async def update_character_status(self, investigation_id: int, character_id: int, new_status: str) -> bool:
        """Update the status of a character in an investigation

        Args:
            investigation_id: Investigation ID
            character_id: Character ID
            new_status: New status (witness, suspect, criminal)

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                select(CharacterState).where(
                    CharacterState.investigation_id == investigation_id,
                    CharacterState.character_id == character_id
                )
            )
            character_state = result.scalars().first()

            if character_state:
                character_state.status = new_status
                await self.session.flush()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error updating character status for investigation {investigation_id}, character {character_id}: {e}")
            return False

    async def update_character_notes(self, investigation_id: int, character_id: int, notes: str) -> bool:
        """Update notes for a character in an investigation

        Args:
            investigation_id: Investigation ID
            character_id: Character ID
            notes: Notes text

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                select(CharacterState).where(
                    CharacterState.investigation_id == investigation_id,
                    CharacterState.character_id == character_id
                )
            )
            character_state = result.scalars().first()

            if character_state:
                character_state.notes = notes
                await self.session.flush()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error updating character notes for investigation {investigation_id}, character {character_id}: {e}")
            return False

    async def discover_evidence(self, investigation_id: int, evidence_id: int, analyzed: bool = False) -> bool:
        """Mark evidence as discovered in an investigation

        Args:
            investigation_id: Investigation ID
            evidence_id: Evidence ID
            analyzed: Whether the evidence has been analyzed

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                select(EvidenceState).where(
                    EvidenceState.investigation_id == investigation_id,
                    EvidenceState.evidence_id == evidence_id
                )
            )
            evidence_state = result.scalars().first()

            if evidence_state:
                evidence_state.discovered = True
                evidence_state.analyzed = analyzed
                await self.session.flush()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error discovering evidence for investigation {investigation_id}, evidence {evidence_id}: {e}")
            return False

    async def analyze_evidence(self, investigation_id: int, evidence_id: int) -> bool:
        """Mark evidence as analyzed in an investigation

        Args:
            investigation_id: Investigation ID
            evidence_id: Evidence ID

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                select(EvidenceState).where(
                    EvidenceState.investigation_id == investigation_id,
                    EvidenceState.evidence_id == evidence_id
                )
            )
            evidence_state = result.scalars().first()

            if evidence_state and evidence_state.discovered:
                evidence_state.analyzed = True
                await self.session.flush()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error analyzing evidence for investigation {investigation_id}, evidence {evidence_id}: {e}")
            return False

    async def save_evidence_analysis(self, investigation_id: int, evidence_id: int, analysis: str) -> bool:
        """Save analysis notes for evidence

        Args:
            investigation_id: Investigation ID
            evidence_id: Evidence ID
            analysis: Analysis text

        Returns:
            True if successful, False otherwise
        """
        try:
            result = await self.session.execute(
                select(EvidenceState).where(
                    EvidenceState.investigation_id == investigation_id,
                    EvidenceState.evidence_id == evidence_id
                )
            )
            evidence_state = result.scalars().first()

            if evidence_state and evidence_state.discovered:
                evidence_state.notes = analysis
                evidence_state.analyzed = True
                await self.session.flush()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Database error saving evidence analysis for investigation {investigation_id}, evidence {evidence_id}: {e}")
            return False

    async def get_character_states(self, investigation_id: int) -> List[CharacterState]:
        """Get all character states for an investigation

        Args:
            investigation_id: Investigation ID

        Returns:
            List of character states
        """
        try:
            result = await self.session.execute(
                select(CharacterState)
                .options(selectinload(CharacterState.character))
                .where(CharacterState.investigation_id == investigation_id)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting character states for investigation {investigation_id}: {e}")
            return []

    async def get_character_state(self, investigation_id: int, character_id: int) -> Optional[CharacterState]:
        """Get a specific character state

        Args:
            investigation_id: Investigation ID
            character_id: Character ID

        Returns:
            CharacterState or None if not found
        """
        try:
            result = await self.session.execute(
                select(CharacterState).where(
                    CharacterState.investigation_id == investigation_id,
                    CharacterState.character_id == character_id
                )
            )
            return result.scalars().first()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting character state for investigation {investigation_id}, character {character_id}: {e}")
            return None

    async def get_evidence_states(self, investigation_id: int) -> List[EvidenceState]:
        """Get all evidence states for an investigation

        Args:
            investigation_id: Investigation ID

        Returns:
            List of evidence states
        """
        try:
            result = await self.session.execute(
                select(EvidenceState)
                .options(selectinload(EvidenceState.evidence))
                .where(EvidenceState.investigation_id == investigation_id)
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting evidence states for investigation {investigation_id}: {e}")
            return []

    async def get_evidence_state(self, investigation_id: int, evidence_id: int) -> Optional[EvidenceState]:
        """Get a specific evidence state

        Args:
            investigation_id: Investigation ID
            evidence_id: Evidence ID

        Returns:
            EvidenceState or None if not found
        """
        try:
            result = await self.session.execute(
                select(EvidenceState).where(
                    EvidenceState.investigation_id == investigation_id,
                    EvidenceState.evidence_id == evidence_id
                )
            )
            return result.scalars().first()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting evidence state for investigation {investigation_id}, evidence {evidence_id}: {e}")
            return None

    async def get_evidence_states_by_scene(self, investigation_id: int, scene: str) -> List[EvidenceState]:
        """Get evidence states for a specific scene

        Args:
            investigation_id: Investigation ID
            scene: Scene name

        Returns:
            List of evidence states
        """
        try:
            # First get the story_id for this investigation
            inv_result = await self.session.execute(
                select(Investigation).where(Investigation.id == investigation_id)
            )
            investigation = inv_result.scalars().first()

            if not investigation:
                return []

            # Get evidence IDs for this scene
            evidence_result = await self.session.execute(
                select(Evidence.id).where(
                    Evidence.story_id == investigation.story_id,
                    Evidence.scene == scene
                )
            )
            evidence_ids = [e[0] for e in evidence_result]

            if not evidence_ids:
                return []

            # Get evidence states for these IDs
            result = await self.session.execute(
                select(EvidenceState).where(
                    EvidenceState.investigation_id == investigation_id,
                    EvidenceState.evidence_id.in_(evidence_ids)
                )
            )
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Database error getting evidence states by scene for investigation {investigation_id}, scene {scene}: {e}")
            return []

    async def get_discovered_evidence(self, investigation_id: int) -> List[Dict[str, Any]]:
        """Get all discovered evidence for an investigation with full details

        Args:
            investigation_id: Investigation ID

        Returns:
            List of evidence dictionaries with details
        """
        try:
            result = await self.session.execute(
                select(EvidenceState, Evidence)
                .join(Evidence, EvidenceState.evidence_id == Evidence.id)
                .where(
                    EvidenceState.investigation_id == investigation_id,
                    EvidenceState.discovered == True
                )
            )

            evidence_list = []
            for es, e in result:
                evidence_list.append({
                    "id": e.id,
                    "name": e.name,
                    "description": e.description,
                    "analyzed": es.analyzed,
                    "notes": es.notes,
                    "image_path": e.image_path,
                    "scene": e.scene
                })

            return evidence_list
        except SQLAlchemyError as e:
            logger.error(f"Database error getting discovered evidence for investigation {investigation_id}: {e}")
            return []

    async def add_conversation_entry(
        self, investigation_id: int, character_id: int,
        user_message: str, character_response: str
    ) -> Optional[ConversationEntry]:
        """Add a conversation entry between user and character

        Args:
            investigation_id: Investigation ID
            character_id: Character ID
            user_message: Message from user
            character_response: Response from character

        Returns:
            Created ConversationEntry or None if error
        """
        try:
            # First check if investigation and character exist
            inv_exists = await self.session.execute(
                select(exists().where(Investigation.id == investigation_id))
            )
            if not inv_exists.scalar():
                logger.warning(f"Attempted to add conversation to non-existent investigation {investigation_id}")
                return None

            char_exists = await self.session.execute(
                select(exists().where(Character.id == character_id))
            )
            if not char_exists.scalar():
                logger.warning(f"Attempted to add conversation with non-existent character {character_id}")
                return None

            entry = ConversationEntry(
                investigation_id=investigation_id,
                character_id=character_id,
                user_message=user_message,
                character_response=character_response
            )
            self.session.add(entry)
            await self.session.flush()
            return entry
        except SQLAlchemyError as e:
            logger.error(f"Database error adding conversation entry for investigation {investigation_id}, character {character_id}: {e}")
            return None

    async def get_conversation_history(
        self, investigation_id: int, character_id: int, limit: int = 10
    ) -> List[Dict[str, str]]:
        """Get conversation history between user and character

        Args:
            investigation_id: Investigation ID
            character_id: Character ID
            limit: Maximum number of entries to return

        Returns:
            List of conversation entries as dictionaries
        """
        try:
            result = await self.session.execute(
                select(ConversationEntry)
                .where(
                    ConversationEntry.investigation_id == investigation_id,
                    ConversationEntry.character_id == character_id
                )
                .order_by(ConversationEntry.timestamp)
                .limit(limit)
            )

            entries = result.scalars().all()
            return [
                {
                    "user_message": entry.user_message,
                    "character_response": entry.character_response,
                    "timestamp": entry.timestamp.isoformat() if entry.timestamp else None
                }
                for entry in entries
            ]
        except SQLAlchemyError as e:
            logger.error(f"Database error getting conversation history for investigation {investigation_id}, character {character_id}: {e}")
            return []

    async def check_investigation_exists(self, investigation_id: int) -> bool:
        """Check if an investigation exists

        Args:
            investigation_id: Investigation ID

        Returns:
            True if investigation exists, False otherwise
        """
        try:
            result = await self.session.execute(
                select(exists().where(Investigation.id == investigation_id))
            )
            return result.scalar()
        except SQLAlchemyError as e:
            logger.error(f"Database error checking if investigation {investigation_id} exists: {e}")
            return False
