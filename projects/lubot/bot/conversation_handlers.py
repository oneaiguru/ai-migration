# conversation_handlers.py
from telegram import Update
from telegram.ext import ConversationHandler, CallbackContext
from utils.validation import validate_gender
from utils.custom_exceptions import ValidationError, DatabaseException
from config.settings import bot_config
from utils.logger import get_logger, log_analytics
from utils.localization import get_text


class ConversationHandlers:
    def __init__(self, relationship_bot, chatbot_id):
        self.relationship_bot = relationship_bot
        self.chatbot_id = chatbot_id
        self.logger = get_logger(__name__)
    async def invalid_input(self, update: Update, context: CallbackContext):
        """Handle invalid inputs during conversation."""
        if update.message:
            await update.message.reply_text(get_text("invalid_input_message"))
        return ConversationHandler.END
    async def gender_selection(self, update: Update, context: CallbackContext):
        query = update.callback_query
        new_gender = query.data
        user_id = update.effective_user.id

        try:
            # conversation_handlers.py
            self.relationship_bot.set_user_gender(user_id, self.chatbot_id, new_gender)

            variant_name = self.relationship_bot.assign_ab_test_variant(user_id, self.chatbot_id)
            
            self.relationship_bot.update_chat_instances(user_id, self.chatbot_id, new_gender, variant_name)
            
            query.edit_message_text(text=get_text("gender_recorded"))
            return ConversationHandler.END
            
        except Exception as e:
            self.logger.error(f"Error in gender selection for user {user_id}: {str(e)}")
            query.edit_message_text(text=get_text("gender_error"))
            return ConversationHandler.END

    def cancel_conversation(self, update, context):
        update.message.reply_text(get_text("conversation_cancelled"))
        return ConversationHandler.END
