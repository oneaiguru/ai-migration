#!/usr/bin/env python3
"""
Freelance Project Automation Scheduler
-------------------------------------
This script orchestrates the automated scheduling and processing of freelance
projects, using DeepSeek's API to optimize for cost and efficiency.
"""

import os
import json
import time
import datetime
import argparse
import logging
from typing import List, Dict, Any

# Local modules
from task_parser import TaskParser
from task_distributor import TaskDistributor
from processors import (
    ProjectBatcher,
    ProposalGenerator,
    BugFixPrioritizer,
    CommunicationHandler,
    NotesProcessor
)
from api_client import DeepSeekClient
from task_scheduler import TaskScheduler

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scheduler.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Scheduler")

class AutomationScheduler:
    """Main scheduler class that orchestrates the entire automation pipeline."""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the scheduler with configuration."""
        self.load_config(config_path)
        api_key = os.getenv("DEEPSEEK_API_KEY") or self.config["api_config"].get("api_key")
        if not api_key:
            raise ValueError("DeepSeek API key is required. Set DEEPSEEK_API_KEY or update api_config.api_key.")
        self.api_client = DeepSeekClient(
            base_url=self.config["api_config"]["base_url"],
            api_key=api_key
        )
        self.parser = TaskParser(api_client=self.api_client)
        self.distributor = TaskDistributor()
        self.scheduler = TaskScheduler(self.config["scheduling"])
        
        # Initialize processors
        self.processors = {
            "project_batching": ProjectBatcher(self.api_client, self.config),
            "proposal_generation": ProposalGenerator(self.api_client, self.config),
            "bug_fix_prioritization": BugFixPrioritizer(self.api_client, self.config),
            "communication_handling": CommunicationHandler(self.api_client, self.config),
            "notes_processing": NotesProcessor(self.api_client, self.config)
        }
        
    def load_config(self, config_path: str):
        """Load configuration from JSON file."""
        try:
            with open(config_path, 'r') as f:
                self.config = json.load(f)
                logger.info(f"Configuration loaded from {config_path}")
        except Exception as e:
            logger.error(f"Failed to load configuration: {e}")
            raise
    
    def is_off_peak_hours(self) -> bool:
        """Check if current time is in off-peak hours."""
        now = datetime.datetime.utcnow().time()
        start_time = datetime.datetime.strptime(
            self.config["scheduling"]["off_peak_hours"]["start"], 
            "%H:%M"
        ).time()
        end_time = datetime.datetime.strptime(
            self.config["scheduling"]["off_peak_hours"]["end"], 
            "%H:%M"
        ).time()
        
        # Handle the case where off-peak spans across midnight
        if start_time > end_time:
            return now >= start_time or now < end_time
        else:
            return start_time <= now < end_time
    
    def collect_tasks(self) -> List[Dict[str, Any]]:
        """Collect and parse tasks from all input sources."""
        tasks = []
        
        # Parse projects
        project_path = self.config["file_paths"]["project_list"]
        if os.path.exists(project_path):
            with open(project_path, 'r') as f:
                projects = json.load(f)
                tasks.extend(self.parser.parse_projects(projects))
        
        # Parse voice transcripts
        transcript_dir = self.config["file_paths"]["voice_transcripts"]
        if os.path.exists(transcript_dir):
            for filename in os.listdir(transcript_dir):
                if filename.endswith(".txt"):
                    with open(os.path.join(transcript_dir, filename), 'r') as f:
                        content = f.read()
                        tasks.extend(self.parser.parse_transcript(content, filename))
        
        # Parse bug reports
        bug_dir = self.config["file_paths"]["bug_reports"]
        if os.path.exists(bug_dir):
            for filename in os.listdir(bug_dir):
                if filename.endswith(".json"):
                    with open(os.path.join(bug_dir, filename), 'r') as f:
                        bug = json.load(f)
                        tasks.extend(self.parser.parse_bug_report(bug, filename))
        
        # Parse communications
        comms_dir = self.config["file_paths"]["communications"]
        if os.path.exists(comms_dir):
            for filename in os.listdir(comms_dir):
                if filename.endswith(".txt") or filename.endswith(".eml"):
                    with open(os.path.join(comms_dir, filename), 'r') as f:
                        content = f.read()
                        tasks.extend(self.parser.parse_communication(content, filename))
        
        logger.info(f"Collected {len(tasks)} tasks from all sources")
        return tasks
    
    def process_and_schedule(self, tasks: List[Dict[str, Any]]):
        """Process collected tasks and schedule them based on priority and timing."""
        # Distribute tasks to appropriate processors
        distributed_tasks = self.distributor.distribute(tasks)
        
        scheduled_tasks = {}
        prioritized_tasks = []

        for task_type, task_list in distributed_tasks.items():
            if task_type in self.processors:
                processor = self.processors[task_type]
                processed_tasks = processor.process(task_list)

                for task in processed_tasks:
                    task["priority_score"] = self.scheduler.get_task_priority_score(task)
                    prioritized_tasks.append(task)

        # Schedule higher-priority/earlier-deadline tasks first to avoid low-priority tasks
        # taking the earliest available slots.
        for task in sorted(
            prioritized_tasks,
            key=lambda t: (-t.get("priority_score", 0), t.get("deadline", "")),
        ):
            schedule_time = self.scheduler.schedule_task(
                task,
                is_off_peak=self.is_off_peak_hours()
            )
            if schedule_time not in scheduled_tasks:
                scheduled_tasks[schedule_time] = []
            scheduled_tasks[schedule_time].append(task)

        return scheduled_tasks
    
    def execute_scheduled_tasks(self, scheduled_tasks: Dict[str, List[Dict[str, Any]]]):
        """Execute tasks according to their schedule."""
        for schedule_time, tasks in sorted(scheduled_tasks.items()):
            # Calculate wait time if needed
            schedule_dt = datetime.datetime.fromisoformat(schedule_time)
            if schedule_dt.tzinfo is None:
                schedule_dt = schedule_dt.replace(tzinfo=datetime.timezone.utc)
            now = datetime.datetime.now(datetime.timezone.utc)
            if schedule_dt > now:
                wait_seconds = (schedule_dt - now).total_seconds()
                logger.info(f"Waiting {wait_seconds} seconds until {schedule_time}")
                time.sleep(wait_seconds)
            
            # Execute tasks
            for task in tasks:
                task_type = task["type"]
                if task_type in self.processors:
                    processor = self.processors[task_type]
                    logger.info(f"Executing {task_type} task: {task['id']}")
                    try:
                        result = processor.execute(task)
                        self.save_result(task, result)
                    except Exception as e:
                        logger.error(f"Failed to execute task {task['id']}: {e}")
    
    def save_result(self, task: Dict[str, Any], result: Any):
        """Save task execution result to output directory."""
        output_dir = self.config["file_paths"]["output_directory"]
        os.makedirs(output_dir, exist_ok=True)
        
        output_file = os.path.join(output_dir, f"{task['id']}_{int(time.time())}.json")
        with open(output_file, 'w') as f:
            json.dump({
                "task": task,
                "result": result,
                "timestamp": datetime.datetime.now().isoformat()
            }, f, indent=2)
        
        logger.info(f"Saved result for task {task['id']} to {output_file}")
    
    def run(self):
        """Run the full automation pipeline."""
        logger.info("Starting automation scheduler")
        
        # Collect tasks from all sources
        tasks = self.collect_tasks()
        
        # Process and schedule tasks
        scheduled_tasks = self.process_and_schedule(tasks)
        
        # Execute scheduled tasks
        self.execute_scheduled_tasks(scheduled_tasks)
        
        logger.info("Automation scheduler completed")

def main():
    """Main entry point for the scheduler."""
    parser = argparse.ArgumentParser(description="Freelance Project Automation Scheduler")
    parser.add_argument("--config", default="config.json", help="Path to configuration file")
    args = parser.parse_args()
    
    scheduler = AutomationScheduler(args.config)
    scheduler.run()

if __name__ == "__main__":
    main()
