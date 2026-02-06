from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, ConversationHandler, CallbackContext
from utils.localization import get_text
from utils.logger import get_logger, log_analytics
from utils.custom_exceptions import ValidationError, DatabaseException
from database.user_repository import AsyncUserRepository
from database.referral_repository import AsyncReferralRepository
from .telegram_utils import TelegramUtils
from config.settings import bot_config

class CommandHandlers:
    def __init__(self, relationship_bot, chatbot_id, chatbot_service):
        self.relationship_bot = relationship_bot
        self.chatbot_id = chatbot_id
        self.chatbot_service = chatbot_service
        self.logger = get_logger(__name__)
        self.telegram_utils = TelegramUtils()
        self.active_keyboards = {}

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    
        """Handle the /start command"""
        user_id = update.effective_user.id
        username = update.effective_user.username

        try:
            # Create or get user asynchronously
            user, error_message = await self.relationship_bot.create_or_get_user(
                user_id, self.chatbot_id, username
            )
            
            if error_message:
                await context.bot.send_message(
                    chat_id=update.effective_chat.id,
                    text=error_message
                )
                return ConversationHandler.END
            
            # Get bot info asynchronously
            bot_info = await self.chatbot_service.get_bot_info(self.chatbot_id)
            welcome_message = get_text("welcome_message", chatbot_name=bot_info["name"])
            
            # Send welcome message
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=welcome_message
            )
            
            # Prompt gender selection
            return await self.prompt_gender_selection(update, context)
            
        except Exception as e:
            self.logger.error(f"Error in start command for user {user_id}: {str(e)}")
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=get_text("start_error")
            )
            return ConversationHandler.END

    async def prompt_gender_selection(self, update: Update, context: CallbackContext):
        """Prompt user to select their gender with three distinct options"""
        keyboard = [
            [InlineKeyboardButton(get_text("male"), callback_data="male")],
            [InlineKeyboardButton(get_text("female"), callback_data="female")],
            [InlineKeyboardButton(get_text("other"), callback_data="other")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Use reply_text instead of send_message for better UX
        message = await update.effective_message.reply_text(
            get_text("select_gender"),
            reply_markup=reply_markup
        )
        
        # Store keyboard reference for later cleanup
        self.active_keyboards[update.effective_user.id] = (
            update.effective_chat.id,
            message.message_id
        )
        
        return bot_config.GENDER_SELECTION

    async def manual(self, update: Update, context: CallbackContext):
        """Handle the /manual command"""
        try:
            manual_text = self.relationship_bot.get_user_manual(self.chatbot_id)
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=manual_text
            )
        except Exception as e:
            self.logger.error(f"Error retrieving user manual: {str(e)}")
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=get_text("manual_error")
            )

    async def support(self, update: Update, context: CallbackContext):
        """Handle the /support command"""
        try:
            contact_info = self.relationship_bot.get_contact_info()
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=contact_info
            )
        except Exception as e:
            self.logger.error(f"Error retrieving contact info: {str(e)}")
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=get_text("support_error")
            )

    async def handle_referral_command(self, update: Update, context: CallbackContext):
        """Handle the /referral command"""
        user_id = update.message.from_user.id
        try:
            referral_link = await self.relationship_bot.generate_referral_link(
                user_id, self.chatbot_id
            )
            await update.message.reply_text(referral_link)
        except Exception as e:
            self.logger.error(f"Error generating referral link: {str(e)}")
            await update.message.reply_text(get_text("referral_link_error"))

    async def handle_referral_status_command(self, update: Update, context: CallbackContext):
        """Handle the /referral_status command"""
        user_id = update.message.from_user.id
        try:
            status = await self.relationship_bot.get_referral_status(user_id, self.chatbot_id)
            await update.message.reply_text(status)
        except Exception as e:
            self.logger.error(f"Error retrieving referral status: {str(e)}")
            await update.message.reply_text(get_text("referral_status_error"))


    async def rename_partner(self, update: Update, context: CallbackContext):
        """Handle the /r command to rename the active partner"""
        args = context.args
        user_id = update.effective_user.id
        
        if not args:
            await update.message.reply_text(get_text("rename_partner_usage"))
            return
        
        new_name = " ".join(args)
        
        try:
            active_partner = self.relationship_bot.get_active_partner(user_id, self.chatbot_id)
            if not active_partner:
                raise ValidationError(get_text("no_active_partner"))
            
            response = self.relationship_bot.rename_partner(
                user_id, self.chatbot_id, active_partner.id, new_name
            )
            await update.message.reply_text(response)
        except ValidationError as e:
            self.logger.warning(
                f"Validation error in rename_partner for user {user_id}: {str(e)}"
            )
            await update.message.reply_text(str(e))
        except DatabaseException as e:
            self.logger.error(
                f"Database error in rename_partner for user {user_id}: {str(e)}"
            )
            await update.message.reply_text(get_text("database_error"))
        except Exception as e:
            self.logger.error(
                f"Unexpected error in rename_partner for user {user_id}: {str(e)}"
            )
            await update.message.reply_text(get_text("unexpected_error_response"))
