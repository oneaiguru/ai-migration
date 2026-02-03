#!/usr/bin/env python3
import os
import subprocess
import requests
import json
import time
import logging
import sys
from git import Repo

# Allow running this file directly without package context
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)  # noqa: E402

from config import get_config  # noqa: E402

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("claude_runner.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

# Configuration
config = get_config()
TELEGRAM_TOKEN = config.telegram_token
CHAT_ID = config.chat_id
REPO_PATH = config.repo_path


def send_telegram_message(message):
    """Send a message to Telegram"""
    if not TELEGRAM_TOKEN or not CHAT_ID:
        logger.warning("Telegram configuration not found. Message not sent.")
        return None

    # First, try to escape markdown characters
    try:
        message = escape_markdown(message)
    except Exception as e:
        logger.warning(f"Error escaping markdown: {str(e)}")
        # If escaping fails, try to send without markdown formatting
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
            data = {"chat_id": CHAT_ID, "text": message}
            response = requests.post(url, json=data)
            return response.json()
        except Exception as e2:
            logger.error(f"Error sending plain message: {str(e2)}")
            return None

    # Try to send with markdown formatting
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        data = {"chat_id": CHAT_ID, "text": message, "parse_mode": "MarkdownV2"}
        response = requests.post(url, json=data)
        return response.json()
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return None


def escape_markdown(text):
    """Escape special characters for Markdown V2 format"""
    if not text:
        return ""

    # Characters that need escaping in MarkdownV2
    special_chars = "_*[]()~`>#+-=|{}.!"

    escaped_text = ""
    for char in text:
        if char in special_chars:
            escaped_text += f"\\{char}"
        else:
            escaped_text += char

    return escaped_text


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
        logger.error("Failed to access repository")
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

            # Check if this branch has commits with [PENDING-L4] tag
            for commit in repo.iter_commits(branch_name, max_count=5):
                if "[PENDING-L4]" in commit.message:
                    pending_tasks.append((task_id, branch_name, commit.message))
                    break

        return pending_tasks
    except Exception as e:
        logger.error(f"Error checking for pending tasks: {str(e)}")
        return []


def run_claude_code(command, task_id):
    """Run Claude Code with the given command and return the output"""
    try:
        # Claude Code command
        cmd = f"claude {command}"
        logger.info(f"Running command: {cmd}")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

        if result.returncode != 0:
            logger.error(f"Claude Code command failed: {result.stderr}")
            return f"Error: {result.stderr}"

        return result.stdout
    except Exception as e:
        logger.error(f"Error running Claude Code for task {task_id}: {str(e)}")
        return f"Error: {str(e)}"


def process_pending_task(task_id, branch_name):
    """Process a task that's pending L4 testing"""
    repo = get_repo()
    if not repo:
        return "Error: Could not access Git repository"

    # Store the current branch to return to it later
    try:
        current_branch = repo.active_branch.name
    except Exception as e:
        logger.error(f"Error getting current branch: {str(e)}")
        current_branch = "main"  # Default to main if we can't get current branch

    try:
        # Switch to the branch
        logger.info(f"Checking out branch: {branch_name}")
        repo.git.checkout(branch_name)

        # Run Claude Code to process the task
        command = f'-p "Analyze the code in the current branch for task {task_id}. Run any tests and fix any issues you find."'
        logger.info(f"Running Claude Code for task {task_id}")
        output = run_claude_code(command, task_id)

        if output and "Error:" not in output:
            # Commit any changes made by Claude Code
            try:
                repo.git.add(".")
                if repo.is_dirty():
                    commit_message = (
                        f"[AI-L4] Processed task {task_id}\n\n{output[:200]}"
                    )
                    if len(output) > 200:
                        commit_message += "..."

                    logger.info("Committing changes")
                    repo.git.commit("-m", commit_message)

                    # Push changes
                    try:
                        logger.info("Pushing changes")
                        repo.git.push("origin", branch_name)
                    except Exception as e:
                        logger.error(f"Error pushing changes: {str(e)}")
                        output += (
                            f"\n\nNote: Changes committed but not pushed: {str(e)}"
                        )

                    # Update task status in tasks.json if it exists
                    try:
                        with open("tasks.json", "r") as f:
                            tasks = json.load(f)

                        if task_id in tasks:
                            tasks[task_id]["status"] = "completed"

                            with open("tasks.json", "w") as f:
                                json.dump(tasks, f, indent=2)
                    except FileNotFoundError:
                        logger.warning("tasks.json not found. Status not updated.")
                    except Exception as e:
                        logger.error(f"Error updating task status: {str(e)}")
                else:
                    logger.info("No changes to commit")
            except Exception as e:
                logger.error(f"Error committing changes for task {task_id}: {str(e)}")
                output += f"\n\nError committing changes: {str(e)}"
        else:
            logger.warning(
                f"Claude Code did not produce any output or encountered an error"
            )
    except Exception as e:
        logger.error(f"Error processing task {task_id}: {str(e)}")
        output = f"Error processing task: {str(e)}"
    finally:
        # Go back to original branch
        try:
            logger.info(f"Returning to branch: {current_branch}")
            repo.git.checkout(current_branch)
        except Exception as e:
            logger.error(f"Error returning to original branch: {str(e)}")

    return output


def main():
    """Main function to check and process pending tasks"""
    logger.info("Starting Claude runner...")

    try:
        # Check for pending tasks
        pending_tasks = check_for_pending_tasks()

        if not pending_tasks:
            logger.info("No pending tasks found")
            send_telegram_message("No pending tasks found\\.")
            return

        # Notify about found tasks
        tasks_message = f"Found {len(pending_tasks)} pending tasks\\."
        logger.info(f"Found {len(pending_tasks)} pending tasks")
        send_telegram_message(tasks_message)

        # Process each task
        for task_id, branch_name, commit_message in pending_tasks:
            safe_task_id = escape_markdown(task_id)
            safe_branch_name = escape_markdown(branch_name)

            task_start_message = (
                f"Processing task *{safe_task_id}*\nBranch: `{safe_branch_name}`"
            )
            logger.info(f"Processing task {task_id} on branch {branch_name}")
            send_telegram_message(task_start_message)

            # Process the task
            output = process_pending_task(task_id, branch_name)

            # Send the output
            if output:
                # Truncate long outputs for Telegram
                if len(output) > 3000:
                    output_for_telegram = output[:3000] + "...\n[Output truncated]"
                else:
                    output_for_telegram = output

                # Escape markdown characters
                try:
                    safe_output = escape_markdown(output_for_telegram)
                    result_message = (
                        f"*Task {safe_task_id} Result*\n\n```\n{safe_output}\n```"
                    )
                    send_telegram_message(result_message)
                except Exception as e:
                    logger.error(f"Error formatting output: {str(e)}")
                    # Try without markdown formatting
                    send_telegram_message(
                        f"Task {task_id} Result:\n\n{output_for_telegram}"
                    )

                completion_message = f"*Task {safe_task_id} completed*"
                send_telegram_message(completion_message)
            else:
                error_message = f"Error processing task {safe_task_id}"
                send_telegram_message(error_message)

    except Exception as e:
        logger.error(f"Error in main function: {str(e)}")
        try:
            send_telegram_message(
                f"Claude runner encountered an error: {escape_markdown(str(e))}"
            )
        except:
            send_telegram_message(f"Claude runner encountered an error")


if __name__ == "__main__":
    main()
