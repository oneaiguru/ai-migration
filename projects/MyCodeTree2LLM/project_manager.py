#!/usr/bin/env python3

import os
import json
import shutil
import argparse
from pathlib import Path
from typing import Dict, List, Optional
import sys
import logging

# Set up logging to a file, with rotation to handle size limit
def setup_logger():
    log_file = Path("/Users/m/git/tools/MyCodeTree2LLM/logs/project_manager.log")
    log_file.parent.mkdir(parents=True, exist_ok=True)  # Ensure the logs directory exists
    logging.basicConfig(
        filename=log_file,
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.DEBUG
    )
    # Check if the log file exceeds 100KB and truncate if necessary
    if log_file.exists() and log_file.stat().st_size > 100 * 1024:  # 100KB
        logging.warning("Log file exceeded 100KB, truncating.")
        with open(log_file, 'w') as f:
            f.truncate(0)  # Clear the log file if it exceeds 100KB

setup_logger()

class ProjectManager:
    def __init__(self):
        # Define the directory to store tool files
        self.tools_dir = Path("/Users/m/git/tools/MyCodeTree2LLM/fileselector")
        logging.debug(f"Initializing tools directory at: {self.tools_dir}")
        # Ensure the directory exists, create if it doesn't
        self.tools_dir.mkdir(parents=True, exist_ok=True)
        # Define the configuration file path
        self.config_file = Path("/Users/m/git/tools/MyCodeTree2LLM/config.json")
        logging.debug(f"Configuration file path: {self.config_file}")
        
        # Load configuration to get projects file path
        self.config = self.load_config()
        logging.debug(f"Loaded configuration: {self.config}")
        # Determine the projects list path using whichever key is set
        projects_path = self.config.get("projects_json_path") or self.config.get("projects_file")
        if projects_path:
            self.projects_file = Path(projects_path)
        else:
            self.projects_file = Path("/Users/m/Library/Application Support/Cursor/User/globalStorage/alefragnani.project-manager/projects.json")
        logging.debug(f"Projects file path: {self.projects_file}")
        # Define the downloads directory path
        self.downloads_dir = Path("/Users/m/Downloads")
        logging.debug(f"Downloads directory path: {self.downloads_dir}")
        
        # Initialize projects
        self.projects = self.load_projects()
        logging.debug(f"Loaded projects: {self.projects}")
        
    def load_config(self) -> Dict:
        """Load or create configuration file."""
        # If the configuration file exists, load it
        if self.config_file.exists():
            logging.debug(f"Loading existing configuration from: {self.config_file}")
            with open(self.config_file, 'r') as f:
                return json.load(f)
        # If it doesn't exist, create a default configuration
        logging.warning("Configuration file not found. Creating default configuration.")
        default_config = {
            "current_project": None,
            "tool_files": [
                "automate_workflow.sh",
                "select_files.py",
                "folder_structure_generator.py"
            ],
            "projects_file": "/Users/m/Library/Application Support/Cursor/User/globalStorage/alefragnani.project-manager/projects.json"
        }
        # Save the default configuration to the file
        self.save_config(default_config)
        return default_config
    
    def save_config(self, config: Dict):
        """Save configuration to file."""
        # Write the given configuration dictionary to the config file
        logging.debug(f"Saving configuration to: {self.config_file}")
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=4)
            
    def load_projects(self) -> List[Dict]:
        """Load or create projects file."""
        # If the projects file exists, load it
        if self.projects_file.exists():
            logging.debug(f"Loading projects from: {self.projects_file}")
            with open(self.projects_file, 'r') as f:
                return json.load(f)
        # If it doesn't exist, copy it from the Downloads directory
        source_file = self.downloads_dir / "projects.json"
        if source_file.exists():
            logging.warning(f"Projects file not found. Copying from Downloads: {source_file}")
            shutil.copy(source_file, self.projects_file)
            with open(self.projects_file, 'r') as f:
                return json.load(f)
        # Return an empty list if no projects are found
        logging.warning("No projects found. Returning an empty list.")
        return []
    
    def save_projects(self):
        """Save projects to file."""
        # Write the current projects list to the projects file
        logging.debug(f"Saving projects to: {self.projects_file}")
        with open(self.projects_file, 'w') as f:
            json.dump(self.projects, f, indent=4)
            
    def setup_tools(self):
        """Copy tool files from Downloads to tools directory."""
        # Iterate over the tool files listed in the configuration
        for tool_file in self.config.get("tool_files", []):
            source = self.downloads_dir / tool_file
            dest = self.tools_dir / tool_file
            # Copy the tool file if it exists in the Downloads directory
            if source.exists():
                shutil.copy(source, dest)
                logging.info(f"Copied {tool_file} from {source} to tools directory at {dest}")
            else:
                logging.warning(f"Warning: {tool_file} not found in Downloads at {source}")
                
    def switch_project(self, project_identifier: str):
        """Switch to a different project by name or index."""
        logging.debug(f"Attempting to switch project to: {project_identifier}")
        # Determine if project_identifier is a number or a name
        if project_identifier.isdigit():
            # Convert the index to an integer and adjust to 0-based
            index = int(project_identifier) - 1
            # Check if the index is valid
            if index < 0 or index >= len(self.projects):
                logging.error(f"Invalid project index: {project_identifier}")
                return
            # Get the project by index
            project = self.projects[index]
        else:
            # Find the project by name
            project = next((p for p in self.projects if p["name"] == project_identifier), None)
            if not project:
                logging.error(f"Project {project_identifier} not found")
                return
        
        # Update the current project in the configuration
        project_name = project["name"]
        logging.info(f"Switching to project: {project_name}")
        self.config["current_project"] = project_name
        self.save_config(self.config)  # Ensure config is updated properly
        
        # Ensure tool_files key exists with default value if missing
        tool_files = self.config.get("tool_files", [
            "automate_workflow.sh",
            "select_files.py",
            "folder_structure_generator.py"
        ])
        
        # Copy tool files to the selected project's directory
        project_path = Path(project["rootPath"])
        logging.debug(f"Project path: {project_path}")
        for tool_file in tool_files:
            source = self.tools_dir / tool_file
            dest = project_path / tool_file
            # Copy the tool file if it exists in the tools directory
            if source.exists():
                shutil.copy(source, dest)
                logging.info(f"Copied {tool_file} from {source} to project directory at {dest}")
            else:
                logging.warning(f"Warning: {tool_file} not found in tools directory at {source}")
                
    def list_projects(self):
        """List all available projects with numbered indices."""
        # Get the current project from the configuration
        current = self.config.get("current_project")
        logging.debug("Listing all available projects.")
        print("\nAvailable projects:")
        # Iterate through the list of projects and display them
        for index, project in enumerate(self.projects):
            # Mark the current project with an asterisk
            marker = "* " if project["name"] == current else "  "
            print(f"{marker}{index + 1}: {project['name']} ({project['rootPath']})")
        logging.debug("Listing of projects completed.")
        
    def interactive_project_switch(self):
        """Show an interactive menu to switch between projects."""
        while True:
            # List all projects
            self.list_projects()
            logging.debug("Starting interactive project switch.")
            print("\nSelect a project to switch to (or press 'q' to quit):")
            choice = input("Enter number or name: ").strip()
            # Quit if user inputs 'q'
            if choice.lower() == 'q':
                logging.info("Exiting interactive project switch.")
                break
            # Attempt to switch to the selected project
            self.switch_project(choice)
            logging.info("Project switched successfully.")
            break
            
    def get_current_project(self) -> Optional[Dict]:
        """Get current project configuration."""
        # If no project is currently selected, return None
        if not self.config.get("current_project"):
            logging.info("No current project is selected.")
            return None
        # Find and return the current project by its name
        current_project = next((p for p in self.projects if p["name"] == self.config["current_project"]), None)
        logging.debug(f"Current project: {current_project}")
        return current_project

def main():
    parser = argparse.ArgumentParser(description="Manage project files and tools")
    parser.add_argument("command", choices=["setup", "switch", "list", "current", "p"],
                       help="Command to execute")
    parser.add_argument("--project", "-p", help="Project name or index for switch command")
    
    args = parser.parse_args()
    manager = ProjectManager()
    
    if args.command == "setup":
        # Setup tool files
        logging.info("Running setup command.")
        manager.setup_tools()
        logging.info("Tools setup completed.")
        
    elif args.command == "switch":
        # Switch project by name or index
        if not args.project:
            logging.error("Error: Project name or index required for switch command")
            return
        logging.info(f"Running switch command with project: {args.project}")
        manager.switch_project(args.project)
        
    elif args.command == "list":
        # List all projects
        logging.info("Running list command.")
        manager.list_projects()
        
    elif args.command == "current":
        # Display the current project
        logging.info("Running current command.")
        current = manager.get_current_project()
        if current:
            print(f"Current project: {current['name']} ({current['rootPath']})")
        else:
            print("No project currently selected")
    
    elif args.command == "p":
        # Interactive project switch
        logging.info("Running interactive project switch command.")
        manager.interactive_project_switch()

if __name__ == "__main__":
    logging.info("Starting ProjectManager script.")
    main()
    logging.info("ProjectManager script finished.")

# Instructions for adding to PATH:
# To make the script executable from anywhere, add its directory to your PATH.
# Run the following command to do this:
# export PATH="$PATH:/Users/m/git/tools/MyCodeTree2LLM"
# You can add this line to your ~/.zshrc or ~/.bash_profile to make it permanent.

# Alias Instructions:
# To create an alias for the script, add the following to your ~/.zshrc or ~/.bash_profile:
# alias p="project_manager.py"
# Now you can use commands like:
# p setup, p list, p switch -p 1, p current, p p
