from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    ContextTypes,
    filters,
)
from utils.logger import get_logger
from utils.localization import get_text
from utils.error_handler import handle_error
from services.chatbot_service import ChatbotService
from services.referral_service import AsyncReferralService  # Updated import
from .command_handlers import CommandHandlers
from .conversation_handlers import ConversationHandlers
from .callback_handlers import CallbackHandlers
from .partner_manager import PartnerManager
from .telegram_utils import TelegramUtils
from config.settings import bot_config

class TelegramBot:
    def __init__(self, application: Application, chatbot_id: int, relationship_bot, bt_logger):
        self.application = application
        self.chatbot_id = chatbot_id
        self.relationship_bot = relationship_bot
        self.bt_logger = bt_logger
        self.logger = get_logger(__name__)
        self.active_keyboards: dict[int, dict[str, int]] = {}
        
        # Initialize services
        self.chatbot_service = ChatbotService()
        self.referral_service = AsyncReferralService()  # Updated instantiation
        
        # Initialize handlers
        self.command_handlers = CommandHandlers(
            relationship_bot, chatbot_id, self.chatbot_service
        )
        self.conversation_handlers = ConversationHandlers(
            relationship_bot, chatbot_id
        )
        self.callback_handlers = CallbackHandlers(
            relationship_bot, chatbot_id
        )
        self.partner_manager = PartnerManager(
            relationship_bot, chatbot_id
        )
        self.telegram_utils = TelegramUtils()
    
    async def setup(self):  # Make setup async
        # Command Handlers
        self.application.add_handler(CommandHandler("start", self.command_handlers.start))
        self.application.add_handler(CommandHandler("manual", self.command_handlers.manual))
        self.application.add_handler(CommandHandler("support", self.command_handlers.support))
        self.application.add_handler(CommandHandler("referral", self.command_handlers.handle_referral_command))
        self.application.add_handler(CommandHandler("referral_status", self.command_handlers.handle_referral_status_command))
        
        # Partner Commands
        self.application.add_handler(CommandHandler("p", self.partner_manager.partner_menu))
        self.application.add_handler(CommandHandler("r", self.command_handlers.rename_partner))
        
        # Updated Conversation Handler
        conv_handler = ConversationHandler(
            entry_points=[CommandHandler("start", self.command_handlers.start)],
            states={
                bot_config.GENDER_SELECTION: [
                    CallbackQueryHandler(self.conversation_handlers.gender_selection)
                ],
            },
            fallbacks=[
                CallbackQueryHandler(self.conversation_handlers.cancel_conversation)
            ],
            per_message=True,  # Changed this to True
            name="my_conversation",
        )
        self.application.add_handler(conv_handler)
    
        # Message Handlers
        self.application.add_handler(
            MessageHandler(
                filters.TEXT & ~filters.COMMAND,
                self.handle_text
            )
        )
        self.application.add_handler(
            MessageHandler(
                filters.ALL & ~filters.TEXT & ~filters.COMMAND,
                self.handle_non_text
            )
        )
        
        # Callback Query Handlers
        self.application.add_handler(
            CallbackQueryHandler(self.callback_handlers.handle_feedback, pattern="^(positive|negative)$")
        )
        
        # Error Handler
        self.application.add_error_handler(handle_error)
        
        self.logger.info(f"TelegramBot handlers set up for chatbot ID {self.chatbot_id}")
    
    async def handle_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):  # Changed from CallbackContext
        user_id = update.effective_user.id
        message = update.message.text
    
        await self.telegram_utils.remove_keyboard(context, user_id, self.active_keyboards)
        
        try:
            response, feedback_prompt = await self.relationship_bot.handle_message(
                user_id, self.chatbot_id, message
            )
            
            if feedback_prompt:
                await self.send_with_feedback_buttons(update, context, response)
            else:
                await context.bot.send_message(chat_id=update.effective_chat.id, text=response)
                
        except Exception as e:
            self.logger.error(f"Error handling text message: {str(e)}")
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=get_text("unexpected_error_response")
            )
    
    async def handle_non_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):  # Changed from CallbackContext
        if update.message:
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=get_text("non_text_message_support")
            )
    
    async def send_with_feedback_buttons(self, update: Update, context: ContextTypes.DEFAULT_TYPE, text: str):  # Changed from CallbackContext
        keyboard = [
            [InlineKeyboardButton(get_text("feedback_positive"), callback_data="positive")],
            [InlineKeyboardButton(get_text("feedback_negative"), callback_data="negative")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        sent_message = await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text=text,
            reply_markup=reply_markup
        )
        
        self.active_keyboards[update.effective_user.id] = {  # Changed to a dictionary
            'chat_id': update.effective_chat.id,
            'message_id': sent_message.message_id
        }
