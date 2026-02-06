#!/usr/bin/env python3
"""
Task Processors Module
---------------------
Collection of task processors for different types of automation tasks.
"""

import json
import logging
import os
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod

logger = logging.getLogger("TaskProcessors")

class BaseProcessor(ABC):
    """Abstract base class for all task processors."""

    def __init__(self, api_client, config: Dict[str, Any]):
        """
        Initialize with API client and config.

        Args:
            api_client: DeepSeek API client
            config: Configuration dictionary
        """
        self.api_client = api_client
        self.config = config
        self.prompts = self._load_prompts()

    def _load_prompts(self) -> Dict[str, str]:
        """Load prompt templates for this processor."""
        prompt_templates = self.config.get("prompt_templates", {})
        prompts = {}

        for key, filename in prompt_templates.items():
            if isinstance(filename, str) and filename.startswith("See "):
                prompt_path = os.path.join("prompts", filename[4:])
                try:
                    if os.path.exists(prompt_path):
                        with open(prompt_path, 'r') as f:
                            prompts[key] = f.read().strip()
                    else:
                        logger.warning(f"Prompt template not found: {prompt_path}")
                        prompts[key] = ""
                except Exception as e:
                    logger.error(f"Failed to load prompt template {filename}: {e}")
                    prompts[key] = ""
            else:
                prompts[key] = str(filename)

        return prompts

    @abstractmethod
    def process(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a list of tasks.

        Args:
            tasks: List of task dictionaries

        Returns:
            Processed task list
        """
        pass

    @abstractmethod
    def execute(self, task: Dict[str, Any]) -> Any:
        """
        Execute a single task.

        Args:
            task: Task dictionary

        Returns:
            Execution result
        """
        pass


class ProjectBatcher(BaseProcessor):
    """Processor for batching related project tasks together."""

    def process(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process project tasks by grouping and prioritizing them."""
        if not tasks:
            return []

        # Group tasks by project
        projects = {}
        for task in tasks:
            project_id = task.get("project", "unknown")
            if project_id not in projects:
                projects[project_id] = []
            projects[project_id].append(task)

        # Process each project's tasks
        processed_tasks = []
        for project_id, project_tasks in projects.items():
            # Sort tasks by priority (descending)
            project_tasks.sort(key=lambda t: t.get("priority", 0), reverse=True)

            # Use API to optimize task batching if available
            if self.api_client and len(project_tasks) > 1:
                try:
                    response = self.api_client.call_api(
                        "deepseek-reasoner",
                        system_prompt=self.prompts.get("project_batching", ""),
                        user_prompt=json.dumps(project_tasks),
                        temperature=0.0
                    )

                    optimized_tasks = json.loads(response)
                    processed_tasks.extend(optimized_tasks)

                except Exception as e:
                    logger.error(f"Failed to optimize project tasks with API: {e}")
                    processed_tasks.extend(project_tasks)
            else:
                processed_tasks.extend(project_tasks)

        return processed_tasks

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a project task by generating an action plan."""
        if not self.api_client:
            return {
                "status": "failed",
                "reason": "No API client available"
            }

        try:
            # Generate detailed action plan
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts.get("project_execution", ""),
                user_prompt=json.dumps(task),
                temperature=0.2
            )

            return {
                "status": "completed",
                "action_plan": json.loads(response)
            }

        except Exception as e:
            logger.error(f"Failed to execute project task: {e}")
            return {
                "status": "failed",
                "reason": str(e)
            }


class ProposalGenerator(BaseProcessor):
    """Processor for generating client proposals."""

    def process(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process proposal tasks by enriching with additional context."""
        if not tasks:
            return []

        enriched_tasks = []
        for task in tasks:
            # Add proposal template selection
            if "template" not in task:
                task["template"] = "standard"  # Default template

            # Set reasonable deadline if not present
            if "deadline" not in task:
                # Set deadline to 2 days from now
                from datetime import datetime, timedelta
                deadline = datetime.utcnow() + timedelta(days=2)
                task["deadline"] = deadline.isoformat()

            enriched_tasks.append(task)

        return enriched_tasks

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a proposal task by generating a client proposal."""
        if not self.api_client:
            return {
                "status": "failed",
                "reason": "No API client available"
            }

        try:
            # Generate proposal
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts.get("proposal_generation", ""),
                user_prompt=json.dumps(task),
                temperature=0.3
            )

            return {
                "status": "completed",
                "proposal": json.loads(response)
            }

        except Exception as e:
            logger.error(f"Failed to generate proposal: {e}")
            return {
                "status": "failed",
                "reason": str(e)
            }


class BugFixPrioritizer(BaseProcessor):
    """Processor for prioritizing and suggesting fixes for bugs."""

    def process(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process bug tasks by analyzing and prioritizing them."""
        if not tasks:
            return []

        # Group bugs by project
        projects = {}
        for task in tasks:
            project_id = task.get("project", "unknown")
            if project_id not in projects:
                projects[project_id] = []
            projects[project_id].append(task)

        prioritized_tasks = []
        for project_id, project_bugs in projects.items():
            # Sort by severity within each project
            project_bugs.sort(key=lambda t: t.get("severity", 0), reverse=True)

            # Add relative priority and estimated difficulty
            for i, bug in enumerate(project_bugs):
                bug["relative_priority"] = i + 1

                # Estimate fix difficulty if not present
                if "difficulty" not in bug and self.api_client:
                    try:
                        response = self.api_client.call_api(
                            "deepseek-reasoner",
                            system_prompt="Analyze this bug report and estimate its fix difficulty on a scale of 1-10.",
                            user_prompt=json.dumps(bug),
                            temperature=0.0
                        )

                        difficulty = int(float(response.strip()))
                        bug["difficulty"] = max(1, min(10, difficulty))  # Ensure in range 1-10

                    except Exception as e:
                        logger.warning(f"Failed to estimate bug difficulty: {e}")
                        bug["difficulty"] = 5  # Default medium difficulty

            prioritized_tasks.extend(project_bugs)

        return prioritized_tasks

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a bug fix task by suggesting a solution approach."""
        if not self.api_client:
            return {
                "status": "failed",
                "reason": "No API client available"
            }

        try:
            # Generate fix approach
            model = "deepseek-reasoner" if task.get("difficulty", 5) >= 7 else "deepseek-chat"
            response = self.api_client.call_api(
                model,
                system_prompt=self.prompts.get("bug_fix_prioritization", ""),
                user_prompt=json.dumps(task),
                temperature=0.1
            )

            return {
                "status": "completed",
                "fix_approach": json.loads(response)
            }

        except Exception as e:
            logger.error(f"Failed to generate bug fix approach: {e}")
            return {
                "status": "failed",
                "reason": str(e)
            }


class CommunicationHandler(BaseProcessor):
    """Processor for handling communications and generating responses."""

    def process(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process communication tasks by analyzing and categorizing them."""
        if not tasks:
            return []

        processed_tasks = []
        for task in tasks:
            # Analyze sentiment and urgency if not present
            if "sentiment" not in task or "urgency" not in task:
                if self.api_client:
                    try:
                        response = self.api_client.call_api(
                            "deepseek-reasoner",
                            system_prompt="Analyze this communication and return a JSON with 'sentiment' (positive/neutral/negative) and 'urgency' (1-10).",
                            user_prompt=task.get("content", ""),
                            temperature=0.0
                        )

                        analysis = json.loads(response)
                        task["sentiment"] = analysis.get("sentiment", "neutral")
                        task["urgency"] = analysis.get("urgency", 5)

                    except Exception as e:
                        logger.warning(f"Failed to analyze communication: {e}")
                        task["sentiment"] = "neutral"
                        task["urgency"] = 5
                else:
                    task["sentiment"] = "neutral"
                    task["urgency"] = 5

            # Set priority based on urgency if not present
            if "priority" not in task and "urgency" in task:
                task["priority"] = task["urgency"]

            processed_tasks.append(task)

        # Sort by priority (urgency)
        processed_tasks.sort(key=lambda t: t.get("priority", 0), reverse=True)
        return processed_tasks

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a communication task by generating a response."""
        if not self.api_client:
            return {
                "status": "failed",
                "reason": "No API client available"
            }

        try:
            # Choose model based on complexity
            sentiment = task.get("sentiment", "neutral")
            urgency = task.get("urgency", 5)

            # Use reasoning model for negative or high urgency communication
            model = "deepseek-reasoner" if sentiment == "negative" or urgency >= 8 else "deepseek-chat"

            # Generate response
            response = self.api_client.call_api(
                model,
                system_prompt=self.prompts.get("communication_handling", ""),
                user_prompt=json.dumps(task),
                temperature=0.7  # Higher temperature for more natural responses
            )

            return {
                "status": "completed",
                "response": json.loads(response)
            }

        except Exception as e:
            logger.error(f"Failed to generate communication response: {e}")
            return {
                "status": "failed",
                "reason": str(e)
            }


class NotesProcessor(BaseProcessor):
    """Processor for extracting insights and tasks from notes and transcripts."""

    def process(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process notes tasks by analyzing and enriching them."""
        if not tasks:
            return []

        processed_tasks = []
        for task in tasks:
            # Set lower priority by default for notes processing
            if "priority" not in task:
                task["priority"] = 3

            # Mark as suitable for off-peak processing
            task["reasoning_intensive"] = True
            processed_tasks.append(task)

        return processed_tasks

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a notes processing task by extracting insights and action items."""
        if not self.api_client:
            return {
                "status": "failed",
                "reason": "No API client available"
            }

        try:
            # Extract insights and action items
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts.get("notes_processing", ""),
                user_prompt=task.get("content", ""),
                temperature=0.2
            )

            return {
                "status": "completed",
                "processed_content": json.loads(response)
            }

        except Exception as e:
            logger.error(f"Failed to process notes: {e}")
            return {
                "status": "failed",
                "reason": str(e)
            }