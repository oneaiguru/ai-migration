from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from utils.logger import get_logger, log_analytics
from utils.localization import get_text

class CallbackHandlers:
    def __init__(self, relationship_bot, chatbot_id):
        self.relationship_bot = relationship_bot
        self.chatbot_id = chatbot_id
        self.logger = get_logger(__name__)

    async def handle_feedback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        
        feedback_type = query.data
        user_id = query.from_user.id
        
        if feedback_type in ["positive", "negative"]:
            try:
                is_positive = feedback_type == "positive"
                await self.relationship_bot.handle_feedback(user_id, self.chatbot_id, is_positive)
                await query.answer(get_text("feedback_received"))
                await query.edit_message_reply_markup(reply_markup=None)
            except Exception as e:
                self.logger.error(f"Error handling feedback: {str(e)}")
                await query.answer(get_text("feedback_error"))
        else:
            await query.answer(get_text("invalid_feedback"))
