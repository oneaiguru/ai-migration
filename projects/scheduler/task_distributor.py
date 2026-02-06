#!/usr/bin/env python3
"""
Task Distributor Module
----------------------
Organizes and distributes tasks to the appropriate processors.
"""

import logging
from typing import List, Dict, Any
from collections import defaultdict

logger = logging.getLogger("TaskDistributor")

class TaskDistributor:
    """
    Distributes tasks to appropriate processors based on their type and characteristics.
    """
    
    def __init__(self, rules_file=None):
        """
        Initialize the task distributor with optional distribution rules.
        
        Args:
            rules_file: Path to JSON file containing distribution rules
        """
        self.task_types = {
            "project_batching": self._is_project_task,
            "proposal_generation": self._is_proposal_task,
            "bug_fix_prioritization": self._is_bug_task,
            "communication_handling": self._is_communication_task,
            "notes_processing": self._is_notes_task
        }
        
    def distribute(self, tasks: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Distribute tasks to appropriate processors.
        
        Args:
            tasks: List of task dictionaries
            
        Returns:
            Dictionary mapping task types to lists of tasks
        """
        distributed = defaultdict(list)
        
        for task in tasks:
            # If task already has a type defined, use that
            if "type" in task and task["type"] in self.task_types:
                distributed[task["type"]].append(task)
                continue
            
            # Otherwise, determine type based on task characteristics
            task_type = self._determine_task_type(task)
            distributed[task_type].append(task)
            
            # Update task with determined type
            task["type"] = task_type
        
        # Log distribution statistics
        for task_type, task_list in distributed.items():
            logger.info(f"Distributed {len(task_list)} tasks to {task_type}")
        
        return dict(distributed)
    
    def _determine_task_type(self, task: Dict[str, Any]) -> str:
        """
        Determine the type of a task based on its characteristics.
        
        Args:
            task: Task dictionary
            
        Returns:
            Task type string
        """
        for task_type, check_function in self.task_types.items():
            if check_function(task):
                return task_type
        
        # Default to notes processing if no match
        logger.warning(f"Could not determine type for task {task.get('id', 'unknown')}, defaulting to notes_processing")
        return "notes_processing"
    
    def _is_project_task(self, task: Dict[str, Any]) -> bool:
        """Check if task is related to project batching."""
        if task.get("source") == "project_list":
            return True
        
        content = task.get("content", "")
        if isinstance(content, str):
            project_keywords = ["timeline", "milestone", "project plan", "task list", "roadmap"]
            return any(keyword in content.lower() for keyword in project_keywords)
        
        return False
    
    def _is_proposal_task(self, task: Dict[str, Any]) -> bool:
        """Check if task is related to proposal generation."""
        if "proposal" in task.get("source", "").lower():
            return True
            
        content = task.get("content", "")
        if isinstance(content, str):
            proposal_keywords = ["proposal", "quote", "estimate", "client pitch", "new project", "scope"]
            return any(keyword in content.lower() for keyword in proposal_keywords)
        
        return False
    
    def _is_bug_task(self, task: Dict[str, Any]) -> bool:
        """Check if task is related to bug fixing."""
        if "bug" in task.get("source", "").lower():
            return True
            
        content = task.get("content", "")
        if isinstance(content, str):
            bug_keywords = ["bug", "issue", "error", "fix", "crash", "exception", "not working"]
            return any(keyword in content.lower() for keyword in bug_keywords)
        
        if isinstance(content, dict):
            return "bug" in content or "error" in content or "issue" in content
        
        return False
    
    def _is_communication_task(self, task: Dict[str, Any]) -> bool:
        """Check if task is related to communication handling."""
        if "email" in task.get("source", "").lower() or "message" in task.get("source", "").lower():
            return True
            
        content = task.get("content", "")
        if isinstance(content, str):
            comm_keywords = ["reply", "respond", "email", "message", "contact", "client communication"]
            return any(keyword in content.lower() for keyword in comm_keywords)
        
        return False
    
    def _is_notes_task(self, task: Dict[str, Any]) -> bool:
        """Check if task is related to notes processing."""
        if "transcript" in task.get("source", "").lower() or "note" in task.get("source", "").lower():
            return True
            
        content = task.get("content", "")
        if isinstance(content, str):
            notes_keywords = ["note", "transcript", "recording", "idea", "thought", "reminder", "voice memo"]
            return any(keyword in content.lower() for keyword in notes_keywords)
        
        return False
