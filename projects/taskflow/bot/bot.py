import os
import json
import uuid
import datetime
import subprocess
import asyncio
import logging
import re
import sys
from typing import Dict, List, Optional, Any, Union

# Allow running this file directly without package context
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)  # noqa: E402


from src.database import JSONDatabase
from git import Repo
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton


# Local imports must come after sys.path adjustments

from config import Config
# Utilities
from functools import wraps


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("bot.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Bot configuration

# Instantiate Config instead of using ConfigManager to maintain
# compatibility with existing scripts and tests

config = Config()
TELEGRAM_TOKEN = config.telegram_token
AUTHORIZED_USERS = config.authorized_users_list
REPO_PATH = config.repo_path
TEMPLATES_FILE = config.templates_file

# Initialize bot
bot = telebot.TeleBot(TELEGRAM_TOKEN)
# Initialize user data dictionary
bot.user_data = {}


def handle_errors(func):
    """Decorator to log exceptions and notify the user."""

    @wraps(func)
    def wrapper(message):
        try:
            return func(message)
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Error in handler %s", func.__name__)
            try:
                bot.reply_to(
                    message,
                    "An unexpected error occurred. Please try again later.",
                )
            except Exception as send_exc:  # pragma: no cover - best effort
                logger.error("Failed to send error message: %s", send_exc)

    return wrapper


# Helper classes
class Task:
    def __init__(
        self,
        task_id: str,
        template_name: str,
        params: Dict[str, str],
        status: str = "pending",
        created_at: datetime.datetime = None,
    ):
        self.task_id = task_id
        self.template_name = template_name
        self.params = params
        self.status = status
        self.created_at = created_at or datetime.datetime.now()

    def to_dict(self):
        return {
            "task_id": self.task_id,
            "template_name": self.template_name,
            "params": self.params,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            task_id=data["task_id"],
            template_name=data["template_name"],
            params=data["params"],
            status=data["status"],
            created_at=datetime.datetime.fromisoformat(data["created_at"]),
        )


# Task management
tasks = {}  # In-memory storage for tasks
db = JSONDatabase("tasks.json", default={})


def save_tasks():
    """Save tasks to persistent storage."""
    try:
        db.write({task_id: task.to_dict() for task_id, task in tasks.items()})
        return True
    except Exception as e:
        logger.error(f"Error saving tasks: {str(e)}")
        return False


def load_tasks():
    """Load tasks from persistent storage."""
    global tasks
    try:
        tasks_data = db.read()
        tasks = {
            task_id: Task.from_dict(task_data)
            for task_id, task_data in tasks_data.items()
        }
    except Exception as e:
        logger.error(f"Error loading tasks: {str(e)}")
        tasks = {}


# Template management
def get_templates() -> Dict[str, Any]:
    """Load templates from the templates file"""
    try:
        with open(TEMPLATES_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        # Create default templates if file doesn't exist
        default_templates = {
            "react-component": {
                "name": "React Component",
                "description": "Implement a React functional component",
                "prompt": "Create a React functional component named {{componentName}} with the following props:\n\n{{props}}\n\nRequirements:\n{{requirements}}\n\nImplement the component following these guidelines:\n- Use TypeScript with proper type definitions\n- Include proper prop validation\n- Use hooks for state management if needed\n- Add comprehensive JSDoc comments\n- Include a simple test file\n\nMake sure the component is accessible, performant, and follows our project's best practices.",
            },
            "api-endpoint": {
                "name": "API Endpoint",
                "description": "Implement a REST API endpoint",
                "prompt": "Implement a {{method}} endpoint for {{resource}} that handles the following:\n\n{{requirements}}\n\nSpecifications:\n- Path: {{path}}\n- Request format: {{requestFormat}}\n- Response format: {{responseFormat}}\n- Error handling: Implement proper validation and error responses\n- Security: Ensure proper authentication and authorization\n\nImplement this endpoint following RESTful best practices and include appropriate tests.",
            },
            "bug-fix": {
                "name": "Bug Fix",
                "description": "Fix a bug in existing code",
                "prompt": "Fix the following bug in our codebase:\n\nIssue: {{issueDescription}}\n\nReproduction steps:\n{{reproductionSteps}}\n\nExpected behavior: {{expectedBehavior}}\nActual behavior: {{actualBehavior}}\n\nAfter investigating, implement a fix that addresses the root cause while ensuring no regression in existing functionality. Include tests that verify the fix works correctly.",
            },
        }
        try:
            with open(TEMPLATES_FILE, "w") as f:
                json.dump(default_templates, f, indent=2)
            return default_templates
        except Exception as e:
            logger.error(f"Error creating default templates: {str(e)}")
            return {}


def save_template(template_name: str, template_data: Dict[str, Any]):
    """Save a template to the templates file"""
    try:
        templates = get_templates()
        templates[template_name] = template_data
        with open(TEMPLATES_FILE, "w") as f:
            json.dump(templates, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving template: {str(e)}")
        return False


def prepare_template_for_codex(
    template: Dict[str, Any], params: Dict[str, str], task_id: str
) -> str:
    """Fill in template variables with provided parameters"""
    prompt = template["prompt"]

    # Find all variables in the template
    variables = re.findall(r"\{\{([^}]+)\}\}", prompt)

    # Replace variables with values or placeholders
    for var in variables:
        placeholder = f"{{{{{var}}}}}"
        value = params.get(var, f"[MISSING: {var}]")
        prompt = prompt.replace(placeholder, value)

    # Add task ID and metadata
    prompt = f"# Task ID: {task_id}\n# Template: {template['name']}\n\n{prompt}"
    return prompt


def generate_task_id() -> str:
    """Generate a unique task ID"""
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M")
    random_suffix = uuid.uuid4().hex[:4].upper()
    return f"TASK-{timestamp}-{random_suffix}"


def escape_markdown(text):
    """Escape special characters for Markdown V2 format in Telegram"""
    if not text:
        return ""

    # Characters that need escaping in MarkdownV2
    escape_chars = r"_*[]()~`>#+-=|{}.!"
    return re.sub(f"([{re.escape(escape_chars)}])", r"\\\1", text)


# Git integration
def get_repo():
    """Get or initialize a Git repository"""
    try:
        return Repo(REPO_PATH)
    except Exception as e:
        logger.error(f"Error accessing Git repository: {str(e)}")
        try:
            return Repo.init(REPO_PATH)
        except Exception as e2:
            logger.error(f"Error initializing Git repository: {str(e2)}")
            return None


def check_for_pending_tasks():
    """Check for tasks with pending L4 testing"""
    repo = get_repo()
    if not repo:
        return []

    try:
        # Get all branches with 'task/' prefix
        task_branches = [
            ref for ref in repo.refs if ref.name.startswith("refs/heads/task/")
        ]

        pending_tasks = []

        # Check each branch for pending L4 tasks
        for branch in task_branches:
            # Get branch name without refs/heads/
            branch_name = branch.name.replace("refs/heads/", "")
            task_id = branch_name.replace("task/", "")

            # Check the last few commits
            for commit in repo.iter_commits(branch_name, max_count=5):
                if "[PENDING-L4]" in commit.message:
                    pending_tasks.append((task_id, branch_name, commit.message))
                    break

        return pending_tasks
    except Exception as e:
        logger.error(f"Error checking for pending tasks: {str(e)}")
        return []


# Claude Code integration
def run_claude_code(command: str, task_id: str) -> str:
    """Run Claude Code with the given command and return the output"""
    try:
        # Claude Code command
        cmd = f"claude {command}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"Claude Code command failed: {result.stderr}")
            return f"Error: {result.stderr}"

        return result.stdout
    except Exception as e:
        logger.error(f"Error running Claude Code for task {task_id}: {str(e)}")
        return f"Error: {str(e)}"


def process_pending_task(task_id: str, branch_name: str):
    """Process a task that's pending L4 testing"""
    repo = get_repo()
    if not repo:
        return "Error: Could not access Git repository"

    # Store current branch to return to it later
    try:
        current_branch = repo.active_branch.name
    except Exception as e:
        logger.error(f"Error getting current branch: {str(e)}")
        current_branch = "main"  # Default to main if we can't get current branch

    try:
        # Switch to the branch
        repo.git.checkout(branch_name)

        # Run Claude Code to process the task
        command = f'-p "Analyze the code in the current branch for task {task_id}. Run any tests and fix any issues you find."'
        output = run_claude_code(command, task_id)

        if output and not output.startswith("Error:"):
            # Commit any changes made by Claude Code
            try:
                repo.git.add(".")
                if repo.is_dirty():
                    commit_message = (
                        f"[AI-L4] Processed task {task_id}\n\n{output[:200]}"
                    )
                    if len(output) > 200:
                        commit_message += "..."

                    repo.git.commit("-m", commit_message)

                    # Update task status
                    if task_id in tasks:
                        tasks[task_id].status = "completed"
                        save_tasks()
            except Exception as e:
                logger.error(f"Error committing changes for task {task_id}: {str(e)}")

    except Exception as e:
        logger.error(f"Error processing task {task_id}: {str(e)}")
        output = f"Error: {str(e)}"
    finally:
        # Go back to original branch
        try:
            repo.git.checkout(current_branch)
        except Exception as e:
            logger.error(f"Error returning to original branch: {str(e)}")

    return output


# Bot handlers
@bot.message_handler(commands=["start"])
@handle_errors
def start_command(message):
    user_id = str(message.from_user.id)
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        bot.reply_to(message, "Sorry, you are not authorized to use this bot.")
        return

    bot.reply_to(
        message,
        "Welcome to the AI Agent Orchestration Bot!\n\n"
        "This bot helps you manage tasks for OpenAI Codex (L5) and Claude Code (L4).\n\n"
        "Commands:\n"
        "/templates - List available templates\n"
        "/create_task - Create a new task\n"
        "/check_tasks - Check for pending tasks\n"
        "/template - Manage templates\n"
        "/status - Check task status",
    )


@bot.message_handler(commands=["templates"])
@handle_errors
def templates_command(message):
    user_id = str(message.from_user.id)
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        bot.reply_to(message, "Sorry, you are not authorized to use this bot.")
        return

    templates = get_templates()
    if not templates:
        bot.reply_to(message, "Error loading templates. Please check the logs.")
        return

    template_list = "\n\n".join(
        [
            f"*{escape_markdown(name)}*\n{escape_markdown(template['name'])}: {escape_markdown(template['description'])}"
            for name, template in templates.items()
        ]
    )

    bot.reply_to(
        message, f"Available templates:\n\n{template_list}", parse_mode="MarkdownV2"
    )


@bot.message_handler(commands=["create_task"])
@handle_errors
def create_task_command(message):
    user_id = str(message.from_user.id)
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        bot.reply_to(message, "Sorry, you are not authorized to use this bot.")
        return

    args = message.text.split(" ", 1)

    if len(args) < 2:
        # Show available templates
        templates = get_templates()
        if not templates:
            bot.reply_to(message, "Error loading templates. Please check the logs.")
            return

        template_list = "\n".join([f"- {name}" for name in templates.keys()])
        bot.reply_to(
            message,
            f"Available templates:\n{template_list}\n\n"
            f"Usage: /create_task [template_name]",
        )
        return

    template_name = args[1]
    templates = get_templates()

    if template_name not in templates:
        bot.reply_to(message, f"Template '{template_name}' not found.")
        return

    # Start parameter collection process
    template = templates[template_name]

    # Extract parameters from template prompt
    params = re.findall(r"\{\{([^}]+)\}\}", template["prompt"])

    # Store in user session data
    if not hasattr(bot, "user_data"):
        bot.user_data = {}

    task_id = generate_task_id()
    bot.user_data[user_id] = {
        "creating_task": True,
        "task_id": task_id,
        "template_name": template_name,
        "params": params,
        "collected_params": {},
        "current_param_index": 0,
    }

    # Ask for the first parameter
    if params:
        bot.reply_to(
            message,
            f"Creating task {task_id} using template '{escape_markdown(template_name)}'.\n\nPlease provide value for: *{escape_markdown(params[0])}*",
            parse_mode="MarkdownV2",
        )
    else:
        # No parameters to collect
        finalize_task_creation(message, user_id)


@bot.message_handler(
    func=lambda message: str(message.from_user.id) in bot.user_data
    and bot.user_data[str(message.from_user.id)].get("creating_task", False)
)
@handle_errors
def collect_task_params(message):
    user_id = str(message.from_user.id)
    if user_id not in bot.user_data:
        bot.reply_to(message, "Session expired. Please start again with /create_task.")
        return

    user_data = bot.user_data[user_id]

    # Get current parameter
    current_param = user_data["params"][user_data["current_param_index"]]

    # Store the value
    user_data["collected_params"][current_param] = message.text

    # Move to next parameter
    user_data["current_param_index"] += 1

    # Check if we've collected all parameters
    if user_data["current_param_index"] >= len(user_data["params"]):
        finalize_task_creation(message, user_id)
    else:
        # Ask for the next parameter
        next_param = user_data["params"][user_data["current_param_index"]]
        bot.reply_to(
            message,
            f"Please provide value for: *{escape_markdown(next_param)}*",
            parse_mode="MarkdownV2",
        )


def finalize_task_creation(message, user_id):
    if user_id not in bot.user_data:
        bot.reply_to(message, "Session expired. Please start again with /create_task.")
        return

    user_data = bot.user_data[user_id]

    # Generate the task
    task_id = user_data["task_id"]
    template_name = user_data["template_name"]
    collected_params = user_data["collected_params"]

    # Create a task object
    task = Task(task_id, template_name, collected_params)
    tasks[task_id] = task
    success = save_tasks()
    if not success:
        bot.reply_to(
            message,
            "Warning: Failed to save task data. The task will be created but may not persist if the bot restarts.",
        )

    # Create Git branch name (but don't create it yet)
    branch_name = f"task/{task_id}"

    # Generate final prompt
    templates = get_templates()
    template = templates[template_name]
    final_prompt = prepare_template_for_codex(template, collected_params, task_id)

    # Send the prompt to the user - SPLIT INTO SMALLER CHUNKS IF NEEDED
    try:
        if len(final_prompt) > 4000:
            # Split into multiple messages for easier copying
            chunks = [
                final_prompt[i : i + 4000] for i in range(0, len(final_prompt), 4000)
            ]

            # First message doesn't need escaped markdown for code blocks
            bot.send_message(
                message.chat.id,
                f"*{escape_markdown('Task ' + task_id + ' created')}*\n\n"
                f"Branch to create: `{escape_markdown(branch_name)}`\n\n"
                f"Prompt is split into {len(chunks)} messages for easier copying into Codex:",
                parse_mode="MarkdownV2",
            )

            for i, chunk in enumerate(chunks):
                # Use code blocks but without markdown parsing to avoid escaping issues
                bot.send_message(
                    message.chat.id,
                    f"*Part {i+1}/{len(chunks)}*\n\n" f"```\n{chunk}\n```",
                    parse_mode="Markdown",
                )
        else:
            bot.send_message(
                message.chat.id,
                f"*{escape_markdown('Task ' + task_id + ' created')}*\n\n"
                f"Branch to create: `{escape_markdown(branch_name)}`\n\n"
                f"Copy this prompt into Codex:\n\n"
                f"```\n{final_prompt}\n```",
                parse_mode="Markdown",
            )

        # Send follow-up instructions - UPDATED FOR MANUAL WORKFLOW
        instruction_text = (
            "After implementing in Codex:\n\n"
            "1. Manually create a branch: `git checkout -b " + branch_name + "`\n"
            "2. Save Codex's output to appropriate file(s)\n"
            '3. Commit your changes: `git commit -m "[PENDING-L4] Task '
            + task_id
            + ' ready for testing"`\n'
            "4. Push the branch: `git push origin " + branch_name + "`\n"
            "5. Use /check_tasks to process with Claude Code"
        )

        bot.send_message(message.chat.id, instruction_text)
    except Exception as e:
        logger.error(f"Error sending task messages: {str(e)}")
        bot.send_message(message.chat.id, f"Error creating task: {str(e)}")

    # Clear user data
    if user_id in bot.user_data:
        bot.user_data.pop(user_id)


@bot.message_handler(commands=["check_tasks"])
@handle_errors
def check_tasks_command(message):
    user_id = str(message.from_user.id)
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        bot.reply_to(message, "Sorry, you are not authorized to use this bot.")
        return

    bot.reply_to(message, "Checking for pending tasks...")

    pending_tasks = check_for_pending_tasks()

    if not pending_tasks:
        bot.send_message(message.chat.id, "No pending tasks found.")
        return

    for task_id, branch_name, commit_message in pending_tasks:
        try:
            # Don't use markdown parsing for commit message to avoid escaping issues
            bot.send_message(
                message.chat.id,
                f"*Processing task {escape_markdown(task_id)}*\n\n"
                f"Branch: `{escape_markdown(branch_name)}`",
                parse_mode="MarkdownV2",
            )

            # Send commit message separately without markdown parsing
            bot.send_message(
                message.chat.id,
                f"Commit: \n```\n{commit_message[:200]}\n```",
                parse_mode="Markdown",
            )

            # Process the task
            output = process_pending_task(task_id, branch_name)

            # Send the output
            if output:
                # Truncate long outputs
                if len(output) > 3000:
                    output = output[:3000] + "...\n[Output truncated]"

                # Send without markdown parsing to avoid escaping issues
                bot.send_message(
                    message.chat.id,
                    f"*Task {escape_markdown(task_id)} Result*\n\n",
                    parse_mode="MarkdownV2",
                )

                bot.send_message(
                    message.chat.id, f"```\n{output}\n```", parse_mode="Markdown"
                )

                bot.send_message(
                    message.chat.id,
                    f"*Task {escape_markdown(task_id)} completed*",
                    parse_mode="MarkdownV2",
                )
            else:
                bot.send_message(
                    message.chat.id,
                    f"Error processing task {escape_markdown(task_id)}",
                    parse_mode="MarkdownV2",
                )
        except Exception as e:
            logger.error(f"Error in task processing: {str(e)}")
            bot.send_message(
                message.chat.id, f"Error processing task {task_id}: {str(e)}"
            )


@bot.message_handler(commands=["template"])
@handle_errors
def template_command(message):
    user_id = str(message.from_user.id)
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        bot.reply_to(message, "Sorry, you are not authorized to use this bot.")
        return

    args = message.text.split(" ", 2)

    if len(args) < 2:
        bot.reply_to(
            message,
            "Usage:\n/template list\n/template get [name]\n/template create [name]",
        )
        return

    action = args[1]

    if action == "list":
        templates = get_templates()
        if not templates:
            bot.reply_to(message, "Error loading templates.")
            return

        template_list = "\n".join([f"- {name}" for name in templates.keys()])
        bot.reply_to(message, f"Available templates:\n{template_list}")

    elif action == "get" and len(args) >= 3:
        template_name = args[2]
        templates = get_templates()

        if template_name in templates:
            template = templates[template_name]
            template_text = json.dumps(template, indent=2)
            bot.reply_to(
                message,
                f"Template '{template_name}':\n\n```\n{template_text}\n```",
                parse_mode="Markdown",
            )
        else:
            bot.reply_to(message, f"Template '{template_name}' not found.")

    elif action == "create":
        # Start template creation process
        if not hasattr(bot, "user_data"):
            bot.user_data = {}

        bot.user_data[user_id] = {"creating_template": True, "step": "name"}

        bot.reply_to(
            message,
            "Let's create a new template.\n\nPlease enter the template name (e.g., 'react-component'):",
        )

    else:
        bot.reply_to(
            message,
            "Usage:\n/template list\n/template get [name]\n/template create [name]",
        )


@bot.message_handler(
    func=lambda message: str(message.from_user.id) in bot.user_data
    and bot.user_data[str(message.from_user.id)].get("creating_template", False)
)
@handle_errors
def collect_template_info(message):
    user_id = str(message.from_user.id)
    if user_id not in bot.user_data:
        bot.reply_to(
            message, "Session expired. Please start again with /template create."
        )
        return

    user_data = bot.user_data[user_id]

    if user_data["step"] == "name":
        user_data["template_name"] = message.text
        user_data["step"] = "display_name"
        bot.reply_to(
            message,
            "Please enter the display name for this template (e.g., 'React Component'):",
        )

    elif user_data["step"] == "display_name":
        user_data["display_name"] = message.text
        user_data["step"] = "description"
        bot.reply_to(message, "Please enter a brief description for this template:")

    elif user_data["step"] == "description":
        user_data["description"] = message.text
        user_data["step"] = "prompt"
        bot.reply_to(
            message,
            "Please enter the prompt template. Use {{variable}} for parameters.\n\n"
            "Example: Create a React component named {{componentName}} with {{props}} props.",
        )

    elif user_data["step"] == "prompt":
        user_data["prompt"] = message.text

        # Create and save the template
        template_data = {
            "name": user_data["display_name"],
            "description": user_data["description"],
            "prompt": user_data["prompt"],
        }

        success = save_template(user_data["template_name"], template_data)
        if success:
            bot.reply_to(
                message,
                f"Template '{user_data['template_name']}' created successfully!",
            )
        else:
            bot.reply_to(
                message,
                f"Error saving template '{user_data['template_name']}'. Please check the logs.",
            )

        # Clear user data
        if user_id in bot.user_data:
            bot.user_data.pop(user_id)


@bot.message_handler(commands=["status"])
@handle_errors
def status_command(message):
    user_id = str(message.from_user.id)
    if AUTHORIZED_USERS and user_id not in AUTHORIZED_USERS:
        bot.reply_to(message, "Sorry, you are not authorized to use this bot.")
        return

    if not tasks:
        bot.reply_to(message, "No tasks have been created yet.")
        return

    # Sort tasks by creation date (newest first)
    sorted_tasks = sorted(tasks.values(), key=lambda t: t.created_at, reverse=True)

    # Show the 5 most recent tasks
    recent_tasks = sorted_tasks[:5]

    status_text = "*Recent Tasks:*\n\n"
    for task in recent_tasks:
        task_id_escaped = escape_markdown(task.task_id)
        template_name_escaped = escape_markdown(task.template_name)
        status_escaped = escape_markdown(task.status)
        created_at_escaped = escape_markdown(task.created_at.strftime("%Y-%m-%d %H:%M"))

        status_text += f"*{task_id_escaped}*\n"
        status_text += f"Template: {template_name_escaped}\n"
        status_text += f"Status: {status_escaped}\n"
        status_text += f"Created: {created_at_escaped}\n\n"

    bot.reply_to(message, status_text, parse_mode="MarkdownV2")


# Main function
def main():
    """Main function to start the bot"""
    # Load existing tasks
    load_tasks()

    # Start the bot
    logger.info("Starting the bot...")
    try:
        bot.polling(none_stop=True)
    except Exception as e:
        logger.error(f"Bot polling error: {str(e)}")


if __name__ == "__main__":
    main()
