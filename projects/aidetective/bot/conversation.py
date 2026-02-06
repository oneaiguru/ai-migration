import logging
import os
import traceback
from typing import Dict, Optional

from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from database.session import get_db_session
from database.repositories.user_repository import UserRepository
from database.repositories.story_repository import StoryRepository
from database.repositories.investigation_repository import InvestigationRepository
from bot.states import UserStates
from bot.keyboards import (
    get_stories_keyboard, get_investigation_keyboard, get_character_keyboard,
    get_evidence_keyboard, get_character_interaction_keyboard,
    get_evidence_interaction_keyboard, get_accusation_keyboard,
    get_character_status_keyboard, get_evidence_presentation_keyboard,
    get_continue_keyboard, get_scenes_keyboard,
    ACTION_CALLBACK_PREFIX, build_action_callback_data
)
from utils.exceptions import handle_exception, StoryError
from story_engine.story_manager import StoryManager
from media.media_handler import MediaHandler

logger = logging.getLogger(__name__)


def _match_action_by_callback_data(callback_data: str, transitions: Dict[str, str]) -> Optional[str]:
    """Match deterministic callback data back to its transition action."""
    for transition_action in transitions.keys():
        if build_action_callback_data(transition_action) == callback_data:
            return transition_action
    return None


def _match_action_from_markup(callback_query: CallbackQuery, transitions: Dict[str, str]) -> Optional[str]:
    """Use the button text from the original markup to find the transition."""
    markup = getattr(callback_query.message, "reply_markup", None)
    if not markup or not getattr(markup, "inline_keyboard", None):
        return None

    for row in markup.inline_keyboard:
        for button in row:
            if getattr(button, "callback_data", None) != callback_query.data:
                continue

            button_text = (getattr(button, "text", "") or "").strip()
            for transition_action in transitions.keys():
                if transition_action == button_text:
                    return transition_action

            for transition_action in transitions.keys():
                if button_text.startswith(transition_action.split()[0]):
                    return transition_action

            return None

    return None

@handle_exception
async def start_conversation(message: Message, state: FSMContext):
    """Start conversation with the user

    Args:
        message: Telegram message
        state: FSM state
    """
    logger.info(f"Starting conversation with user {message.from_user.id}")

    # Check if user exists in database, create if not
    async with get_db_session() as session:
        user_repo = UserRepository(session)
        user = await user_repo.get_by_telegram_id(message.from_user.id)

        if not user:
            user = await user_repo.create(
                telegram_id=message.from_user.id,
                username=message.from_user.username,
                first_name=message.from_user.first_name,
                last_name=message.from_user.last_name
            )
            logger.info(f"Created new user: {user}")

            # Send welcome message
            await message.answer(
                "🔍 *Добро пожаловать в Шерлок AI!*\n\n"
                "Я — ваш помощник в мире детективных расследований. Здесь вы сможете "
                "раскрывать сложные преступления, допрашивать подозреваемых и искать улики.\n\n"
                "Давайте выберем ваше первое дело!",
                parse_mode="Markdown"
            )
        else:
            logger.info(f"Existing user: {user}")
            await user_repo.update_last_active(user.id)

            # Send welcome back message
            await message.answer(
                f"🔍 *С возвращением, Детектив {message.from_user.first_name or user.username or 'Аноним'}!*\n\n"
                "Готовы продолжить свои расследования или начать новое дело?",
                parse_mode="Markdown"
            )

        # Get available stories
        story_repo = StoryRepository(session)
        stories = await story_repo.get_free_stories()

        # Show available stories
        await message.answer(
            "📚 *Доступные расследования:*",
            reply_markup=get_stories_keyboard(stories),
            parse_mode="Markdown"
        )

        # Set state
        await state.set_state(UserStates.story_selection)

@handle_exception
async def help_command(message: Message, state: FSMContext):
    """Show help information

    Args:
        message: Telegram message
        state: FSM state
    """
    await message.answer(
        "🕵️‍♂️ *Помощь по боту Шерлок AI*\n\n"
        "Вот список доступных команд:\n"
        "/start - Начать новую игру\n"
        "/help - Показать это сообщение\n"
        "/cases - Показать доступные дела\n"
        "/continue - Продолжить текущее расследование\n"
        "/inventory - Показать собранные улики\n"
        "/profile - Просмотреть свой профиль\n"
        "/features - Информация о возможностях бота\n\n"
        "Во время расследования вы можете:\n"
        "- Осматривать места преступления\n"
        "- Допрашивать подозреваемых\n"
        "- Собирать и анализировать улики\n"
        "- Выдвигать обвинения\n\n"
        "Статусы персонажей:\n"
        "👁️ Свидетель - персонаж, не вызывающий подозрений\n"
        "❓ Подозреваемый - персонаж, который может быть причастен к преступлению\n"
        "⛔ Преступник - персонаж, которого вы считаете виновным\n\n"
        "Удачи в расследовании, детектив!",
        parse_mode="Markdown"
    )

@handle_exception
async def show_features_command(message: Message, state: FSMContext):
    """Show detailed information about the bot's features

    Args:
        message: Telegram message
        state: FSM state
    """
    await message.answer(
        "🔎 *Возможности Шерлок AI Детектив*\n\n"
        "📚 *Расследования:*\n"
        "- Интерактивные детективные истории\n"
        "- Различные локации для осмотра\n"
        "- Сбор и анализ улик\n"
        "- Допрос персонажей\n\n"

        "🕵️‍♂️ *Геймплей:*\n"
        "- Принятие решений, влияющих на ход расследования\n"
        "- Собственная классификация персонажей (свидетель, подозреваемый, преступник)\n"
        "- Возможность обвинения персонажей\n"
        "- Система инвентаря улик\n\n"

        "💎 *Премиум возможности:*\n"
        "- Дополнительные расследования\n"
        "- Расширенные возможности анализа улик\n"
        "- Статистика расследований\n"
        "- Персональные достижения\n\n"

        "Попробуйте прямо сейчас - начните новое расследование с помощью команды /start!",
        parse_mode="Markdown"
    )

@handle_exception
async def show_cases_command(message: Message, state: FSMContext):
    """Show available cases to investigate

    Args:
        message: Telegram message
        state: FSM state
    """
    async with get_db_session() as session:
        # Get available stories
        story_repo = StoryRepository(session)
        stories = await story_repo.get_free_stories()

        if not stories:
            await message.answer(
                "На данный момент нет доступных расследований. Пожалуйста, попробуйте позже."
            )
            return

        # Show available stories
        await message.answer(
            "📚 *Доступные расследования:*\n\n"
            "Выберите дело, которое хотите расследовать:",
            reply_markup=get_stories_keyboard(stories),
            parse_mode="Markdown"
        )

        # Set state
        await state.set_state(UserStates.story_selection)

@handle_exception
async def continue_investigation(message: Message, state: FSMContext):
    """Continue the current investigation

    Args:
        message: Telegram message
        state: FSM state
    """
    async with get_db_session() as session:
        user_repo = UserRepository(session)
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        # Get user
        user = await user_repo.get_by_telegram_id(message.from_user.id)
        if not user:
            await message.answer("Ошибка: пользователь не найден")
            return

        # Get active investigation
        investigation = await investigation_repo.get_active_investigation(user.id)
        if not investigation:
            await message.answer(
                "У вас нет текущих активных расследований. Используйте /cases, чтобы начать новое."
            )
            return

        # Get current node
        current_node = await story_repo.get_story_node(investigation.story_id, investigation.current_node)
        if not current_node:
            await message.answer("Ошибка: невозможно загрузить текущее расследование")
            return

        # Set state
        await state.update_data(investigation_id=investigation.id, story_id=investigation.story_id)
        await state.set_state(UserStates.investigation)

        # Get story
        story = await story_repo.get_by_id(investigation.story_id)

        # Send continuation message
        await message.answer(
            f"🔍 *Продолжаем расследование: {story.title}*\n\n"
            f"Место действия: {current_node.content.split('.')[0] if '.' in current_node.content else 'Неизвестно'}",
            parse_mode="Markdown"
        )

        # Send current node
        await message.answer(
            current_node.content,
            reply_markup=get_investigation_keyboard(current_node.transitions),
            parse_mode="Markdown"
        )

@handle_exception
async def handle_continue_investigation_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle inline continue investigation callbacks"""
    await callback_query.answer()
    await continue_investigation(callback_query.message, state)

@handle_exception
async def handle_new_investigation_callback(callback_query: CallbackQuery, state: FSMContext):
    """Start a new investigation from inline action"""
    await callback_query.answer()
    await start_conversation(callback_query.message, state)

@handle_exception
async def handle_view_solved_cases_callback(callback_query: CallbackQuery, state: FSMContext):
    """Show available/solved cases from inline action"""
    await callback_query.answer()
    await show_cases_command(callback_query.message, state)

@handle_exception
async def handle_exit_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle exit from inline continue menu"""
    await callback_query.answer()
    await callback_query.message.answer(
        "Вы вышли из меню. Используйте /start, /cases или /help, чтобы продолжить."
    )

@handle_exception
async def show_inventory(message: Message, state: FSMContext):
    """Show user's inventory of collected evidence

    Args:
        message: Telegram message
        state: FSM state
    """
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        # Try to find active investigation
        async with get_db_session() as session:
            user_repo = UserRepository(session)
            investigation_repo = InvestigationRepository(session)

            user = await user_repo.get_by_telegram_id(message.from_user.id)
            if not user:
                await message.answer("Ошибка: пользователь не найден")
                return

            investigation = await investigation_repo.get_active_investigation(user.id)
            if not investigation:
                await message.answer(
                    "У вас нет активных расследований. Используйте /cases, чтобы начать новое."
                )
                return

            investigation_id = investigation.id
            await state.update_data(investigation_id=investigation_id, story_id=investigation.story_id)

    # Get discovered evidence
    async with get_db_session() as session:
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        evidence_list = await investigation_repo.get_discovered_evidence(investigation_id)

        if not evidence_list:
            await message.answer(
                "📋 *Инвентарь улик*\n\n"
                "Вы еще не обнаружили ни одной улики. Исследуйте места преступления тщательнее!",
                parse_mode="Markdown"
            )
            return

        # Format evidence list
        evidence_text = "📋 *Инвентарь улик:*\n\n"

        for i, evidence in enumerate(evidence_list, 1):
            status = "✅ Проанализировано" if evidence["analyzed"] else "❌ Не проанализировано"
            evidence_text += f"{i}. {evidence['name']} ({status})\n"
            if evidence["analyzed"] and evidence.get("notes"):
                evidence_text += f"   _Анализ: {evidence['notes'][:100]}..._\n"

        # Send evidence list
        await message.answer(
            evidence_text,
            parse_mode="Markdown",
            reply_markup=get_evidence_keyboard(evidence_list)
        )

@handle_exception
async def handle_inventory_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle inline inventory callbacks from keyboards"""
    await callback_query.answer()
    await show_inventory(callback_query.message, state)

@handle_exception
async def show_user_profile(message: Message, state: FSMContext):
    """Show user profile and statistics

    Args:
        message: Telegram message
        state: FSM state
    """
    async with get_db_session() as session:
        user_repo = UserRepository(session)
        investigation_repo = InvestigationRepository(session)

        # Get user
        user = await user_repo.get_by_telegram_id(message.from_user.id)
        if not user:
            await message.answer("Ошибка: пользователь не найден")
            return

        # Get user statistics
        completed_count = await investigation_repo.get_completed_investigation_count(user.id)
        evidence_count = await investigation_repo.get_total_evidence_discovered(user.id)

        # Get active investigation
        active_investigation = await investigation_repo.get_active_investigation(user.id)

        # Format profile message
        profile_text = (
            f"👤 *Профиль детектива*\n\n"
            f"*Имя:* {user.first_name or user.username or 'Аноним'}\n"
            f"*ID:* {user.telegram_id}\n"
            f"*Статус:* {'Премиум' if getattr(user, 'is_premium', False) else 'Стандартный'}\n\n"
            f"*Статистика:*\n"
            f"- Раскрыто дел: {completed_count}\n"
            f"- Найдено улик: {evidence_count}\n"
            f"- Активное расследование: {active_investigation is not None}\n\n"
        )

        # Add rank based on completed cases
        if completed_count == 0:
            profile_text += "*Ранг:* 🔰 Начинающий детектив"
        elif completed_count < 3:
            profile_text += "*Ранг:* 🥉 Помощник детектива"
        elif completed_count < 5:
            profile_text += "*Ранг:* 🥈 Детектив"
        elif completed_count < 10:
            profile_text += "*Ранг:* 🥇 Старший детектив"
        else:
            profile_text += "*Ранг:* 💎 Мастер-детектив"

        # Send profile
        await message.answer(
            profile_text,
            parse_mode="Markdown"
        )

@handle_exception
async def select_story(callback_query: CallbackQuery, state: FSMContext):
    """Handle story selection

    Args:
        callback_query: Callback query
        state: FSM state
    """
    # Extract story ID from callback data
    try:
        callback_data = callback_query.data
        if not callback_data.startswith("story_"):
            await callback_query.answer("Invalid selection")
            return

        story_id_str = callback_data.split("_")[1]
        story_id = int(story_id_str)

        logger.info(f"User {callback_query.from_user.id} selected story {story_id}")

        # Answer callback to remove loading state
        await callback_query.answer()

        # Start investigation
        async with get_db_session() as session:
            user_repo = UserRepository(session)
            user = await user_repo.get_by_telegram_id(callback_query.from_user.id)

            if not user:
                user = await user_repo.create(
                    telegram_id=callback_query.from_user.id,
                    username=getattr(callback_query.from_user, "username", None),
                    first_name=getattr(callback_query.from_user, "first_name", None),
                    last_name=getattr(callback_query.from_user, "last_name", None)
                )
                logger.info(f"Created missing user during story selection: {user}")

            story_repo = StoryRepository(session)
            investigation_repo = InvestigationRepository(session)

            # Create a story manager
            story_manager = StoryManager(story_repo, investigation_repo)

            # Start story investigation
            try:
                result = await story_manager.start_story(user.id, story_id)

                # Store investigation ID in state
                await state.update_data(investigation_id=result["investigation_id"], story_id=story_id)
                await state.set_state(UserStates.investigation)

                # Send story introduction
                await callback_query.message.answer(
                    f"📖 *{result['story_title']}*\n\n{result.get('description', 'Начинаем расследование...')}",
                    parse_mode="Markdown"
                )

                # Send first node content with transitions
                await callback_query.message.answer(
                    result["content"],
                    reply_markup=get_investigation_keyboard(result["transitions"]),
                    parse_mode="Markdown"
                )
            except StoryError as e:
                logger.error(f"Error starting story: {e}")
                await callback_query.message.answer(
                    f"Произошла ошибка при выборе расследования: {str(e)}"
                )
    except Exception as e:
        logger.error(f"Error selecting story: {e}")
        await callback_query.message.answer(
            "Произошла ошибка при выборе расследования. Пожалуйста, попробуйте еще раз."
        )

@handle_exception
async def handle_action_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle story action callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract the action from callback data
    callback_data = callback_query.data
    if not callback_data.startswith(ACTION_CALLBACK_PREFIX) and not callback_data.startswith("a"):
        await callback_query.message.answer("Неверное действие")
        return

    # Get the action text or index from the callback data
    if callback_data.startswith(ACTION_CALLBACK_PREFIX):
        action_from_callback = callback_data[len(ACTION_CALLBACK_PREFIX):]
    elif callback_data.startswith("a"):
        action_from_callback = callback_data[1:]  # Remove "a" prefix
    else:
        action_from_callback = callback_data  # Fallback

    # Log for debugging
    logger.debug(f"Processing action callback: {callback_data}")

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer(
            "Ошибка: невозможно найти текущее расследование. Пожалуйста, используйте /cases, чтобы начать новое."
        )
        return

    async with get_db_session() as session:
        # Get investigation and story data
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        investigation = await investigation_repo.get_by_id(investigation_id)
        if not investigation:
            await callback_query.message.answer(
                "Ошибка: невозможно найти текущее расследование. Пожалуйста, используйте /cases, чтобы начать новое."
            )
            return

        current_node = await story_repo.get_story_node(investigation.story_id, investigation.current_node)
        if not current_node or not current_node.transitions:
            await callback_query.message.answer(
                "Ошибка: невозможно найти текущий узел истории. Пожалуйста, используйте /cases, чтобы начать новое расследование."
            )
            return

        # Log transitions for debugging
        transition_actions = list(current_node.transitions.keys())
        logger.debug(f"Available transitions: {transition_actions}")

        # Find the actual action from the transitions
        action = None

        # First try deterministic callback matching (hash-based, order-independent)
        if callback_data.startswith(ACTION_CALLBACK_PREFIX):
            action = _match_action_by_callback_data(callback_data, current_node.transitions)
            if action:
                logger.debug(f"Found action by callback token: {action}")

        # Then fall back to the button text (covers legacy index callbacks safely)
        if not action:
            action = _match_action_from_markup(callback_query, current_node.transitions)
            if action:
                logger.debug(f"Found action by button text: {action}")

        # Legacy numeric and text matching fallbacks
        if not action:
            if action_from_callback.startswith("opt") and action_from_callback[3:].isdigit():
                index = int(action_from_callback[3:])
                if 0 < index <= len(transition_actions):
                    action = transition_actions[index-1]
                    logger.debug(f"Found action by index {index}: {action}")
            elif action_from_callback.isdigit():
                index = int(action_from_callback)
                if 0 < index <= len(transition_actions):
                    action = transition_actions[index-1]
                    logger.debug(f"Found action by simple index {index}: {action}")
            else:
                for transition_action in transition_actions:
                    if (transition_action.startswith(action_from_callback) or
                        action_from_callback in transition_action or
                        action_from_callback.startswith(transition_action.split()[0])):
                        action = transition_action
                        logger.debug(f"Found action by text match: {action}")
                        break

        # Ultimate fallback: just use the first action if we couldn't find a match
        if not action and transition_actions:
            action = transition_actions[0]
            logger.warning(f"Using fallback action: {action} for callback: {action_from_callback}")

        if not action or action not in current_node.transitions:
            await callback_query.message.answer(
                "Это действие недоступно в текущей ситуации."
            )
            return

        # Get next node
        next_node_id = current_node.transitions[action]
        next_node = await story_repo.get_story_node(investigation.story_id, next_node_id)

        if not next_node:
            await callback_query.message.answer(
                "Ошибка: невозможно найти следующий узел истории. Пожалуйста, используйте /cases, чтобы начать новое расследование."
            )
            return

        # Update investigation state
        await investigation_repo.update_node(investigation_id, next_node_id)

        # Check if this node automatically discovers evidence
        # For certain examination nodes, we auto-discover evidence
        if next_node_id.startswith("examine_"):
            # Get evidence that might be discovered in this node
            evidence_id = None
            if next_node_id == "examine_ink":
                # Example mapping for specific nodes to evidence IDs
                evidence_id = 1  # ID for ink traces
            elif next_node_id == "examine_book":
                evidence_id = 2  # ID for bookmark
            elif next_node_id == "examine_door":
                evidence_id = 3  # ID for door scratches

            if evidence_id:
                # Check if evidence exists and isn't already discovered
                evidence_state = await investigation_repo.get_evidence_state(investigation_id, evidence_id)
                if evidence_state and not evidence_state.discovered:
                    # Discover the evidence
                    await investigation_repo.discover_evidence(investigation_id, evidence_id)
                    evidence = await story_repo.get_evidence_by_id(evidence_id)

                    # Notify user about discovered evidence
                    if evidence:
                        await callback_query.message.answer(
                            f"🔍 *Обнаружена улика!*\n\n"
                            f"Вы нашли: *{evidence.name}*\n\n"
                            f"Эта улика добавлена в ваш инвентарь. Используйте команду /inventory, чтобы просмотреть все найденные улики.",
                            parse_mode="Markdown"
                        )

        # Send new node content
        await callback_query.message.answer(
            next_node.content,
            reply_markup=get_investigation_keyboard(next_node.transitions),
            parse_mode="Markdown"
        )

@handle_exception
async def handle_character_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle character selection callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract character ID
    character_id = int(callback_query.data.split("_")[1])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get character information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        if not character_state:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        character = await story_repo.get_character_by_id(character_id)
        if not character:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        # Set state for character interaction
        await state.update_data(current_character_id=character_id)
        await state.set_state(UserStates.character_interaction)

        # Send character information
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(character_state.status, "👤")

        status_text = {
            "witness": "Свидетель",
            "suspect": "Подозреваемый",
            "criminal": "Преступник"
        }.get(character_state.status, "Неизвестно")

        await callback_query.message.answer(
            f"{status_emoji} *{character.name}* ({status_text})\n\n"
            f"{character.description}",
            parse_mode="Markdown"
        )

        # Get conversation history
        conversation_history = await investigation_repo.get_conversation_history(investigation_id, character_id)

        # If there's conversation history, show the last exchange
        if conversation_history:
            last_entry = conversation_history[-1]
            await callback_query.message.answer(
                f"🗣️ *Последний разговор:*\n\n"
                f"Вы: {last_entry['user_message']}\n\n"
                f"{character.name}: {last_entry['character_response']}",
                parse_mode="Markdown"
            )

        # Send interaction options
        await callback_query.message.answer(
            "Что вы хотите спросить у этого персонажа?",
            reply_markup=get_character_interaction_keyboard(character_id)
        )

@handle_exception
async def handle_change_status_prompt_callback(callback_query: CallbackQuery, state: FSMContext):
    """Show status selection keyboard for a character"""
    await callback_query.answer()

    parts = callback_query.data.split("_")
    character_id = int(parts[-1]) if parts and parts[-1].isdigit() else None
    if not character_id:
        await callback_query.message.answer("Ошибка: персонаж не найден")
        return

    # Keep user in character interaction if they cancel later
    await state.set_state(UserStates.character_interaction)

    await callback_query.message.answer(
        "Выберите новый статус персонажа:",
        reply_markup=get_character_status_keyboard(character_id)
    )

@handle_exception
async def handle_ask_alibi_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle quick 'ask alibi' character question"""
    await _handle_quick_character_question(
        callback_query,
        state,
        question="Где вы были во время происшествия?"
    )

@handle_exception
async def handle_ask_about_others_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle quick 'ask about others' character question"""
    await _handle_quick_character_question(
        callback_query,
        state,
        question="Что вы можете рассказать о других персонажах?"
    )

async def _handle_quick_character_question(callback_query: CallbackQuery, state: FSMContext, question: str) -> None:
    """Shared helper to process quick character questions from inline buttons"""
    await callback_query.answer()

    parts = callback_query.data.split("_")
    character_id = int(parts[-1]) if parts and parts[-1].isdigit() else None
    if not character_id:
        await callback_query.message.answer("Ошибка: персонаж не найден")
        return

    data = await state.get_data()
    investigation_id = data.get("investigation_id")
    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    await state.update_data(current_character_id=character_id)

    async with get_db_session() as session:
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        character = await story_repo.get_character_by_id(character_id)
        if not character_state or not character:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        response = await generate_character_response(character, character_state, question)

        await investigation_repo.add_conversation_entry(
            investigation_id=investigation_id,
            character_id=character_id,
            user_message=question,
            character_response=response
        )

        await callback_query.message.answer(
            f"🗣️ Вы: {question}\n\n{character.name}: {response}"
        )

        await callback_query.message.answer(
            "Что дальше?",
            reply_markup=get_character_interaction_keyboard(character_id)
        )

@handle_exception
async def handle_character_question(message: Message, state: FSMContext):
    """Handle direct question to character

    Args:
        message: Telegram message
        state: FSM state
    """
    # Get current character and investigation
    data = await state.get_data()
    character_id = data.get("current_character_id")
    investigation_id = data.get("investigation_id")

    if not character_id or not investigation_id:
        await message.answer("Ошибка: текущий персонаж не найден. Вернитесь к расследованию.")
        await state.set_state(UserStates.investigation)
        return

    user_question = message.text

    async with get_db_session() as session:
        # Get character information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        if not character_state:
            await message.answer("Ошибка: персонаж не найден")
            await state.set_state(UserStates.investigation)
            return

        character = await story_repo.get_character_by_id(character_id)
        if not character:
            await message.answer("Ошибка: персонаж не найден")
            await state.set_state(UserStates.investigation)
            return

        # Generate response based on character and question
        # For MVP, use predefined responses based on keywords in the question
        response = await generate_character_response(character, character_state, user_question)

        # Save conversation entry
        await investigation_repo.add_conversation_entry(
            investigation_id=investigation_id,
            character_id=character_id,
            user_message=user_question,
            character_response=response
        )

        # Send character response
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(character_state.status, "👤")

        await message.answer(
            f"{status_emoji} *{character.name}*: {response}",
            parse_mode="Markdown"
        )

        # Send interaction options again
        await message.answer(
            "Что еще вы хотите спросить?",
            reply_markup=get_character_interaction_keyboard(character_id)
        )

async def generate_character_response(character, character_state, question):
    """Generate a character response based on the question

    This is a simple implementation for MVP. In future versions,
    this could be replaced with an AI-generated response.

    Args:
        character: Character model
        character_state: CharacterState model
        question: User's question

    Returns:
        Generated response
    """
    # Convert question to lowercase for easier matching
    question_lower = question.lower()

    # Check for common questions and provide canned responses
    if "алиби" in question_lower or "где вы был" in question_lower or "где ты был" in question_lower:
        return "Я был здесь в библиотеке, работал до позднего вечера. Могу показать записи моей карты доступа."

    if "име" in question_lower and "библиотекар" in question_lower:
        return "Его звали Александр Петрович. Он работал здесь главным библиотекарем уже 15 лет."

    if "чернил" in question_lower or "пятн" in question_lower:
        if character.name == "Директор библиотеки":
            return "Чернила? Я действительно пользуюсь чернильной ручкой, но я не понимаю, какое это имеет отношение к делу. Многие сотрудники используют ручки."
        else:
            return "Я не знаю ничего о чернильных пятнах. Может быть, стоит спросить директора, он постоянно пользуется этой своей дорогой чернильной ручкой."

    if "книг" in question_lower or "рукопис" in question_lower:
        return "Библиотекарь очень трепетно относился к старинным книгам. Он никому не разрешал трогать самые ценные экземпляры."

    if "убий" in question_lower or "смерт" in question_lower or "уби" in question_lower:
        if character_state.status == "suspect" or character_state.status == "criminal":
            return "Я не имею никакого отношения к этому. Почему вы спрашиваете меня? Вам стоит искать настоящего преступника!"
        else:
            return "Это ужасная трагедия. Я до сих пор не могу поверить, что это произошло в нашей библиотеке."

    if "улик" in question_lower or "доказатель" in question_lower:
        return "Я не видел никаких улик. Полиция уже опрашивала всех, но, кажется, они тоже не нашли ничего конкретного."

    if "подозрева" in question_lower:
        return "Я не хотел бы кого-то обвинять без доказательств, но в последнее время у библиотекаря были какие-то разногласия с директором."

    # Default responses
    if character_state.status == "witness":
        return "Простите, я не уверен, что понимаю вопрос. Я рассказал всё, что знаю о происшествии."
    elif character_state.status == "suspect":
        return "Я не понимаю, к чему вы клоните. Я уже сказал всё, что знаю. Почему вы продолжаете меня допрашивать?"
    else:  # criminal
        return "Я не буду больше ничего говорить. Если у вас есть конкретные обвинения, предъявляйте их официально."

@handle_exception
async def handle_evidence_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle evidence selection callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract evidence ID
    evidence_id = int(callback_query.data.split("_")[1])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get evidence information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        evidence_state = await investigation_repo.get_evidence_state(investigation_id, evidence_id)
        if not evidence_state:
            await callback_query.message.answer("Ошибка: улика не найдена")
            return

        evidence = await story_repo.get_evidence_by_id(evidence_id)
        if not evidence:
            await callback_query.message.answer("Ошибка: улика не найдена")
            return

        # If evidence is not discovered yet, discover it
        if not evidence_state.discovered:
            await investigation_repo.discover_evidence(investigation_id, evidence_id)

            # Send discovery message
            await callback_query.message.answer(
                f"🔍 Вы обнаружили новую улику: *{evidence.name}*",
                parse_mode="Markdown"
            )

        # Set state for evidence interaction
        await state.update_data(current_evidence_id=evidence_id)
        await state.set_state(UserStates.evidence_analysis)

        # Send evidence information
        status_text = "✅ Проанализировано" if evidence_state.analyzed else "❌ Не проанализировано"

        await callback_query.message.answer(
            f"📄 *{evidence.name}* ({status_text})\n\n"
            f"{evidence.description}",
            parse_mode="Markdown"
        )

        # Send image if available
        if evidence.image_path and os.path.exists(evidence.image_path):
            with open(evidence.image_path, 'rb') as photo:
                await callback_query.message.answer_photo(
                    photo=photo,
                    caption=f"📷 {evidence.name}"
                )

        # Send interaction options
        await callback_query.message.answer(
            "Что вы хотите сделать с этой уликой?",
            reply_markup=get_evidence_interaction_keyboard(evidence_id)
        )

@handle_exception
async def handle_analyze_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle evidence analysis callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract evidence ID
    evidence_id = int(callback_query.data.split("_")[2])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get evidence information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        evidence_state = await investigation_repo.get_evidence_state(investigation_id, evidence_id)
        if not evidence_state:
            await callback_query.message.answer("Ошибка: улика не найдена")
            return

        evidence = await story_repo.get_evidence_by_id(evidence_id)
        if not evidence:
            await callback_query.message.answer("Ошибка: улика не найдена")
            return

        # Mark evidence as analyzed
        await investigation_repo.analyze_evidence(investigation_id, evidence_id)

        # Generate analysis text based on evidence
        analysis = await generate_evidence_analysis(evidence)

        # Save analysis to evidence notes
        await investigation_repo.save_evidence_analysis(investigation_id, evidence_id, analysis)

        # Send analysis result
        await callback_query.message.answer(
            f"🔬 *Анализ улики: {evidence.name}*\n\n"
            f"{analysis}\n\n"
            f"Эта улика отмечена как проанализированная.",
            parse_mode="Markdown"
        )

        # Update any character statuses based on this evidence
        await update_character_statuses_for_evidence(session, investigation_id, evidence_id)

        # Return to evidence view
        await callback_query.message.answer(
            "Что еще вы хотите сделать с этой уликой?",
            reply_markup=get_evidence_interaction_keyboard(evidence_id)
        )

async def generate_evidence_analysis(evidence):
    """Generate analysis text for evidence

    This is a simple implementation for MVP. In future versions,
    this could be replaced with an AI-generated analysis.

    Args:
        evidence: Evidence model

    Returns:
        Analysis text
    """
    # Predefined analyses for specific evidence
    if evidence.name == "Следы чернил на полу":
        return ("Анализ показывает, что это чернила высокого качества, используемые в дорогих перьевых ручках. "
                "Такими ручками обычно пользуются коллекционеры или высокопоставленные лица. Чернила темно-синие "
                "с фиолетовым оттенком, совпадают по цвету с чернилами в ручке директора библиотеки.")

    elif evidence.name == "Закладка с именем студента":
        return ("На закладке написано имя 'Михаил Соколов' - это студент-историк, который часто работает "
                "в библиотеке. Закладка самодельная, с характерным рисунком на уголке. Похоже, что она "
                "была специально оставлена в книге о ядах.")

    elif evidence.name == "Царапины на двери":
        return ("Царапины на внутренней стороне двери показывают, что кто-то отчаянно пытался открыть дверь "
                "изнутри. Глубина царапин указывает на силу отчаяния. Также заметны следы металлического "
                "предмета, вероятно, ключа, которым пытались манипулировать замком изнутри.")

    # Default analysis
    return ("Тщательный анализ этой улики не выявил дополнительной информации. "
            "Возможно, стоит сопоставить её с другими обнаруженными уликами или "
            "обсудить её с подозреваемыми.")

async def update_character_statuses_for_evidence(session, investigation_id, evidence_id):
    """Update character statuses based on analyzed evidence

    Args:
        session: Database session
        investigation_id: Investigation ID
        evidence_id: Evidence ID
    """
    investigation_repo = InvestigationRepository(session)
    story_repo = StoryRepository(session)

    # Get evidence
    evidence = await story_repo.get_evidence_by_id(evidence_id)
    if not evidence:
        return

    # For MVP, implement some simple rules:
    if evidence.name == "Следы чернил на полу":
        # Change director status to suspect if analyzing ink traces
        character_states = await investigation_repo.get_character_states(investigation_id)
        for cs in character_states:
            character = await story_repo.get_character_by_id(cs.character_id)
            if character and character.name == "Директор библиотеки" and cs.status == "witness":
                await investigation_repo.update_character_status(
                    investigation_id,
                    cs.character_id,
                    "suspect"
                )
                return

@handle_exception
async def handle_present_evidence_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle evidence presentation callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract character ID
    character_id = int(callback_query.data.split("_")[2])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get character information
        investigation_repo = InvestigationRepository(session)

        # Get discovered evidence
        evidence_list = await investigation_repo.get_discovered_evidence(investigation_id)

        if not evidence_list:
            await callback_query.message.answer(
                "У вас пока нет улик, которые можно представить. Исследуйте места преступления, чтобы найти улики."
            )
            return

        # Show evidence selection
        await callback_query.message.answer(
            "Выберите улику, которую вы хотите предъявить персонажу:",
            reply_markup=get_evidence_presentation_keyboard(evidence_list, character_id)
        )

@handle_exception
async def handle_cancel_present_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle cancel action when presenting evidence"""
    await callback_query.answer()

    parts = callback_query.data.split("_")
    character_id = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else None

    if not character_id:
        await callback_query.message.answer("Предъявление улики отменено.")
        return

    await callback_query.message.answer(
        "Предъявление улики отменено. Что дальше?",
        reply_markup=get_character_interaction_keyboard(character_id)
    )

@handle_exception
async def handle_present_specific_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle specific evidence presentation callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract evidence and character IDs
    parts = callback_query.data.split("_")
    evidence_id = int(parts[1])
    character_id = int(parts[2])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get evidence and character information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        evidence_state = await investigation_repo.get_evidence_state(investigation_id, evidence_id)
        if not evidence_state or not evidence_state.discovered:
            await callback_query.message.answer("Ошибка: улика не найдена")
            return

        evidence = await story_repo.get_evidence_by_id(evidence_id)
        if not evidence:
            await callback_query.message.answer("Ошибка: улика не найдена")
            return

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        if not character_state:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        character = await story_repo.get_character_by_id(character_id)
        if not character:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        # Generate character reaction
        reaction = await generate_evidence_reaction(character, character_state, evidence)

        # Save conversation entry
        await investigation_repo.add_conversation_entry(
            investigation_id=investigation_id,
            character_id=character_id,
            user_message=f"Предъявляет улику: {evidence.name}",
            character_response=reaction
        )

        # Update character status based on reaction
        if evidence.name == "Следы чернил на полу" and character.name == "Директор библиотеки":
            await investigation_repo.update_character_status(investigation_id, character_id, "suspect")

        # Send message
        await callback_query.message.answer(
            f"🔍 Вы предъявляете *{evidence.name}* персонажу *{character.name}*",
            parse_mode="Markdown"
        )

        # Send character reaction
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(character_state.status, "👤")

        await callback_query.message.answer(
            f"{status_emoji} *{character.name}*: {reaction}",
            parse_mode="Markdown"
        )

        # Return to character interaction
        await callback_query.message.answer(
            "Что еще вы хотите спросить?",
            reply_markup=get_character_interaction_keyboard(character_id)
        )

async def generate_evidence_reaction(character, character_state, evidence):
    """Generate character reaction to presented evidence

    This is a simple implementation for MVP. In future versions,
    this could be replaced with an AI-generated reaction.

    Args:
        character: Character model
        character_state: CharacterState model
        evidence: Evidence model

    Returns:
        Reaction text
    """
    # Specific reactions based on character and evidence
    if character.name == "Директор библиотеки" and evidence.name == "Следы чернил на полу":
        return ("*нервно* Да, это похоже на чернила из моей ручки... но я не понимаю, как они могли "
                "оказаться в кабинете библиотекаря. Я дал ему ручку на время несколько дней назад, "
                "возможно, он пользовался ею. Впрочем, многие используют похожие чернила.")

    elif character.name == "Студент-историк" and evidence.name == "Закладка с именем студента":
        return ("Да, это моя закладка. Я оставил её в книге, которую мы изучали с библиотекарем. "
                "Это не доказывает ничего, кроме того, что я работал с ним над исследованием. Мы "
                "часто обменивались книгами и заметками.")

    elif character.name == "Ночной сторож" and evidence.name == "Царапины на двери":
        return ("Странно. Я не заметил этих царапин во время обхода. Это значит, что кто-то "
                "был заперт в кабинете и пытался выбраться? Или... может, кто-то запер "
                "библиотекаря внутри? Это ужасно.")

    # Default reactions based on character status
    if character_state.status == "witness":
        return "Интересно. Я не уверен, что это говорит о происшествии, но спасибо, что показали."

    elif character_state.status == "suspect":
        return "Я не понимаю, как это связано со мной. Вы на что-то намекаете?"

    else:  # criminal
        return "Эта улика ничего не доказывает. У вас нет против меня никаких серьезных доказательств."

@handle_exception
async def handle_scene_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle scene selection callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract scene name
    scene_name = callback_query.data.split("_", 1)[1]

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get story information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        investigation = await investigation_repo.get_by_id(investigation_id)
        if not investigation:
            await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
            return

        # Set state for scene exploration
        await state.update_data(current_scene=scene_name)
        await state.set_state(UserStates.scene_exploration)

        # Generate scene description
        description = generate_scene_description(scene_name)

        # Get evidence in this scene
        evidence_in_scene = await story_repo.get_scene_evidence(investigation.story_id, scene_name)

        # Send scene description
        await callback_query.message.answer(
            f"🔍 *Исследуем: {scene_name}*\n\n{description}",
            parse_mode="Markdown"
        )

        # If there's evidence in the scene, provide options to examine
        if evidence_in_scene:
            # Build evidence keyboard
            evidence_keyboard = []
            for evidence in evidence_in_scene:
                evidence_keyboard.append([{
                    "text": f"Осмотреть {evidence.name}",
                    "callback_data": f"evidence_{evidence.id}"
                }])

            # Add back button
            evidence_keyboard.append([{
                "text": "🔙 Вернуться к расследованию",
                "callback_data": "back_to_investigation"
            }])

            from aiogram.types import InlineKeyboardMarkup
            keyboard = InlineKeyboardMarkup(inline_keyboard=evidence_keyboard)

            await callback_query.message.answer(
                "Что вы хотите осмотреть подробнее в этой локации?",
                reply_markup=keyboard
            )
        else:
            await callback_query.message.answer(
                "В этой локации нет улик, которые можно осмотреть.",
                reply_markup=get_investigation_keyboard({})
            )

def generate_scene_description(scene_name):
    """Generate a description for a scene

    This is a simple implementation for MVP. In future versions,
    this could be replaced with scene descriptions from the database.

    Args:
        scene_name: Scene name

    Returns:
        Scene description
    """
    # Predefined descriptions for specific scenes
    if scene_name == "Кабинет библиотекаря":
        return ("Вы входите в кабинет библиотекаря. Это небольшая комната с массивным деревянным столом, "
                "стеллажами книг и одним окном, которое закрыто и не показывает признаков взлома.\n\n"
                "На столе лежит открытая старинная книга с непонятными символами. Рядом с книгой - "
                "опрокинутая чашка с остатками чая. На полу возле стола виднеются темные пятна, "
                "похожие на чернила.\n\n"
                "На ковре разбросаны страницы из других книг, а на двери изнутри видны царапины, "
                "словно кто-то пытался выбраться.")

    elif scene_name == "Кабинет директора":
        return ("Кабинет директора библиотеки выглядит гораздо более просторным и роскошным, чем "
                "кабинет библиотекаря. Здесь стоит большой антикварный стол, за которым разместилось "
                "удобное кожаное кресло. Стены украшены картинами и профессиональными сертификатами.\n\n"
                "На столе идеальный порядок: документы аккуратно сложены, дорогая перьевая ручка "
                "размещена в подставке. Рядом стоит фотография директора с какими-то высокопоставленными "
                "лицами на фоне редких книг.\n\n"
                "В углу комнаты находится запертый шкаф со стеклянными дверцами, за которыми видны "
                "особенно редкие и ценные экземпляры книг.")

    elif scene_name == "Общий зал библиотеки":
        return ("Большой главный зал библиотеки впечатляет своими размерами и атмосферой. Высокие потолки, "
                "украшенные лепниной, создают ощущение простора. Ряды книжных полок тянутся во всех "
                "направлениях, заполненные тысячами томов.\n\n"
                "В центре зала расположены длинные деревянные столы для работы посетителей, сейчас пустующие. "
                "Большие окна пропускают дневной свет, освещая пылинки, танцующие в воздухе.\n\n"
                "За стойкой регистрации никого нет. На ней лежит открытый журнал посещений, где отмечены "
                "последние посетители библиотеки.")

    elif scene_name == "Хранилище редких книг":
        return ("Хранилище редких книг представляет собой небольшое помещение с особым микроклиматом. "
                "Температура и влажность здесь поддерживаются на постоянном уровне для сохранности "
                "уникальных экземпляров.\n\n"
                "Специальные стеллажи с выдвижными ящиками и запирающимися витринами содержат "
                "самые ценные издания библиотеки. На некоторых полках установлены датчики движения "
                "и другие системы защиты.\n\n"
                "В дальнем углу стоит стол для работы с редкими экземплярами, оборудованный специальным "
                "освещением и увеличительными стеклами для изучения древних текстов.")

    # Default description
    return (f"Вы осматриваете {scene_name}. Это обычное помещение библиотеки, ничего особенного "
            f"на первый взгляд не видно. Возможно, стоит осмотреться внимательнее или поискать "
            f"улики в других местах.")

@handle_exception
async def handle_status_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle character status change callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract status and character ID
    parts = callback_query.data.split("_")
    status = parts[1]
    character_id = int(parts[2])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get character information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        if not character_state:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        character = await story_repo.get_character_by_id(character_id)
        if not character:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        # Update character status
        old_status = character_state.status
        await investigation_repo.update_character_status(investigation_id, character_id, status)

        # Get status text
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(status, "👤")

        status_text = {
            "witness": "Свидетель",
            "suspect": "Подозреваемый",
            "criminal": "Преступник"
        }.get(status, "Неизвестно")

        # Send confirmation
        await callback_query.message.answer(
            f"✅ Статус персонажа *{character.name}* изменен с "
            f"«{old_status.capitalize()}» на «{status_text}»",
            parse_mode="Markdown"
        )

        # If marked as criminal, suggest solving the case
        if status == "criminal":
            await callback_query.message.answer(
                f"{status_emoji} Вы отметили *{character.name}* как преступника. "
                f"Готовы выдвинуть официальное обвинение и завершить расследование?",
                parse_mode="Markdown",
                reply_markup=get_investigation_keyboard({"Решить дело": "solve_case"})
            )
        else:
            # Return to character interaction
            await callback_query.message.answer(
                f"Что вы хотите спросить у персонажа *{character.name}*?",
                parse_mode="Markdown",
                reply_markup=get_character_interaction_keyboard(character_id)
            )

@handle_exception
async def handle_cancel_status_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle cancel action from the status change keyboard."""
    await callback_query.answer()

    parts = callback_query.data.split("_")
    character_id = int(parts[-1]) if parts and parts[-1].isdigit() else None

    if character_id:
        await state.set_state(UserStates.character_interaction)
        await callback_query.message.answer(
            "Изменение статуса отменено. Что дальше?",
            reply_markup=get_character_interaction_keyboard(character_id)
        )
    else:
        await callback_query.message.answer("Изменение статуса отменено.")

@handle_exception
async def handle_back_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle back to investigation callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    # Set state back to investigation
    await state.set_state(UserStates.investigation)

    async with get_db_session() as session:
        # Get current investigation node
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        investigation = await investigation_repo.get_by_id(investigation_id)
        if not investigation:
            await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
            return

        current_node = await story_repo.get_story_node(investigation.story_id, investigation.current_node)
        if not current_node:
            await callback_query.message.answer("Ошибка: невозможно найти текущий узел истории")
            return

        # Send current node content
        await callback_query.message.answer(
            "🔍 *Возвращаемся к расследованию*\n\n"
            f"{current_node.content}",
            reply_markup=get_investigation_keyboard(current_node.transitions),
            parse_mode="Markdown"
        )

@handle_exception
async def handle_solve_case_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle solve case callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    # Set state to case solution
    await state.set_state(UserStates.case_solution)

    async with get_db_session() as session:
        # Get characters for accusation
        investigation_repo = InvestigationRepository(session)
        character_states = await investigation_repo.get_character_states(investigation_id)

        if not character_states:
            await callback_query.message.answer("Ошибка: невозможно найти персонажей для обвинения")
            return

        # Prepare character list
        characters = []
        for cs in character_states:
            character = cs.character
            characters.append({
                "id": character.id,
                "name": character.name,
                "status": cs.status
            })

        # Send accusation prompt
        await callback_query.message.answer(
            "🔍 *Решение дела*\n\n"
            "После тщательного изучения всех улик и опроса свидетелей вы готовы сделать заключение "
            "о том, кто виновен в преступлении. Кого вы обвиняете?",
            reply_markup=get_accusation_keyboard(characters),
            parse_mode="Markdown"
        )

@handle_exception
async def handle_accuse_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle character accusation callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract character ID
    character_id = int(callback_query.data.split("_")[1])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get character information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        if not character_state:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        character = await story_repo.get_character_by_id(character_id)
        if not character:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        # Get investigation
        investigation = await investigation_repo.get_by_id(investigation_id)
        if not investigation:
            await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
            return

        # Mark character as criminal
        await investigation_repo.update_character_status(investigation_id, character_id, "criminal")

        # Get story node for accusation result
        # For Phase 1 MVP, we'll use the accusation node from the story
        # In a future version, this could be more dynamic based on evidence
        story = await story_repo.get_by_id(investigation.story_id)

        # Try to find node for this accusation
        accusation_node_id = f"accuse_{character.name.lower().replace(' ', '_')}"
        accusation_node = await story_repo.get_story_node(story.id, accusation_node_id)

        if not accusation_node:
            # Try fallback to generic accusation node
            accusation_node = await story_repo.get_story_node(story.id, "accuse_character")

        # If still not found, use a generic message
        if not accusation_node:
            # Check if this character is the actual criminal
            is_correct = character.initial_status == "criminal"

            if is_correct:
                await callback_query.message.answer(
                    f"🕵️‍♂️ *Поздравляем, Детектив!*\n\n"
                    f"Вы правильно определили, что {character.name} является преступником. "
                    f"Ваш анализ улик и опрос свидетелей привели вас к верному решению!\n\n"
                    f"Дело раскрыто!",
                    parse_mode="Markdown",
                    reply_markup=get_continue_keyboard()
                )

                # Mark investigation as completed
                await investigation_repo.complete_investigation(investigation_id)
            else:
                await callback_query.message.answer(
                    f"❌ *Ошибка в расследовании*\n\n"
                    f"К сожалению, ваше обвинение {character.name} было ошибочным. "
                    f"Не хватает убедительных доказательств, чтобы подтвердить вину этого персонажа.\n\n"
                    f"Вы можете продолжить расследование или попробовать обвинить другого персонажа.",
                    parse_mode="Markdown",
                    reply_markup=get_continue_keyboard()
                )
        else:
            # Update investigation node and mark as completed if this is correct
            is_correct = character.initial_status == "criminal"

            if is_correct:
                await investigation_repo.complete_investigation(investigation_id)

            # Send accusation result
            await callback_query.message.answer(
                accusation_node.content,
                parse_mode="Markdown",
                reply_markup=get_continue_keyboard()
            )

@handle_exception
async def handle_note_evidence_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle adding notes to evidence

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract evidence ID
    evidence_id = int(callback_query.data.split("_")[2])

    # Store evidence ID in state for the next message
    await state.update_data(note_evidence_id=evidence_id)

    # Set state to wait for note text
    await state.set_state(UserStates.evidence_notes)

    # Prompt for note text
    await callback_query.message.answer(
        "📝 Введите ваши заметки об этой улике (или отправьте /cancel для отмены):"
    )

@handle_exception
async def handle_evidence_note_text(message: Message, state: FSMContext):
    """Handle text input for evidence notes

    Args:
        message: Message with note text
        state: FSM state
    """
    # Check for cancel command
    if message.text.lower() == "/cancel":
        await state.set_state(UserStates.evidence_analysis)
        await message.answer("Добавление заметки отменено.")
        return

    # Get evidence ID from state
    data = await state.get_data()
    evidence_id = data.get("note_evidence_id")
    investigation_id = data.get("investigation_id")

    if not evidence_id or not investigation_id:
        await message.answer("Ошибка: улика не найдена")
        await state.set_state(UserStates.investigation)
        return

    note_text = message.text

    # Save note to evidence
    async with get_db_session() as session:
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        # Get evidence
        evidence = await story_repo.get_evidence_by_id(evidence_id)
        if not evidence:
            await message.answer("Ошибка: улика не найдена")
            await state.set_state(UserStates.investigation)
            return

        # Save note
        await investigation_repo.save_evidence_analysis(investigation_id, evidence_id, note_text)

        # Set state back to evidence analysis
        await state.set_state(UserStates.evidence_analysis)

        # Send confirmation
        await message.answer(
            f"✅ Заметка к улике *{evidence.name}* сохранена.",
            parse_mode="Markdown"
        )

        # Show evidence interaction keyboard
        await message.answer(
            "Что еще вы хотите сделать с этой уликой?",
            reply_markup=get_evidence_interaction_keyboard(evidence_id)
        )

@handle_exception
async def handle_ask_specific_callback(callback_query: CallbackQuery, state: FSMContext):
    """Handle specific question callbacks

    Args:
        callback_query: Callback query
        state: FSM state
    """
    await callback_query.answer()

    # Extract question type and character ID
    parts = callback_query.data.split("_")
    question_type = parts[1]
    character_id = int(parts[2])

    # Get current investigation data
    data = await state.get_data()
    investigation_id = data.get("investigation_id")

    if not investigation_id:
        await callback_query.message.answer("Ошибка: невозможно найти текущее расследование")
        return

    async with get_db_session() as session:
        # Get character information
        investigation_repo = InvestigationRepository(session)
        story_repo = StoryRepository(session)

        character_state = await investigation_repo.get_character_state(investigation_id, character_id)
        if not character_state:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        character = await story_repo.get_character_by_id(character_id)
        if not character:
            await callback_query.message.answer("Ошибка: персонаж не найден")
            return

        # Generate question and response based on question type
        question, response = await generate_specific_qa(question_type, character, character_state)

        # Save conversation entry
        await investigation_repo.add_conversation_entry(
            investigation_id=investigation_id,
            character_id=character_id,
            user_message=question,
            character_response=response
        )

        # Send exchange
        status_emoji = {
            "witness": "👁️",
            "suspect": "❓",
            "criminal": "⛔"
        }.get(character_state.status, "👤")

        await callback_query.message.answer(
            f"Вы: {question}",
            parse_mode="Markdown"
        )

        await callback_query.message.answer(
            f"{status_emoji} *{character.name}*: {response}",
            parse_mode="Markdown"
        )

        # Return to character interaction
        await callback_query.message.answer(
            "Что еще вы хотите спросить?",
            reply_markup=get_character_interaction_keyboard(character_id)
        )

async def generate_specific_qa(question_type, character, character_state):
    """Generate specific question and answer pairs

    Args:
        question_type: Type of question (alibi, about_others)
        character: Character model
        character_state: CharacterState model

    Returns:
        Tuple of (question, response)
    """
    if question_type == "alibi":
        question = "Расскажите, где вы были во время происшествия?"

        if character.name == "Директор библиотеки":
            response = "Я был в своем кабинете, разбирал документы. Задержался допоздна. Могу предоставить записи камер наблюдения, они подтвердят, что я не покидал свой кабинет до 11 вечера."
        elif character.name == "Студент-историк":
            response = "Я был в общежитии, готовился к экзамену. Мои соседи по комнате могут это подтвердить. Я не был в библиотеке в тот вечер."
        elif character.name == "Ночной сторож":
            response = "Я совершал обход, как обычно. Каждый час я отмечаюсь в журнале и проверяю все помещения. Никого подозрительного не видел."
        else:
            response = "В тот вечер я не был в библиотеке. У меня есть надежное алиби, которое легко проверить."

    elif question_type == "about_others":
        question = "Что вы можете сказать о других сотрудниках библиотеки?"

        if character.name == "Директор библиотеки":
            response = "Ну, библиотекарь был преданным сотрудником, хотя иногда слишком принципиальным. Студент часто работал с редкими книгами, библиотекарь ему помогал. Что касается сторожа... он просто делает свою работу."
        elif character.name == "Студент-историк":
            response = "Директор всегда казался мне властным человеком, он часто спорил с библиотекарем из-за доступа к редким книгам. Сторож, насколько я знаю, работает здесь недавно."
        elif character.name == "Ночной сторож":
            response = "Я мало общаюсь с сотрудниками, но знаю, что между директором и библиотекарем были какие-то разногласия. Студент часто засиживался допоздна, библиотекарь ему это разрешал."
        else:
            response = "Я предпочитаю не обсуждать коллег. Но все они были нормальными людьми, никаких особых конфликтов я не замечал."

    else:
        question = "У меня есть несколько вопросов о происшествии."

        if character_state.status == "witness":
            response = "Я готов ответить на любые вопросы, но, к сожалению, я мало что знаю о произошедшем."
        elif character_state.status == "suspect":
            response = "Спрашивайте, но я не понимаю, почему вы считаете, что я как-то связан с этим происшествием."
        else:  # criminal
            response = "Я уже всё рассказал полиции и не собираюсь повторяться. У вас есть доказательства против меня?"

    return question, response
