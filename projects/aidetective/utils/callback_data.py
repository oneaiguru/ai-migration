import base64
import json
import logging
from typing import Dict, Any, Union, Optional, Tuple

logger = logging.getLogger(__name__)

# Constants for callback data types
ACTION = "a"
STORY = "s"
CHARACTER = "c"
EVIDENCE = "e"
SCENE = "sc"
STATUS = "st"
PRESENT = "p"
ACCUSE = "ac"
ANALYZE = "an"

class CallbackDataManager:
    """Manager for creating and parsing callback data"""

    @staticmethod
    def create_action_data(action: str) -> str:
        """Create callback data for story actions

        Args:
            action: Action text

        Returns:
            Callback data string
        """
        return f"action_{encode_if_needed(action)}"

    @staticmethod
    def create_story_data(story_id: int) -> str:
        """Create callback data for story selection

        Args:
            story_id: Story ID

        Returns:
            Callback data string
        """
        return f"story_{story_id}"

    @staticmethod
    def create_character_data(character_id: int) -> str:
        """Create callback data for character selection

        Args:
            character_id: Character ID

        Returns:
            Callback data string
        """
        return f"character_{character_id}"

    @staticmethod
    def create_evidence_data(evidence_id: int) -> str:
        """Create callback data for evidence selection

        Args:
            evidence_id: Evidence ID

        Returns:
            Callback data string
        """
        return f"evidence_{evidence_id}"

    @staticmethod
    def create_scene_data(scene_name: str) -> str:
        """Create callback data for scene selection

        Args:
            scene_name: Scene name

        Returns:
            Callback data string
        """
        return f"scene_{encode_if_needed(scene_name)}"

    @staticmethod
    def create_status_data(status: str, character_id: int) -> str:
        """Create callback data for character status change

        Args:
            status: Status (witness, suspect, criminal)
            character_id: Character ID

        Returns:
            Callback data string
        """
        return f"status_{status}_{character_id}"

    @staticmethod
    def create_present_evidence_data(evidence_id: int, character_id: int) -> str:
        """Create callback data for presenting evidence to character

        Args:
            evidence_id: Evidence ID
            character_id: Character ID

        Returns:
            Callback data string
        """
        return f"present_{evidence_id}_{character_id}"

    @staticmethod
    def create_analyze_evidence_data(evidence_id: int) -> str:
        """Create callback data for analyzing evidence

        Args:
            evidence_id: Evidence ID

        Returns:
            Callback data string
        """
        return f"analyze_evidence_{evidence_id}"

    @staticmethod
    def create_accuse_data(character_id: int) -> str:
        """Create callback data for accusing character

        Args:
            character_id: Character ID

        Returns:
            Callback data string
        """
        return f"accuse_{character_id}"

    @staticmethod
    def parse_action_data(callback_data: str) -> str:
        """Parse action callback data

        Args:
            callback_data: Callback data string

        Returns:
            Action text

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_action_data(callback_data)

    @staticmethod
    def parse_story_data(callback_data: str) -> int:
        """Parse story callback data

        Args:
            callback_data: Callback data string

        Returns:
            Story ID

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_story_data(callback_data)

    @staticmethod
    def parse_character_data(callback_data: str) -> int:
        """Parse character callback data

        Args:
            callback_data: Callback data string

        Returns:
            Character ID

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_character_data(callback_data)

    @staticmethod
    def parse_evidence_data(callback_data: str) -> int:
        """Parse evidence callback data

        Args:
            callback_data: Callback data string

        Returns:
            Evidence ID

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_evidence_data(callback_data)

    @staticmethod
    def parse_scene_data(callback_data: str) -> str:
        """Parse scene callback data

        Args:
            callback_data: Callback data string

        Returns:
            Scene name

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_scene_data(callback_data)

    @staticmethod
    def parse_status_data(callback_data: str) -> Dict[str, Union[str, int]]:
        """Parse status callback data

        Args:
            callback_data: Callback data string

        Returns:
            Dictionary with status and character_id

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_status_data(callback_data)

    @staticmethod
    def parse_present_evidence_data(callback_data: str) -> Dict[str, int]:
        """Parse present evidence callback data

        Args:
            callback_data: Callback data string

        Returns:
            Dictionary with evidence_id and character_id

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_present_evidence_data(callback_data)

    @staticmethod
    def parse_analyze_evidence_data(callback_data: str) -> int:
        """Parse analyze evidence callback data

        Args:
            callback_data: Callback data string

        Returns:
            Evidence ID

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_analyze_evidence_data(callback_data)

    @staticmethod
    def parse_accuse_data(callback_data: str) -> int:
        """Parse accuse callback data

        Args:
            callback_data: Callback data string

        Returns:
            Character ID

        Raises:
            ValueError: If callback data format is invalid
        """
        return parse_accuse_data(callback_data)

    @staticmethod
    def detect_callback_type(callback_data: str) -> Tuple[str, Any]:
        """Detect the type of callback data and parse it

        Args:
            callback_data: Callback data string

        Returns:
            Tuple of (callback_type, parsed_data)

        Raises:
            ValueError: If callback data format is invalid
        """
        return detect_callback_type(callback_data)

# Keep original functions for backward compatibility
def create_action_data(action: str) -> str:
    """Create callback data for story actions

    Args:
        action: Action text

    Returns:
        Callback data string
    """
    return f"action_{encode_if_needed(action)}"

def create_story_data(story_id: int) -> str:
    """Create callback data for story selection

    Args:
        story_id: Story ID

    Returns:
        Callback data string
    """
    return f"story_{story_id}"

def create_character_data(character_id: int) -> str:
    """Create callback data for character selection

    Args:
        character_id: Character ID

    Returns:
        Callback data string
    """
    return f"character_{character_id}"

def create_evidence_data(evidence_id: int) -> str:
    """Create callback data for evidence selection

    Args:
        evidence_id: Evidence ID

    Returns:
        Callback data string
    """
    return f"evidence_{evidence_id}"

def create_scene_data(scene_name: str) -> str:
    """Create callback data for scene selection

    Args:
        scene_name: Scene name

    Returns:
        Callback data string
    """
    return f"scene_{encode_if_needed(scene_name)}"

def create_status_data(status: str, character_id: int) -> str:
    """Create callback data for character status change

    Args:
        status: Status (witness, suspect, criminal)
        character_id: Character ID

    Returns:
        Callback data string
    """
    return f"status_{status}_{character_id}"

def create_present_evidence_data(evidence_id: int, character_id: int) -> str:
    """Create callback data for presenting evidence to character

    Args:
        evidence_id: Evidence ID
        character_id: Character ID

    Returns:
        Callback data string
    """
    return f"present_{evidence_id}_{character_id}"

def create_analyze_evidence_data(evidence_id: int) -> str:
    """Create callback data for analyzing evidence

    Args:
        evidence_id: Evidence ID

    Returns:
        Callback data string
    """
    return f"analyze_evidence_{evidence_id}"

def create_accuse_data(character_id: int) -> str:
    """Create callback data for accusing character

    Args:
        character_id: Character ID

    Returns:
        Callback data string
    """
    return f"accuse_{character_id}"

def parse_action_data(callback_data: str) -> str:
    """Parse action callback data

    Args:
        callback_data: Callback data string

    Returns:
        Action text

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("action_"):
        action = callback_data[7:]  # Remove "action_" prefix
        return decode_if_needed(action)

    raise ValueError(f"Invalid action callback data: {callback_data}")

def parse_story_data(callback_data: str) -> int:
    """Parse story callback data

    Args:
        callback_data: Callback data string

    Returns:
        Story ID

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("story_"):
        try:
            return int(callback_data[6:])  # Remove "story_" prefix
        except ValueError:
            raise ValueError(f"Invalid story ID in callback data: {callback_data}")

    raise ValueError(f"Invalid story callback data: {callback_data}")

def parse_character_data(callback_data: str) -> int:
    """Parse character callback data

    Args:
        callback_data: Callback data string

    Returns:
        Character ID

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("character_"):
        try:
            return int(callback_data[10:])  # Remove "character_" prefix
        except ValueError:
            raise ValueError(f"Invalid character ID in callback data: {callback_data}")

    raise ValueError(f"Invalid character callback data: {callback_data}")

def parse_evidence_data(callback_data: str) -> int:
    """Parse evidence callback data

    Args:
        callback_data: Callback data string

    Returns:
        Evidence ID

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("evidence_") and not callback_data.startswith("evidence_to_"):
        try:
            return int(callback_data[9:])  # Remove "evidence_" prefix
        except ValueError:
            raise ValueError(f"Invalid evidence ID in callback data: {callback_data}")

    raise ValueError(f"Invalid evidence callback data: {callback_data}")

def parse_scene_data(callback_data: str) -> str:
    """Parse scene callback data

    Args:
        callback_data: Callback data string

    Returns:
        Scene name

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("scene_"):
        scene_name = callback_data[6:]  # Remove "scene_" prefix
        return decode_if_needed(scene_name)

    raise ValueError(f"Invalid scene callback data: {callback_data}")

def parse_status_data(callback_data: str) -> Dict[str, Union[str, int]]:
    """Parse status callback data

    Args:
        callback_data: Callback data string

    Returns:
        Dictionary with status and character_id

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("status_"):
        # Extract parts
        parts = callback_data[7:].split("_", 1)  # Remove "status_" prefix

        if len(parts) == 2:
            try:
                return {
                    "status": parts[0],
                    "character_id": int(parts[1])
                }
            except ValueError:
                raise ValueError(f"Invalid character ID in status callback data: {callback_data}")

    raise ValueError(f"Invalid status callback data: {callback_data}")

def parse_present_evidence_data(callback_data: str) -> Dict[str, int]:
    """Parse present evidence callback data

    Args:
        callback_data: Callback data string

    Returns:
        Dictionary with evidence_id and character_id

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("present_"):
        # Extract parts
        parts = callback_data[8:].split("_", 1)  # Remove "present_" prefix

        if len(parts) == 2:
            try:
                return {
                    "evidence_id": int(parts[0]),
                    "character_id": int(parts[1])
                }
            except ValueError:
                raise ValueError(f"Invalid ID in present evidence callback data: {callback_data}")

    raise ValueError(f"Invalid present evidence callback data: {callback_data}")

def parse_analyze_evidence_data(callback_data: str) -> int:
    """Parse analyze evidence callback data

    Args:
        callback_data: Callback data string

    Returns:
        Evidence ID

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("analyze_evidence_"):
        try:
            return int(callback_data[17:])  # Remove "analyze_evidence_" prefix
        except ValueError:
            raise ValueError(f"Invalid evidence ID in analyze callback data: {callback_data}")

    raise ValueError(f"Invalid analyze evidence callback data: {callback_data}")

def parse_accuse_data(callback_data: str) -> int:
    """Parse accuse callback data

    Args:
        callback_data: Callback data string

    Returns:
        Character ID

    Raises:
        ValueError: If callback data format is invalid
    """
    if callback_data.startswith("accuse_"):
        try:
            return int(callback_data[7:])  # Remove "accuse_" prefix
        except ValueError:
            raise ValueError(f"Invalid character ID in accuse callback data: {callback_data}")

    raise ValueError(f"Invalid accuse callback data: {callback_data}")

def encode_if_needed(text: str) -> str:
    """Encode text if it contains special characters or is too long

    Args:
        text: Text to encode

    Returns:
        Encoded text if needed, original text otherwise
    """
    try:
        # Check if encoding is needed
        if "_" in text or len(text) > 40:
            # Encode as base64
            encoded = base64.urlsafe_b64encode(text.encode()).decode()
            return f"e:{encoded}"

        return text
    except Exception as e:
        logger.error(f"Error encoding text: {e}")
        # Return a safe version of the text
        return "error_encoding_text"

def decode_if_needed(text: str) -> str:
    """Decode text if it's encoded

    Args:
        text: Text to decode

    Returns:
        Decoded text if encoded, original text otherwise
    """
    try:
        if text.startswith("e:"):
            # Decode from base64
            encoded = text[2:]  # Remove "e:" prefix
            return base64.urlsafe_b64decode(encoded).decode()

        return text
    except Exception as e:
        logger.error(f"Error decoding text: {e}")
        # Return the original text if decoding fails
        return text

def detect_callback_type(callback_data: str) -> Tuple[str, Any]:
    """Detect the type of callback data and parse it

    Args:
        callback_data: Callback data string

    Returns:
        Tuple of (callback_type, parsed_data)

    Raises:
        ValueError: If callback data format is invalid
    """
    try:
        if callback_data.startswith("action_"):
            return "action", parse_action_data(callback_data)
        elif callback_data.startswith("story_"):
            return "story", parse_story_data(callback_data)
        elif callback_data.startswith("character_"):
            return "character", parse_character_data(callback_data)
        elif callback_data.startswith("evidence_") and not callback_data.startswith("evidence_to_"):
            return "evidence", parse_evidence_data(callback_data)
        elif callback_data.startswith("scene_"):
            return "scene", parse_scene_data(callback_data)
        elif callback_data.startswith("status_"):
            return "status", parse_status_data(callback_data)
        elif callback_data.startswith("present_"):
            return "present", parse_present_evidence_data(callback_data)
        elif callback_data.startswith("analyze_evidence_"):
            return "analyze", parse_analyze_evidence_data(callback_data)
        elif callback_data.startswith("accuse_"):
            return "accuse", parse_accuse_data(callback_data)
        elif callback_data == "back_to_investigation":
            return "back", None
        elif callback_data == "solve_case":
            return "solve", None
        elif callback_data == "inventory":
            return "inventory", None
        else:
            return "unknown", callback_data
    except Exception as e:
        logger.error(f"Error detecting callback type: {e}")
        return "error", str(e)