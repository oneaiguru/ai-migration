# TaskFlow.ai

**TaskFlow.ai** is an agent orchestration platform that helps developers maximize the effectiveness of AI coding tools like OpenAI's Codex and Anthropic's Claude Code.

## Core Features

- **Resource Optimization**: Maximize your 60 tasks/hour Codex limit
- **Mobile-Desktop Bridge**: Prepare tasks on mobile, execute on desktop
- **Context Management**: Preserve knowledge across different environments
- **Task Templates**: Pre-optimized prompts for common development tasks
- **Template Gallery & Discovery**: Browse, categorize, search, and preview versioned templates
- **Telegram Bot Integration**: Manage tasks directly through Telegram
- **Offline Mobile Form**: Create tasks via a mobile-friendly web form

## Repository Structure

This monorepo contains:

- **core/**: Core TaskFlow.ai functionality using the 3-folder structure
  - **ai-docs/**: Persistent knowledge repository
    - **architecture/**: System architecture docs
    - **patterns/**: Reusable coding patterns and guidelines
    - **agents/**: Guidance for L4 and L5 AI agents
  - **specs/**: Work specifications and plans
  - **.claude/**: Reusable prompts and commands
- **tools/**: Shell scripts for task preparation and execution
- **bot/**: Telegram bot for mobile-friendly task management
- **mobile-form/**: Offline web form for task creation

## Components

- **CLI (`cli/`)**: Command-line interface for creating and executing tasks
- **Bot (`bot/`)**: Telegram bot for chat-based task management
- **Mobile Form (`mobile-form/`)**: Offline HTML form for preparing tasks on mobile
- **Dashboard (`dashboard/`)**: Local dashboard for browsing tasks
- **Web Server (`web/` and `webui/`)**: FastAPI server and results viewer
- **Models (`src/models/`)**: Pydantic schemas like `TaskCreate` for API payloads

## Installation

### Prerequisites

- Git for synchronization
- Access to ChatGPT with Codex (Code Interpreter)
- Access to Claude Code (for desktop execution)
- Python 3.8+ (for the bot)
- Telegram account (for the bot interface)

### Setup

1. Clone this repository:
```bash
git clone https://github.com/granin/taskflow-ai.git
cd taskflow-ai
```

2. *(Optional)* create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate
```

3. Install the package in editable mode (add `.[dev]` for development):
```bash
pip install -e .[dev]
```

4. Run the setup script to configure Git hooks and folders:
```bash
python scripts/setup.py
```

5. Copy the example environment file:
```bash
cp .env.example .env
# edit .env with your values
```

6. Sync tasks between devices:
```bash
git add .
git commit -m "Prepare task XYZ"
git push
# On the other device
git pull
```


### Bot Setup (Optional)

1. Install the package:
   ```bash
   pip install .
   ```

2. Set up environment variables:
   ```bash
   cp bot/.env.example bot/.env
   # Edit .env with your configuration values
   ```

3. Get a Telegram Bot Token from [@BotFather](https://t.me/BotFather)

4. Run the bot:
   ```bash
   taskflow-bot
   ```

5. Run the scheduler:
   ```bash
   taskflow-scheduler
   ```

## Configuration

All TaskFlow components use environment variables for customization. Values are
loaded from a `.env` file when present and fall back to the operating system
environment. The :mod:`config` module exposes these settings so every
component can access them consistently. See
[docs/configuration.md](docs/configuration.md) for a complete list of
variables and their defaults.

- `TELEGRAM_TOKEN` - Telegram bot token.
- `AUTHORIZED_USERS` - comma separated list of authorized user IDs.
- `CHAT_ID` - optional chat ID for notifications.
- `REPO_PATH` - path to the git repository (default `.`).
- `TEMPLATES_FILE` - template storage file.
- `CLAUDE_CHECK_INTERVAL` - minutes between Claude runs.
- `WEB_HOST` - host for the FastAPI server (default `0.0.0.0`).
- `WEB_PORT` - port for the FastAPI server (default `8000`).
- `WEB_USER` and `WEB_PASSWORD` - credentials for the web server.
- `TASKS_FILE` - JSON file used by the task tracker.
- `GALLERY_FILE` - path to the template gallery file.
- `DB_PATH` - SQLite database file used by the app.
- `API_KEY` - API key for external integrations.
- `ENV` - `development` or `production` mode.

Copy `.env.example` to `.env` and modify the values to suit your setup.

### Docker

This repository includes a multi-stage `Dockerfile` and a compose file for
development. See [docs/docker.md](docs/docker.md) for build and runtime
instructions.

## Usage

### Mobile Workflow

1. **Prepare tasks on mobile** using the offline form or the task script:
```bash
./tools/prepare-task.sh "Task Title" task-id
git add .
git commit -m "Prepare task task-id"
git push
```

1. Pull the latest tasks and execute them:
```bash
git pull
./tools/execute-task.sh task-id
```
2. You can also use the CLI:
```bash
./tools/run.sh cli execute task-id
```


The CLI creates Git branches and commits task files automatically.


### Bot Workflow
See [docs/telegram-bot.md](docs/telegram-bot.md) for a full command reference.

1. **Start the bot**:
   - Send `/start` to get an introduction

2. **Create a task**:
   - Send `/templates` to see available templates
   - Send `/create_task template_name` to create a new task
   - Follow the prompts to fill in task parameters
   - Copy the generated prompt into Codex (L5)

3. **Process tasks with Claude Code**:
   - After pushing your implementation to Git, send `/check_tasks`
   - The bot will use Claude Code (L4) to test and improve your implementation
## Testing

Run the following checks before opening a pull request:

```bash
flake8 bot/
bash -n tools/*.sh
pytest
```
All tests and linters should pass.
## Example Workflow

1. Create a task on mobile using the form or bot and commit with `[PENDING-L4]`.
2. Push the branch and pull it on your desktop.
3. Run `./tools/execute-task.sh task-id` or `./tools/run.sh cli execute task-id`.
4. Push results and open a pull request for review.
5. See [docs/workflow-example.md](docs/workflow-example.md) for a complete walkthrough.
6. For a detailed end-to-end guide see [docs/end-to-end-workflow.md](docs/end-to-end-workflow.md).



## Simple Dashboard

The repository includes a lightweight web dashboard for managing tasks locally.
Open `dashboard/index.html` in your browser to view task statistics, create new
tasks and manage simple templates. Task information is stored in the browser's
`localStorage`, so no additional setup is required.

## Core Concepts

### The 3-Folder Structure

TaskFlow.ai organizes knowledge in three key folders:

1. **ai-docs**: Persistent knowledge repository
   - Architectural documentation
   - Code patterns and standards
   - System specifications
   - Agent guidance

2. **specs**: Work specifications and plans
   - Task specifications
   - Feature requirements
   - Templates for specifications

3. **.claude**: Reusable prompts and commands
   - Context initialization commands
   - Task-specific templates
   - Workflow sequences

### The Mobile-Desktop Bridge

TaskFlow.ai solves a key challenge: Codex works great on mobile, but Claude Code requires desktop access.

1. **Mobile Workflow**: Prepare tasks using templates and specifications
2. **Synchronization**: Use Git to transfer context between devices
3. **Desktop Execution**: Run tasks requiring Claude Code on desktop
4. **Results**: Synchronize results back to mobile
5. **Review**: Open the web-based Results Viewer to inspect outputs

### Results Viewer Web UI

Run `./tools/run.sh webui` and open http://localhost:8000 to browse task outputs.
### FastAPI Web Server

Run `pip install .` and `./tools/run.sh server` to start the server.
The API documentation is available at http://localhost:8000/docs once running.
Authentication uses HTTP Basic with credentials set via `WEB_USER` and `WEB_PASSWORD` environment variables.


### Template Gallery UI

Start `./tools/run.sh server` and navigate to `http://localhost:5000/templates` to browse templates.
The gallery supports category filters and free text search. Templates can be imported by sending a JSON payload to `/api/templates` and exported via `/api/templates/export`.
See [docs/template-gallery.md](docs/template-gallery.md) for more details.

## Troubleshooting

- **Setup script fails**: Ensure `git`, `python3`, and `pip` are installed and available in your `PATH`.
- **Bot cannot start**: Verify `TELEGRAM_TOKEN` and `AUTHORIZED_USERS` are set correctly in your `.env` file.
- **Web server not accessible**: Check `WEB_HOST` and `WEB_PORT` values and confirm the port is free.
- **Tests fail**: Run `pip install .[dev]` to install missing dependencies.
- **Module import errors** – Ensure you run tools via `taskflow-cli`, `taskflow-bot`, or `./tools/run.sh`. If executing a script directly, prepend the repo root to `PYTHONPATH` (e.g., `export PYTHONPATH=$(pwd):$PYTHONPATH`).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Testing

See [docs/testing.md](docs/testing.md) for instructions on running the test suite and continuous integration.
