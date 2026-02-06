import logging
import os
from typing import Tuple

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

from .database import create_bet, get_bet_limits, get_game_info, get_user_stats
from .utils import is_too_close_to_draw

logger = logging.getLogger(__name__)


def parse_bet_args(args: list[str]) -> Tuple[int, str]:
    if len(args) < 2:
        raise ValueError("Usage: /bet <amount> <odd|even>")
    try:
        amount = int(args[0])
    except ValueError as exc:
        raise ValueError("Bet amount must be a number") from exc
    choice = args[1].lower()
    if choice not in {"odd", "even"}:
        raise ValueError("Choice must be 'odd' or 'even'")
    return amount, choice


async def bet_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    try:
        bet_amount, bet_choice = parse_bet_args(context.args)
    except ValueError as exc:
        await context.bot.send_message(chat_id=user_id, text=str(exc))
        return

    min_bet, max_bet = get_bet_limits()
    if bet_amount < min_bet or bet_amount > max_bet:
        await context.bot.send_message(
            chat_id=user_id, text=f"Invalid bet amount. Allowed range: {min_bet} to {max_bet}."
        )
        return

    if is_too_close_to_draw():
        await context.bot.send_message(
            chat_id=user_id,
            text="Sorry, you can't place a bet right now. The next draw is coming up soon.",
        )
        return

    create_bet(user_id, bet_amount, bet_choice)
    await context.bot.send_message(
        chat_id=user_id, text=f"Your bet of {bet_amount} points on {bet_choice} has been placed."
    )


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    stats = get_user_stats(user_id)
    message = (
        f"Your Betting Stats:\n"
        f"Total Bets: {stats['total_bets']}\n"
        f"Wins: {stats['wins']}\n"
        f"Losses: {stats['losses']}\n"
        f"Total Won: {stats['total_won']}\n"
        f"Total Lost: {stats['total_lost']}\n"
        f"Current Balance: {stats['balance']} points"
    )
    await context.bot.send_message(chat_id=user_id, text=message)


async def info_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_id = update.effective_user.id
    info = get_game_info()
    await context.bot.send_message(chat_id=user_id, text=info)


def setup_bot(application: Application) -> None:
    application.add_handler(CommandHandler("bet", bet_command))
    application.add_handler(CommandHandler("stats", stats_command))
    application.add_handler(CommandHandler("info", info_command))


def build_application() -> Application:
    token = os.getenv("LOTO_BOT_TOKEN")
    if not token:
        raise RuntimeError("Missing Telegram bot token; set LOTO_BOT_TOKEN")
    return Application.builder().token(token).build()


async def main() -> None:
    application = build_application()
    setup_bot(application)

    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    await application.idle()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
