from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.bot import bet_command, info_command, stats_command
from app.tasks import update_bet_results
from app.utils import is_outcome_odd


def update_mock(user_id):
    update = MagicMock()
    update.effective_user.id = user_id
    update.message = MagicMock()
    return update


def context_mock(args=None):
    context = MagicMock()
    context.args = args or []
    context.bot = MagicMock()
    context.bot.send_message = AsyncMock()
    return context


@pytest.mark.asyncio
async def test_bet_command_valid_input():
    user_id = 123
    bet_amount = 5
    bet_choice = "odd"

    with patch("app.bot.create_bet") as mock_create_bet, patch(
        "app.bot.is_too_close_to_draw", return_value=False
    ):
        await bet_command(update_mock(user_id), context_mock([str(bet_amount), bet_choice]))
        mock_create_bet.assert_called_with(user_id, bet_amount, bet_choice)


@pytest.mark.asyncio
async def test_bet_command_invalid_amount():
    user_id = 123
    bet_amount = 11
    bet_choice = "odd"

    with patch("app.bot.get_bet_limits", return_value=(1, 10)), patch(
        "app.bot.create_bet"
    ) as mock_create_bet, patch("app.bot.is_too_close_to_draw", return_value=False):
        await bet_command(update_mock(user_id), context_mock([str(bet_amount), bet_choice]))
        mock_create_bet.assert_not_called()


@pytest.mark.asyncio
async def test_stats_command():
    user_id = 123
    user_stats = {
        "total_bets": 10,
        "wins": 5,
        "losses": 5,
        "total_won": 50,
        "total_lost": 30,
        "balance": 20,
    }

    with patch("app.bot.get_user_stats", return_value=user_stats):
        await stats_command(update_mock(user_id), context_mock())


@pytest.mark.asyncio
async def test_info_command():
    user_id = 123
    game_info = "Welcome to Hash-Loto!"

    with patch("app.bot.get_game_info", return_value=game_info):
        await info_command(update_mock(user_id), context_mock())


def test_update_bet_results():
    latest_hash = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"

    with patch("app.tasks.get_latest_bitcoin_hash", return_value=latest_hash), patch(
        "app.tasks.is_outcome_odd", return_value=True
    ), patch("app.tasks.update_bet_outcome") as mock_update_bet_outcome:
        update_bet_results()
        mock_update_bet_outcome.assert_called_with(True)


def test_is_outcome_odd():
    assert is_outcome_odd("000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f")
    assert not is_outcome_odd("000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26e")
