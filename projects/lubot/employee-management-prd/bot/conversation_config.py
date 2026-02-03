# bot/conversation_config.py
from telegram.ext import CallbackQueryHandler, ConversationHandler
from .conversation_handlers import ConversationHandlers

def create_conversation_handler(command_handlers, conversation_handlers):
    return ConversationHandler(
        entry_points=[CallbackQueryHandler(conversation_handlers.start_conversation)],
        states={
            # Define states using only CallbackQueryHandler
            'GENDER_SELECTION': [
                CallbackQueryHandler(conversation_handlers.gender_selection)
            ],
        },
        fallbacks=[
            CallbackQueryHandler(conversation_handlers.cancel_conversation)
        ],
        per_message=True,
        name="my_conversation",
        persistent=False
    )