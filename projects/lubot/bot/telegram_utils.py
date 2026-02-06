from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import ContextTypes
from functools import wraps
from utils.logger import get_logger
import asyncio
from typing import Dict, Any

class TelegramUtils:
    def __init__(self):
        self.logger = get_logger(__name__)
        self._keyboard_locks: Dict[int, asyncio.Lock] = {}

    def _get_keyboard_lock(self, user_id: int) -> asyncio.Lock:
        """Get or create a lock for a specific user's keyboard"""
        if user_id not in self._keyboard_locks:
            self._keyboard_locks[user_id] = asyncio.Lock()
        return self._keyboard_locks[user_id]

    @staticmethod    
    def create_inline_keyboard(button_list):
        keyboard = [[InlineKeyboardButton(text, callback_data=data)] 
                   for text, data in button_list]
        return InlineKeyboardMarkup(keyboard)
    
    async def remove_keyboard(self, 
                            context: ContextTypes.DEFAULT_TYPE, 
                            user_id: int, 
                            active_keyboards: Dict[int, Dict[str, Any]]):
        """Remove keyboard markup for a specific user"""
        async with self._get_keyboard_lock(user_id):
            if user_id in active_keyboards:
                try:
                    keyboard_info = active_keyboards[user_id]
                    await context.bot.edit_message_reply_markup(
                        chat_id=keyboard_info['chat_id'],
                        message_id=keyboard_info['message_id'],
                        reply_markup=None
                    )
                    del active_keyboards[user_id]
                except Exception as e:
                    self.logger.warning(
                        f"Failed to remove keyboard for user {user_id}: {str(e)}"
                    )

    async def send_message(self, 
                          update: Update, 
                          context: ContextTypes.DEFAULT_TYPE, 
                          text: str):
        """Send a message with error handling"""
        from telegram.error import Unauthorized
        user_id = update.effective_user.id
        try:
            await context.bot.send_message(
                chat_id=update.effective_chat.id, 
                text=text
            )
        except Unauthorized:
            self.logger.warning(
                f"Cannot send message to user {user_id}: bot was blocked"
            )
        except Exception as e:
            self.logger.error(
                f"Failed to send message to user {user_id}: {str(e)}"
            )

    def remove_keyboard_decorator(self, func):
        """Decorator to remove keyboard before executing handler"""
        @wraps(func)
        async def wrapper(self, 
                         update: Update, 
                         context: ContextTypes.DEFAULT_TYPE, 
                         *args, **kwargs):
            user_id = update.effective_user.id
            await self.remove_keyboard(context, user_id)
            return await func(self, update, context, *args, **kwargs)
        return wrapper