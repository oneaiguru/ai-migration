# Configuration Reference

TaskFlow uses a single `config` module to read all settings from the
environment. When present, a `.env` file is loaded automatically. Missing
options fall back to sensible defaults so the system can start with minimal
setup. Only `TELEGRAM_TOKEN` is required.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TELEGRAM_TOKEN` | N/A | Telegram bot token used by `bot` components. |
| `AUTHORIZED_USERS` | `` | Comma separated list of Telegram user IDs allowed to interact with the bot. |
| `TELEGRAM_CHAT_ID`/`CHAT_ID` | `` | Optional chat ID for notifications. |
| `REPO_PATH` | `.` | Path to the Git repository used for tasks. |
| `TEMPLATES_FILE` | `templates.json` | File storing message templates. |
| `CLAUDE_CHECK_INTERVAL` | `10` | Minutes between scheduled Claude executions. |
| `WEB_HOST` | `0.0.0.0` | Host for the FastAPI server. |
| `WEB_PORT` | `8000` | Port for the FastAPI server. |
| `WEB_USER` | `admin` | Username for the dashboard. |
| `WEB_PASSWORD` | `password` | Password for the dashboard. |
| `TASKS_FILE` | `tasks.json` | Storage for the task tracker. |
| `GALLERY_FILE` | `templates/gallery.json` | Location of the template gallery. |
| `DB_PATH` | `taskflow.db` | SQLite database file used by the app. |
| `API_KEY` | `` | API key for external services (required in production). |
| `ENV` | `development` | `development` or `production` mode. |

Use `.env.example` as a starting point and adjust values for your environment.
