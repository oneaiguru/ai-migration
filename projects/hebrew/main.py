import json
import logging
import os
import random

logger = logging.getLogger(__name__)

try:
    from aiogram import Bot, Dispatcher, types
    from aiogram.contrib.middlewares.logging import LoggingMiddleware
    from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
    from aiogram.utils import executor
except Exception as exc:  # aiogram not installed or incompatible
    logger.warning("aiogram>=2,<3 required; handlers disabled (%s).", exc)
    Bot = Dispatcher = types = LoggingMiddleware = executor = InlineKeyboardButton = InlineKeyboardMarkup = None

from . import exercise_handler
from .credentials import telegram_bot_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = None
dp = None

if Bot and telegram_bot_token:
    bot = Bot(token=telegram_bot_token)
    dp = Dispatcher(bot)
    dp.middleware.setup(LoggingMiddleware())
else:
    logger.warning("aiogram or TELEGRAM_BOT_TOKEN missing; Hebrew bot handlers disabled.")


if dp:
    def generate_exercise_menu():
        exercise_config = exercise_handler.load_exercises_config()
        markup = InlineKeyboardMarkup(row_width=1)
        for exercise_key in exercise_config.keys():
            button = InlineKeyboardButton(exercise_key, callback_data=exercise_key)
            markup.add(button)
        return markup

    def load_exercise_lists(file_path):
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                lists = json.load(f)
        else:
            lists = {
                'verbs': [],
                'body_parts': [],
                'geography_terms': [],
                'numerals': [],
                'family_relationships': [],
            }
        return lists

    def save_exercise_lists(file_path, lists):
        with open(file_path, 'w') as f:
            json.dump(lists, f)

    def add_item_to_exercise_list(file_path, lists, category, item):
        if category in lists:
            lists[category].append(item)
            save_exercise_lists(file_path, lists)
        else:
            print(f"Invalid category '{category}'")

    def practice_exercise_item(file_path, lists, category):
        if category not in lists:
            return f"Invalid category '{category}'."
        if not lists[category]:
            return f"No items available for category '{category}'."
        return random.choice(lists[category])

    @dp.message_handler(commands=['exercise_list'])
    async def handle_exercise_list(message: types.Message):
        text = message.text.split()
        if len(text) < 2:
            await message.reply("Usage: /exercise_list [add|practice] [category] [item]")
            return

        command = text[1].lower()
        category = text[2].lower() if len(text) > 2 else None
        item = ' '.join(text[3:]) if len(text) > 3 else None

        file_path = 'exercise_lists.json'
        lists = load_exercise_lists(file_path)

        if command == 'add':
            if item:
                add_item_to_exercise_list(file_path, lists, category, item)
                await message.reply(f"Item '{item}' added to the '{category}' category.")
            else:
                await message.reply("Please provide an item to add.")
        elif command == 'practice':
            item_to_practice = practice_exercise_item(file_path, lists, category)
            await message.reply(f"Practice this {category}: {item_to_practice}")
        else:
            await message.reply("Invalid command. Use 'add' or 'practice'.")

    @dp.message_handler(commands=['exercises'])
    async def send_exercises_list(message: types.Message):
        exercises_config = exercise_handler.load_exercises_config()

        markup = InlineKeyboardMarkup()
        for exercise_id, exercise_info in exercises_config.items():
            button = InlineKeyboardButton(exercise_info["name"], callback_data=f"exercise_{exercise_id}")
            markup.add(button)

        await message.reply("Here's the list of available exercises:", reply_markup=markup)

    @dp.callback_query_handler(lambda c: c.data.startswith('exercise_'))
    async def handle_exercise_button(callback_query: types.CallbackQuery):
        exercise_id = callback_query.data[len('exercise_'):]
        user_id = callback_query.from_user.id

        exercise_handler.set_current_exercise(user_id, exercise_id)

        await bot.answer_callback_query(callback_query.id)
        await bot.send_message(callback_query.from_user.id, f"Selected exercise: {exercise_id}. Now you can practice it.")

    @dp.message_handler(commands=['start', 'help'])
    async def send_welcome(message: types.Message):
        markup = generate_exercise_menu()
        await message.reply("Hi!\nI'm here to help you practice Hebrew. Let's get started!", reply_markup=markup)

    @dp.callback_query_handler()
    async def exercise_selection_handler(query: types.CallbackQuery):
        exercise_key = query.data
        await bot.answer_callback_query(query.id)
        await bot.send_message(query.from_user.id, f"You selected: {exercise_key}")

    @dp.message_handler()
    async def text_message_handler(message: types.Message):
        user_id = message.from_user.id
        exercise_id, line_number = exercise_handler.select_random_exercise(user_id)
        question, _ = exercise_handler.get_exercise_question_answer(user_id, exercise_id, line_number)
        await message.reply(question + "\n\nReply with your answer to continue.")

if __name__ == '__main__' and dp:
    executor.start_polling(dp, skip_updates=True)
