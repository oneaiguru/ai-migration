from aiogram import Router
from aiogram.filters import Command

from bot.states import UserStates
from bot.conversation import (
    start_conversation, help_command, select_story, handle_action_callback,
    handle_character_callback, handle_evidence_callback, handle_scene_callback,
    handle_analyze_callback, handle_character_question, handle_note_evidence_callback,
    handle_evidence_note_text, handle_back_callback, handle_status_callback,
    handle_present_evidence_callback, handle_present_specific_callback,
    handle_solve_case_callback, handle_accuse_callback, show_features_command,
    continue_investigation, show_inventory, show_user_profile, show_cases_command,
    handle_cancel_present_callback, handle_change_status_prompt_callback,
    handle_ask_alibi_callback, handle_ask_about_others_callback,
    handle_inventory_callback, handle_continue_investigation_callback,
    handle_new_investigation_callback, handle_view_solved_cases_callback,
    handle_exit_callback, handle_cancel_status_callback
)

def register_commands(dp):
    """Register all command handlers

    Args:
        dp: Dispatcher instance
    """
    # Create router
    router = Router()

    # Register command handlers
    router.message.register(start_conversation, Command(commands=["start"]))
    router.message.register(help_command, Command(commands=["help"]))
    router.message.register(show_features_command, Command(commands=["features"]))
    router.message.register(continue_investigation, Command(commands=["continue"]))
    router.message.register(show_inventory, Command(commands=["inventory"]))
    router.message.register(show_user_profile, Command(commands=["profile"]))
    router.message.register(show_cases_command, Command(commands=["cases"]))
    router.message.register(handle_evidence_note_text, UserStates.evidence_notes)

    # Register callback handlers
    # Story selection
    router.callback_query.register(select_story, lambda c: c.data.startswith("story_"))

    # Story navigation
    router.callback_query.register(
        handle_action_callback,
        lambda c: c.data.startswith("action_") or (c.data.startswith("a") and c.data[1:].isdigit())
    )

    # Character interactions
    router.callback_query.register(handle_character_callback, lambda c: c.data.startswith("character_"))
    router.callback_query.register(handle_ask_alibi_callback, lambda c: c.data.startswith("ask_alibi_"))
    router.callback_query.register(handle_ask_about_others_callback, lambda c: c.data.startswith("ask_about_others_"))
    router.callback_query.register(handle_change_status_prompt_callback, lambda c: c.data.startswith("change_status_"))
    router.callback_query.register(handle_status_callback, lambda c: c.data.startswith("status_"))
    router.callback_query.register(handle_cancel_status_callback, lambda c: c.data.startswith("cancel_status_"))
    router.callback_query.register(handle_present_evidence_callback, lambda c: c.data.startswith("present_to_"))
    router.callback_query.register(handle_cancel_present_callback, lambda c: c.data.startswith("cancel_present_"))
    router.callback_query.register(
        handle_present_specific_callback,
        lambda c: c.data.startswith("present_") and not c.data.startswith("present_to_")
    )
    router.callback_query.register(handle_inventory_callback, lambda c: c.data == "inventory")

    # Evidence interactions
    router.callback_query.register(handle_evidence_callback, lambda c: c.data.startswith("evidence_") and not c.data.startswith("evidence_to_"))
    router.callback_query.register(handle_analyze_callback, lambda c: c.data.startswith("analyze_evidence_"))
    router.callback_query.register(handle_note_evidence_callback, lambda c: c.data.startswith("note_evidence_"))

    # Scene interactions
    router.callback_query.register(handle_scene_callback, lambda c: c.data.startswith("scene_"))

    # Navigation and case solution
    router.callback_query.register(handle_continue_investigation_callback, lambda c: c.data == "continue_investigation")
    router.callback_query.register(handle_new_investigation_callback, lambda c: c.data == "new_investigation")
    router.callback_query.register(handle_view_solved_cases_callback, lambda c: c.data == "view_solved_cases")
    router.callback_query.register(handle_exit_callback, lambda c: c.data == "exit")
    router.callback_query.register(handle_back_callback, lambda c: c.data == "back_to_investigation")
    router.callback_query.register(handle_solve_case_callback, lambda c: c.data == "solve_case")
    router.callback_query.register(handle_accuse_callback, lambda c: c.data.startswith("accuse_"))

    # Add router to dispatcher
    dp.include_router(router)
