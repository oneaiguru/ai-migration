from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes
from utils.logger import get_logger
from utils.localization import get_text
from utils.custom_exceptions import ValidationError, DatabaseException
import asyncio
from typing import List, Optional

class PartnerManager:
    def __init__(self, relationship_bot, chatbot_id):
        self.relationship_bot = relationship_bot
        self.chatbot_id = chatbot_id
        self.logger = get_logger(__name__)
        self._locks = {}

    def _get_lock(self, user_id: int) -> asyncio.Lock:
        """Get or create a lock for a specific user"""
        if user_id not in self._locks:
            self._locks[user_id] = asyncio.Lock()
        return self._locks[user_id]

    async def _build_partner_menu(self, partners, active_partner_id=None):
        """Build the partner selection menu with keyboard markup"""
        keyboard = []
        keyboard.append([InlineKeyboardButton(get_text("new_partner"), callback_data="new_partner")])
        
        for partner in partners:
            name_prefix = "✅ " if partner.id == active_partner_id else "👤 "
            partner_button = [
                InlineKeyboardButton(
                    f"{name_prefix}{partner.name}", 
                    callback_data=f"partner_{partner.id}"
                )
            ]
            delete_button = [
                InlineKeyboardButton(
                    f"❌ {get_text('delete')} {partner.name}", 
                    callback_data=f"delete_partner_{partner.id}"
                )
            ]
            keyboard.extend([partner_button, delete_button])
        
        return InlineKeyboardMarkup(keyboard)

    async def partner_menu(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Display the partner management menu"""
        user_id = update.effective_user.id
        
        try:
            async with self._get_lock(user_id):
                # Parallel fetch of partners and active partner
                partners, active_partner = await asyncio.gather(
                    self.relationship_bot.get_user_partners(user_id, self.chatbot_id),
                    self.relationship_bot.get_active_partner(user_id, self.chatbot_id)
                )
                
                active_partner_id = active_partner.id if active_partner else None
                menu_markup = await self._build_partner_menu(partners, active_partner_id)
                
                message = get_text("partner_menu_prompt")
                if active_partner:
                    message += f"\n{get_text('active_partner')}: {active_partner.name}"
                
                await context.bot.send_message(
                    chat_id=update.effective_chat.id,
                    text=message,
                    reply_markup=menu_markup
                )
                
        except Exception as e:
            self.logger.error(f"Error in partner_menu for user {user_id}: {str(e)}")
            await context.bot.send_message(
                chat_id=update.effective_chat.id,
                text=get_text("partner_menu_error")
            )

    async def handle_partner_action(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle partner-related button callbacks"""
        query = update.callback_query
        user_id = query.from_user.id
        action = query.data
        
        try:
            async with self._get_lock(user_id):
                if action == "new_partner":
                    response = await self.relationship_bot.create_new_partner(user_id, self.chatbot_id)
                    success_msg = get_text("new_partner_created")
                
                elif action.startswith("partner_"):
                    partner_id = int(action.split("_")[1])
                    await self.relationship_bot.set_active_partner(user_id, self.chatbot_id, partner_id)
                    partner = await self.relationship_bot.get_partner(partner_id)
                    success_msg = get_text("partner_activated", partner_name=partner.name)
                
                elif action.startswith("delete_partner_"):
                    partner_id = int(action.split("_")[2])
                    partner = await self.relationship_bot.get_partner(partner_id)
                    if partner:
                        partner_name = partner.name
                        await self.relationship_bot.delete_partner(user_id, self.chatbot_id, partner_id)
                        success_msg = get_text("partner_deleted", partner_name=partner_name)
                    else:
                        raise ValidationError(get_text("partner_not_found"))
                
                # Update menu after action
                partners, active_partner = await asyncio.gather(
                    self.relationship_bot.get_user_partners(user_id, self.chatbot_id),
                    self.relationship_bot.get_active_partner(user_id, self.chatbot_id)
                )
                
                menu_markup = await self._build_partner_menu(
                    partners, 
                    active_partner.id if active_partner else None
                )
                
                await query.answer(success_msg)
                await query.edit_message_text(
                    text=get_text("partner_menu_prompt"),
                    reply_markup=menu_markup
                )
                
        except ValidationError as e:
            self.logger.warning(f"Validation error in handle_partner_action for user {user_id}: {str(e)}")
            await query.answer(str(e))
        except DatabaseException as e:
            self.logger.error(f"Database error in handle_partner_action for user {user_id}: {str(e)}")
            await query.answer(get_text("database_error"))
        except Exception as e:
            self.logger.error(f"Unexpected error in handle_partner_action for user {user_id}: {str(e)}")
            await query.answer(get_text("partner_action_error"))

    async def add_partner(self, user_id: int, name: str):
        """Add a new partner for the user"""
        try:
            async with self._get_lock(user_id):
                return await self.relationship_bot.create_new_partner(user_id, self.chatbot_id, name)
        except Exception as e:
            self.logger.error(f"Error adding partner for user {user_id}: {str(e)}")
            raise

    async def get_partners(self, user_id: int):
        """Get all partners for the user"""
        try:
            return await self.relationship_bot.get_user_partners(user_id, self.chatbot_id)
        except Exception as e:
            self.logger.error(f"Error getting partners for user {user_id}: {str(e)}")
            raise

    async def rename_partner(self, user_id: int, partner_id: int, new_name: str):
        """Rename an existing partner"""
        try:
            async with self._get_lock(user_id):
                return await self.relationship_bot.rename_partner(
                    user_id, self.chatbot_id, partner_id, new_name
                )
        except Exception as e:
            self.logger.error(f"Error renaming partner {partner_id} for user {user_id}: {str(e)}")
            raise

    async def get_active_partner(self, user_id: int):
        """Get the currently active partner for the user"""
        try:
            return await self.relationship_bot.get_active_partner(user_id, self.chatbot_id)
        except Exception as e:
            self.logger.error(f"Error getting active partner for user {user_id}: {str(e)}")
            raise

    async def set_active_partner(self, user_id: int, partner_id: int):
        """Set the active partner for the user"""
        try:
            async with self._get_lock(user_id):
                return await self.relationship_bot.set_active_partner(
                    user_id, self.chatbot_id, partner_id
                )
        except Exception as e:
            self.logger.error(f"Error setting active partner for user {user_id}: {str(e)}")
            raise