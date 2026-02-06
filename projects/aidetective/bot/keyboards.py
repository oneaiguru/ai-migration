from typing import List, Dict, Any, Optional
import hashlib
import logging
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from database.models import Story, Character, Evidence

ACTION_CALLBACK_PREFIX = "action_"
ACTION_CALLBACK_HASH_LENGTH = 16


def build_action_callback_data(action: str) -> str:
    """Return deterministic, compact callback data for a story action."""
    digest = hashlib.sha256(action.encode("utf-8")).hexdigest()[:ACTION_CALLBACK_HASH_LENGTH]
    return f"{ACTION_CALLBACK_PREFIX}{digest}"

def get_stories_keyboard(stories: List[Any]) -> InlineKeyboardMarkup:
    """Create keyboard with available stories

    Args:
        stories: List of Story objects or dictionaries

    Returns:
        InlineKeyboardMarkup with story selection buttons
    """
    keyboard = []

    for story in stories:
        # Handle both Story objects and dictionaries
        if isinstance(story, dict):
            story_id = story["id"]
            title = story["title"]
            difficulty = story.get("difficulty", "easy")
            is_premium = story.get("is_premium", False)
        else:
            story_id = story.id
            title = story.title
            difficulty = getattr(story, "difficulty", "easy")
            is_premium = getattr(story, "is_premium", False)

        difficulty_emoji = {
            "easy": "🟢",
            "medium": "🟡",
            "hard": "🔴"
        }.get(difficulty, "⚪")

        premium_emoji = "💎 " if is_premium else ""

        # Ensure callback data is valid and not too long
        callback_data = f"story_{story_id}"

        keyboard.append([
            InlineKeyboardButton(
                text=f"{difficulty_emoji} {premium_emoji}{title}",
                callback_data=callback_data
            )
        ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_investigation_keyboard(transitions: Dict[str, str]) -> InlineKeyboardMarkup:
    """Create keyboard with investigation actions

    Args:
        transitions: Dictionary of node transitions

    Returns:
        InlineKeyboardMarkup with action buttons
    """
    keyboard = []

    if transitions:
        for action, node_id in transitions.items():
            try:
                callback_data = build_action_callback_data(action)
                logging.debug(f"Generated callback: '{callback_data}' for action: '{action}'")

                keyboard.append([
                    InlineKeyboardButton(
                        text=action,  # Use full action text for display
                        callback_data=callback_data  # Use minimal, safe callback data
                    )
                ])
            except Exception as e:
                # In case of any error, log it and skip this button
                logging.error(f"Error creating button for action '{action}': {e}")
                continue

    # Add extras like inventory
    keyboard.append([
        InlineKeyboardButton(
            text="📋 Инвентарь",
            callback_data="inventory"
        )
    ])

    # Add case solution option if appropriate
    if any(action.startswith("Решить") for action in transitions.keys()):
        keyboard.append([
            InlineKeyboardButton(
                text="🔍 Решить дело",
                callback_data="solve_case"
            )
        ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_character_keyboard(characters: List[Dict[str, Any]]) -> InlineKeyboardMarkup:
    """Create keyboard with characters to interact with

    Args:
        characters: List of character dictionaries

    Returns:
        InlineKeyboardMarkup with character selection buttons
    """
    keyboard = []

    for character in characters:
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(character["status"], "👤")

        keyboard.append([
            InlineKeyboardButton(
                text=f"{status_emoji} {character['name']}",
                callback_data=f"character_{character['id']}"
            )
        ])

    keyboard.append([
        InlineKeyboardButton(
            text="🔙 Вернуться к расследованию",
            callback_data="back_to_investigation"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_evidence_keyboard(evidence_list: List[Dict[str, Any]]) -> InlineKeyboardMarkup:
    """Create keyboard with evidence items

    Args:
        evidence_list: List of evidence dictionaries

    Returns:
        InlineKeyboardMarkup with evidence selection buttons
    """
    keyboard = []

    for evidence in evidence_list:
        analyzed_emoji = "🔍" if evidence["analyzed"] else "📦"

        keyboard.append([
            InlineKeyboardButton(
                text=f"{analyzed_emoji} {evidence['name']}",
                callback_data=f"evidence_{evidence['id']}"
            )
        ])

    keyboard.append([
        InlineKeyboardButton(
            text="🔙 Вернуться к расследованию",
            callback_data="back_to_investigation"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_scenes_keyboard(scenes: List[str]) -> InlineKeyboardMarkup:
    """Create keyboard with scenes to explore

    Args:
        scenes: List of scene names

    Returns:
        InlineKeyboardMarkup with scene selection buttons
    """
    keyboard = []

    for scene in scenes:
        keyboard.append([
            InlineKeyboardButton(
                text=f"🔍 {scene}",
                callback_data=f"scene_{scene}"
            )
        ])

    keyboard.append([
        InlineKeyboardButton(
            text="🔙 Вернуться к расследованию",
            callback_data="back_to_investigation"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_character_interaction_keyboard(
    character_id: int,
    can_present_evidence: bool = True
) -> InlineKeyboardMarkup:
    """Create keyboard for interacting with a character

    Args:
        character_id: Character ID
        can_present_evidence: Whether evidence can be presented

    Returns:
        InlineKeyboardMarkup with interaction buttons
    """
    keyboard = []

    # Common questions
    keyboard.append([
        InlineKeyboardButton(
            text="Спросить об алиби",
            callback_data=f"ask_alibi_{character_id}"
        )
    ])

    keyboard.append([
        InlineKeyboardButton(
            text="Спросить о других персонажах",
            callback_data=f"ask_about_others_{character_id}"
        )
    ])

    # Evidence presentation
    if can_present_evidence:
        keyboard.append([
            InlineKeyboardButton(
                text="📄 Предъявить улику",
                callback_data=f"present_to_{character_id}"
            )
        ])

    # Change status option
    keyboard.append([
        InlineKeyboardButton(
            text="⚖️ Изменить статус персонажа",
            callback_data=f"change_status_{character_id}"
        )
    ])

    # Back button
    keyboard.append([
        InlineKeyboardButton(
            text="🔙 Вернуться к расследованию",
            callback_data="back_to_investigation"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_evidence_interaction_keyboard(evidence_id: int) -> InlineKeyboardMarkup:
    """Create keyboard for interacting with evidence

    Args:
        evidence_id: Evidence ID

    Returns:
        InlineKeyboardMarkup with interaction buttons
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text="🔬 Анализировать улику",
                callback_data=f"analyze_evidence_{evidence_id}"
            )
        ],
        [
            InlineKeyboardButton(
                text="📝 Добавить заметку",
                callback_data=f"note_evidence_{evidence_id}"
            )
        ],
        [
            InlineKeyboardButton(
                text="🔙 Вернуться к расследованию",
                callback_data="back_to_investigation"
            )
        ]
    ]

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_evidence_presentation_keyboard(
    evidence_list: List[Dict[str, Any]],
    character_id: int
) -> InlineKeyboardMarkup:
    """Create keyboard for presenting evidence to a character

    Args:
        evidence_list: List of evidence dictionaries
        character_id: Character ID

    Returns:
        InlineKeyboardMarkup with evidence selection buttons
    """
    keyboard = []

    for evidence in evidence_list:
        keyboard.append([
            InlineKeyboardButton(
                text=evidence["name"],
                callback_data=f"present_{evidence['id']}_{character_id}"
            )
        ])

    keyboard.append([
        InlineKeyboardButton(
            text="🔙 Отменить",
            callback_data=f"cancel_present_{character_id}"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_character_status_keyboard(character_id: int) -> InlineKeyboardMarkup:
    """Create keyboard for changing character status

    Args:
        character_id: Character ID

    Returns:
        InlineKeyboardMarkup with status selection buttons
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text="👁️ Свидетель",
                callback_data=f"status_witness_{character_id}"
            )
        ],
        [
            InlineKeyboardButton(
                text="❓ Подозреваемый",
                callback_data=f"status_suspect_{character_id}"
            )
        ],
        [
            InlineKeyboardButton(
                text="⛔ Преступник",
                callback_data=f"status_criminal_{character_id}"
            )
        ],
        [
            InlineKeyboardButton(
                text="🔙 Отменить",
                callback_data=f"cancel_status_{character_id}"
            )
        ]
    ]

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_accusation_keyboard(characters: List[Dict[str, Any]]) -> InlineKeyboardMarkup:
    """Create keyboard for accusing characters

    Args:
        characters: List of character dictionaries

    Returns:
        InlineKeyboardMarkup with character accusation buttons
    """
    keyboard = []

    for character in characters:
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(character["status"], "👤")

        keyboard.append([
            InlineKeyboardButton(
                text=f"Обвинить: {status_emoji} {character['name']}",
                callback_data=f"accuse_{character['id']}"
            )
        ])

    keyboard.append([
        InlineKeyboardButton(
            text="🔍 Продолжить расследование",
            callback_data="continue_investigation"
        )
    ])

    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_continue_keyboard() -> InlineKeyboardMarkup:
    """Create keyboard for continuing after case resolution

    Returns:
        InlineKeyboardMarkup with continue options
    """
    keyboard = [
        [
            InlineKeyboardButton(
                text="🔄 Начать новое расследование",
                callback_data="new_investigation"
            )
        ],
        [
            InlineKeyboardButton(
                text="📋 Просмотреть решенные дела",
                callback_data="view_solved_cases"
            )
        ],
        [
            InlineKeyboardButton(
                text="❌ Выйти",
                callback_data="exit"
            )
        ]
    ]

    return InlineKeyboardMarkup(inline_keyboard=keyboard)
