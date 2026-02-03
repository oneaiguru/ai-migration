#!/usr/bin/env python3

import os
import sys
import json
import subprocess
from pathlib import Path
import logging

def setup_logger():
    log_file = Path.home() / "git/tools/MyCodeTree2LLM/logs/workflow.log"
    log_file.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        filename=log_file,
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO
    )

class WorkflowAutomation:
    def __init__(self):
        self.tools_dir = Path.home() / "git/tools/MyCodeTree2LLM"
        self.config_file = self.tools_dir / "config.json"
        self.config = self.load_config()
        
    def load_config(self):
        """Load configuration file."""
        try:
            with open(self.config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logging.error(f"Configuration file not found at {self.config_file}")
            print(f"Error: Configuration file not found at {self.config_file}")
            sys.exit(1)
            
    def get_current_project_path(self):
        """Get the current project's root path."""
        if not self.config.get("current_project"):
            logging.error("No current project selected")
            print("Error: No current project selected. Use 'p switch' to select a project first.")
            sys.exit(1)
            
        projects_path = self.config.get("projects_json_path") or self.config.get("projects_file")
        if not projects_path:
            logging.error("No projects path configured (projects_json_path or projects_file).")
            print("Error: No projects path configured in config.json.")
            sys.exit(1)
        projects_file = Path(projects_path)
        try:
            with open(projects_file, 'r') as f:
                projects = json.load(f)
                current = next((p for p in projects if p["name"] == self.config["current_project"]), None)
                if current:
                    return Path(current["rootPath"])
        except Exception as e:
            logging.error(f"Error reading projects file: {e}")
            print(f"Error: Could not read projects file at {projects_file}")
            sys.exit(1)
            
        logging.error("Current project not found in projects list")
        print("Error: Current project not found in projects list")
        sys.exit(1)

    def run_workflow(self):
        """Execute the automation workflow."""
        project_path = self.get_current_project_path()
        os.chdir(project_path)
        logging.info(f"Running workflow in: {project_path}")
        
        # Run folder structure generator
        print("Generating tree.txt...")
        try:
            subprocess.run(["python", self.tools_dir / "folder_structure_generator.py", 
                          str(project_path), "--output", "./tree.txt"], check=True)
            print("tree.txt generated successfully.")
        except subprocess.CalledProcessError as e:
            logging.error(f"Error generating tree.txt: {e}")
            print("Error: Failed to generate tree.txt")
            sys.exit(1)
            
        # Run file selector
        print("Launching interactive file selection...")
        try:
            subprocess.run(["python", self.tools_dir / "select_files.py", 
                          str(project_path)], check=True)
            print("Process completed successfully.")
        except subprocess.CalledProcessError as e:
            logging.error(f"Error in file selection: {e}")
            print("Error: File selection process failed")
            sys.exit(1)

def main():
    setup_logger()
    try:
        workflow = WorkflowAutomation()
        workflow.run_workflow()
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
