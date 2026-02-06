# Sherlock AI Detective Bot
- What: Async Telegram bot for interactive detective stories (aiogram 3 + SQLAlchemy/SQLite) with branching story engine and security middleware.
- Python: use 3.10+ (aiogram typing is flaky on 3.9.1).
- Run bot: set `TELEGRAM_TOKEN` (and optional `DATABASE_URL`) then `python main.py`.
- Seed stories/local DB: `python scripts/init_db.py` (defaults to SQLite file `/app/data/sherlock.db`; override `DATABASE_URL` if running outside the container volume).
- Tests: `pytest`; BDD: `behave`.
- Docs: core guides in `docs/`, full specs/operational playbooks in `docs/final/`, deployment notes in `DEPLOYMENT.md` and `docker-compose.yml`.
