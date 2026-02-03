# AI Agent Orchestration Bot

This Telegram bot helps maximize your productivity with OpenAI Codex and Claude Code by:
- Managing task templates
- Generating optimized prompts for Codex (L5)
- Using Claude Code (L4) for testing implementations
- Integrating with Git for task tracking
- Providing mobile-friendly task management

## Features

- **Task Template System**: Pre-built and custom templates for common tasks
- **Prompt Generation**: Creates optimized prompts for Codex with context priming
- **Claude Code Integration**: Automatically tests and improves Codex outputs
- **Git Integration**: Tracks task status and progress through Git branches and commits
- **Mobile Accessibility**: Full task management via Telegram's mobile interface

## Setup

1. **Prerequisites**:
   - Python 3.8+
   - Git
   - Claude Code CLI installed (for L4 operations)
   - Access to OpenAI Codex (L5)

2. **Installation**:
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/ai-agent-orchestration-bot.git
   cd ai-agent-orchestration-bot

   # Create and activate virtual environment (optional but recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration values
   ```

3. **Configuration**:
   - Get a Telegram Bot Token from [@BotFather](https://t.me/BotFather)
   - Add your Telegram user ID to AUTHORIZED_USERS (get it from [@userinfobot](https://t.me/userinfobot))
   - Set your Git repository path

4. **Run the bot**:
   Launch the bot using the installed console script or the unified runner:
   ```bash
   taskflow-bot
   # or
   ./tools/run.sh bot
   ```
   Alternatively, run it as a module:
   ```bash
   python -m bot.bot
   ```

Other maintenance scripts can also be executed. Use the scheduler module
directly or through `run.sh`:

```bash
python -m bot.scheduled_runner
# or once added
./tools/run.sh bot-scheduler
python bot/claude_runner.py
```


If you installed the package, these are also available as CLI commands:

```bash
taskflow-scheduler
taskflow-claude
```

Running the Python files directly requires the repository root on `PYTHONPATH`.


## Usage

1. **Start the bot**:
   - Send `/start` to get an introduction

2. **Create a task**:
   - Send `/templates` to see available templates
   - Send `/create_task template_name` to create a new task
   - Follow the prompts to fill in task parameters
   - Copy the generated prompt into Codex (L5)
   - After implementation, follow the instructions to commit your code

3. **Process tasks with Claude Code**:
   - After pushing your implementation to Git, send `/check_tasks`
   - The bot will use Claude Code (L4) to test and improve your implementation
   - Results will be sent to you via Telegram

4. **Manage templates**:
   - `/template list` - See all templates
   - `/template get name` - View a specific template
   - `/template create` - Create a new template

## Task Workflow

1. **Task Creation**:
   - Choose a template for your task
   - Fill in required parameters
   - Receive an optimized prompt for Codex

2. **Implementation**:
   - Paste the prompt into Codex (L5)
   - Let Codex generate an implementation
   - Make any necessary adjustments

3. **Testing**:
   - Commit the implementation to Git with a `[PENDING-L4]` tag
   - Run `/check_tasks` to process with Claude Code
   - Claude Code will test and improve the implementation

4. **Completion**:
   - Review the final implementation
   - Make any final adjustments
   - Create a pull request or merge the changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.