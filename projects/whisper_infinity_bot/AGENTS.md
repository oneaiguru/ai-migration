# Whisper Infinity Bot

## Summary
- Telegram bot for teacher onboarding, course registration/approval, and payment tracking with admin/superadmin workflows.
- Uses python-telegram-bot (async) and SQLite for state; tables are created on first run via `database.initialize_database()`.

## Setup & Run
1. Python 3.10+ recommended; create/activate a venv (`python -m venv .venv && source .venv/bin/activate`).
2. Install deps: `pip install python-telegram-bot nest-asyncio bcrypt` (plus standard library).
3. Configure `config.json`: set `telegram_bot_token` and adjust `database_file`/`log_file` if needed (defaults create `database.db` locally).
4. (Optional) Pre-create tables: `python database.py`.
5. Start the bot: `python bot.py`.

## Tests
- No automated tests in this import; validate by running the bot in a Telegram sandbox.

## Notes
- `.gitignore` excludes venvs, SQLite DB/logs, and archives; `config.json` ships with a placeholder token—set your real token locally before running.
- See `TODO.md` for follow-ups (keep vs. reference upstream and token reminder).
- `/addadmin` requires a logged-in SuperAdmin and expects: `/addadmin <admin_code> <admin_name> <role> <admin_chat_id>`.
- Admin chat IDs are captured automatically when an admin logs in; have existing admins log in once to backfill their chat IDs for notifications.
Monorepo note: /Users/m/ai is a multi-project monorepo. See the root README for details.
