#!/usr/bin/env python3

import os
import sys
import json
import subprocess
import logging
import tempfile
import contextlib
from pathlib import Path
from src.fileselect.main import FileSelectionApp

@contextlib.contextmanager
def preserve_cwd():
    """Context manager to preserve the current working directory."""
    cwd = os.getcwd()
    try:
        yield
    finally:
        os.chdir(cwd)

def setup_logger():
    """Set up logging for the file concatenation tool."""
    log_file = Path.home() / "git/tools/MyCodeTree2LLM/logs/file_concat.log"
    log_file.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        filename=log_file,
        filemode='a',
        format='%(asctime)s - %(levelname)s - %(message)s',
        level=logging.INFO
    )

class FileConcatenationTool:
    def __init__(self, include_tree=False):
        """
        Initialize the file concatenation tool.
        
        Args:
            include_tree (bool): Whether to include the tree structure in output.
        """
        self.tools_dir = Path.home() / "git/tools/MyCodeTree2LLM"
        self.config_file = self.tools_dir / "config.json"
        self.config = self.load_config()
        self.include_tree = include_tree
        
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
        """Execute the file concatenation workflow."""
        project_path = self.get_current_project_path()
        
        # Use a context manager to preserve the working directory
        with preserve_cwd():
            os.chdir(project_path)
            logging.info(f"Running file concatenation in: {project_path}")
            
            # Create temporary directory for workflow files
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_dir_path = Path(temp_dir)
                
                # Conditionally generate tree file
                tree_file = None
                if self.include_tree:
                    tree_file = temp_dir_path / "tree.txt"
                    try:
                        subprocess.run(["python", self.tools_dir / "folder_structure_generator.py", 
                                      str(project_path), "--output", str(tree_file)], check=True)
                        print("Tree structure generated successfully.")
                    except subprocess.CalledProcessError as e:
                        logging.error(f"Error generating tree structure: {e}")
                        print("Error: Failed to generate tree structure")
                        sys.exit(1)
                
                output_file = temp_dir_path / "concatenated_output.txt"
                
                # Run file selector with temporary files
                print("Launching interactive file selection...")
                try:
                    app = FileSelectionApp(root_dir=project_path)
                    # Override the default file paths in the app
                    if tree_file:
                        app.tree_file = tree_file
                    app.output_file = output_file
                    app.run()
                    print("File selection completed successfully.")
                except Exception as e:
                    logging.error(f"Error in file selection: {e}")
                    print("Error: File selection process failed")
                    sys.exit(1)

def main():
    """Main entry point for the file concatenation tool."""
    setup_logger()
    
    # Check for toggle tree flag
    include_tree = '0' in sys.argv
    
    try:
        tool = FileConcatenationTool(include_tree=include_tree)
        tool.run_workflow()
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
