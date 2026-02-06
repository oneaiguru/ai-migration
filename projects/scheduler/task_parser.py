#!/usr/bin/env python3
"""
Task Parser Module
-----------------
Extracts actionable tasks from various input sources using DeepSeek API.
"""

import os
import json
import uuid
import logging
from typing import List, Dict, Any

from api_client import DeepSeekClient

logger = logging.getLogger("TaskParser")

class TaskParser:
    """
    Parser that extracts structured tasks from various input sources
    using the DeepSeek API for natural language understanding.
    """

    def __init__(self, api_client=None):
        """Initialize the task parser with optional API client."""
        self.api_client = api_client

        # Load prompt templates
        self.prompts = {
            "project": self._load_prompt("project_batching.txt"),
            "transcript": self._load_prompt("transcript_parsing.txt"),
            "bug": self._load_prompt("bug_fix_prioritization.txt"),
            "communication": self._load_prompt("communication_handling.txt")
        }

    def _load_prompt(self, prompt_filename):
        """Load a prompt template from file."""
        prompt_path = os.path.join("prompts", prompt_filename)
        try:
            if os.path.exists(prompt_path):
                with open(prompt_path, 'r') as f:
                    return f.read().strip()
            else:
                logger.warning(f"Prompt template not found: {prompt_path}")
                return ""
        except Exception as e:
            logger.error(f"Failed to load prompt template {prompt_filename}: {e}")
            return ""

    def parse_projects(self, projects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Parse project list into structured tasks.

        Args:
            projects: List of project dictionaries

        Returns:
            List of extracted tasks
        """
        tasks = []

        if not self.api_client:
            logger.warning("No API client provided, using basic parsing")
            # Basic parsing without AI
            for project in projects:
                task_id = f"project_{uuid.uuid4().hex[:8]}"
                tasks.append({
                    "id": task_id,
                    "type": "project_batching",
                    "source": "project_list",
                    "content": project,
                    "priority": project.get("priority", 5),
                    "deadline": project.get("deadline")
                })
            return tasks

        # Use DeepSeek API for intelligent parsing
        try:
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts["project"],
                user_prompt=json.dumps(projects),
                temperature=0.0  # Use low temperature for deterministic results
            )

            extracted_tasks = json.loads(response)
            for task in extracted_tasks:
                task["id"] = f"project_{uuid.uuid4().hex[:8]}"
                task["source"] = "project_list"
                tasks.append(task)

        except Exception as e:
            logger.error(f"Failed to parse projects with API: {e}")
            # Fallback to basic parsing
            for project in projects:
                task_id = f"project_{uuid.uuid4().hex[:8]}"
                tasks.append({
                    "id": task_id,
                    "type": "project_batching",
                    "source": "project_list",
                    "content": project,
                    "priority": project.get("priority", 5),
                    "deadline": project.get("deadline")
                })

        return tasks

    def parse_transcript(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """
        Parse voice transcript into structured tasks.

        Args:
            content: Transcript text content
            filename: Source filename

        Returns:
            List of extracted tasks
        """
        if not self.api_client:
            logger.warning("No API client provided, using basic parsing")
            return [{
                "id": f"transcript_{uuid.uuid4().hex[:8]}",
                "type": "notes_processing",
                "source": filename,
                "content": content,
                "priority": 3
            }]

        try:
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts["transcript"],
                user_prompt=content,
                temperature=0.0
            )

            extracted_tasks = json.loads(response)
            for task in extracted_tasks:
                task["id"] = f"transcript_{uuid.uuid4().hex[:8]}"
                task["source"] = filename

            return extracted_tasks

        except Exception as e:
            logger.error(f"Failed to parse transcript with API: {e}")
            return [{
                "id": f"transcript_{uuid.uuid4().hex[:8]}",
                "type": "notes_processing",
                "source": filename,
                "content": content,
                "priority": 3
            }]

    def parse_bug_report(self, bug: Dict[str, Any], filename: str) -> List[Dict[str, Any]]:
        """
        Parse bug report into structured tasks.

        Args:
            bug: Bug report dictionary
            filename: Source filename

        Returns:
            List of extracted tasks
        """
        if not self.api_client:
            logger.warning("No API client provided, using basic parsing")
            return [{
                "id": f"bug_{uuid.uuid4().hex[:8]}",
                "type": "bug_fix_prioritization",
                "source": filename,
                "content": bug,
                "priority": bug.get("severity", 5),
                "project": bug.get("project")
            }]

        try:
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts["bug"],
                user_prompt=json.dumps(bug),
                temperature=0.0
            )

            extracted_tasks = json.loads(response)
            for task in extracted_tasks:
                task["id"] = f"bug_{uuid.uuid4().hex[:8]}"
                task["source"] = filename

            return extracted_tasks

        except Exception as e:
            logger.error(f"Failed to parse bug report with API: {e}")
            return [{
                "id": f"bug_{uuid.uuid4().hex[:8]}",
                "type": "bug_fix_prioritization",
                "source": filename,
                "content": bug,
                "priority": bug.get("severity", 5),
                "project": bug.get("project")
            }]

    def parse_communication(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """
        Parse communication into structured tasks.

        Args:
            content: Communication text content
            filename: Source filename

        Returns:
            List of extracted tasks
        """
        if not self.api_client:
            logger.warning("No API client provided, using basic parsing")
            return [{
                "id": f"comm_{uuid.uuid4().hex[:8]}",
                "type": "communication_handling",
                "source": filename,
                "content": content,
                "priority": 5
            }]

        try:
            response = self.api_client.call_api(
                "deepseek-reasoner",
                system_prompt=self.prompts["communication"],
                user_prompt=content,
                temperature=0.0
            )

            extracted_tasks = json.loads(response)
            for task in extracted_tasks:
                task["id"] = f"comm_{uuid.uuid4().hex[:8]}"
                task["source"] = filename

            return extracted_tasks

        except Exception as e:
            logger.error(f"Failed to parse communication with API: {e}")
            return [{
                "id": f"comm_{uuid.uuid4().hex[:8]}",
                "type": "communication_handling",
                "source": filename,
                "content": content,
                "priority": 5
            }]