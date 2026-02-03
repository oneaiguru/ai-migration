"""Utility module for executing tasks using AI model CLIs."""

from dataclasses import dataclass
from typing import Dict, Optional
import subprocess
import logging
import time


@dataclass
class Task:
    """Represents a task to be executed by an AI model."""

    task_id: str
    prompt_file: str
    output_file: Optional[str] = None
    model: str = "claude"
    status: str = "pending"
    result: Optional[str] = None
    attempts: int = 0
    error: Optional[str] = None


@dataclass
class ExecutionResult:
    """Holds the result of an execution attempt."""

    success: bool
    output: str
    attempts: int
    error: Optional[str] = None


class TaskExecutor:
    """Manage execution of tasks through AI model CLIs."""

    def __init__(
        self,
        max_retries: int = 3,
        retry_delay: float = 2.0,
        log_file: str = "task_executor.log",
    ):
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.tasks: Dict[str, Task] = {}
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(),
            ],
        )
        self.logger = logging.getLogger(__name__)

    def add_task(self, task: Task) -> None:
        """Add a task to the executor."""
        self.tasks[task.task_id] = task
        self.logger.info("Added task %s", task.task_id)

    def _run_model(self, model: str, prompt_file: str) -> subprocess.CompletedProcess:
        """Run the given model CLI with the prompt file."""
        if model.lower() == "claude":
            cmd = ["claude", "-p", prompt_file]
        else:
            # Generic CLI. Assumes the model command accepts '-p <prompt>' pattern
            cmd = [model, "-p", prompt_file]
        self.logger.debug("Running command: %s", " ".join(cmd))
        return subprocess.run(cmd, capture_output=True, text=True)

    def execute_task(self, task_id: str) -> ExecutionResult:
        """Execute a task by ID with retry logic."""
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        task.status = "running"
        self.logger.info("Executing task %s using model %s", task.task_id, task.model)

        attempts = 0
        last_error = None
        output = ""
        while attempts < self.max_retries:
            attempts += 1
            task.attempts = attempts
            result = self._run_model(task.model, task.prompt_file)
            output = result.stdout
            if result.returncode == 0:
                task.status = "completed"
                task.result = output
                if task.output_file:
                    try:
                        with open(task.output_file, "w") as f:
                            f.write(output)
                    except Exception as e:
                        self.logger.error("Failed to write output file: %s", e)
                self.logger.info("Task %s completed successfully", task.task_id)
                return ExecutionResult(True, output, attempts)
            else:
                last_error = result.stderr.strip() or "Unknown error"
                task.error = last_error
                self.logger.error(
                    "Task %s failed on attempt %s: %s",
                    task.task_id,
                    attempts,
                    last_error,
                )
                if attempts < self.max_retries:
                    time.sleep(self.retry_delay)

        task.status = "failed"
        task.result = output
        self.logger.error("Task %s failed after %s attempts", task.task_id, attempts)
        return ExecutionResult(False, output, attempts, error=last_error)


__all__ = ["Task", "ExecutionResult", "TaskExecutor"]
