# llmcodeupdater/input_handler.py

import os
import json
from pathlib import Path
import pyperclip
import logging
from typing import Dict, Optional, Any, Union
import time

logger = logging.getLogger(__name__)

def setup_cli_parser():
    """Setup command line argument parser with enhanced options."""
    import argparse
    parser = argparse.ArgumentParser(description='Process code updates from LLM')
    
    # Project selection options
    project_group = parser.add_mutually_exclusive_group()
    project_group.add_argument('--git-path', help='Path to git repository')
    project_group.add_argument('--use-config', action='store_true', help='Use current project from config.json')
    
    # Content source options
    content_group = parser.add_mutually_exclusive_group()
    content_group.add_argument('--content', help='LLM content to process')
    content_group.add_argument('--content-file', help='Path to file containing LLM output')
    
    return parser

class InputHandler:
    def __init__(self, default_git_path: Optional[str] = None):
        """Initialize InputHandler with default git path."""
        self.default_git_path = default_git_path
        # Prefer an override via environment, otherwise default to repo-local config.json
        config_override = os.environ.get("LLMCODEUPDATER_CONFIG")
        if config_override:
            self.config_file = Path(config_override).expanduser()
        else:
            self.config_file = Path(__file__).resolve().parent.parent / "config.json"
        self.logger = logging.getLogger(__name__)
        self._performance_metrics = {}  # Restored performance tracking
        
    def validate_path(self, path: str) -> Optional[Path]:
        """Validate if path exists and is accessible."""
        try:
            path_obj = Path(path).expanduser().resolve()
            if not path_obj.exists():
                self.logger.error(f"Path does not exist: {path}")
                return None
            if not path_obj.is_dir():
                self.logger.error(f"Path is not a directory: {path}")
                return None
            return path_obj
        except Exception as e:
            self.logger.error(f"Error validating path: {e}")
            return None

    def load_config(self) -> Dict[str, Any]:
        """Load configuration from config.json with validation."""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    if not isinstance(config, dict):
                        raise ValueError("Invalid config format")
                    return config
            self.logger.warning(f"Config file not found at {self.config_file}")
            return {}
        except Exception as e:
            self.logger.error(f"Error loading config: {e}")
            return {}
    def get_current_project_path(self) -> Optional[str]:
        """Get the current project path from config with enhanced validation."""
        config = self.load_config()
        current_project = config.get('current_project')
        
        if not current_project:
            self.logger.warning("No current project set in config.json")
            return None

        projects_path = config.get('projects_json_path')
        if not projects_path:
            self.logger.error("projects_json_path not found in config")
            return None

        try:
            projects_path = Path(projects_path).expanduser()
            if not projects_path.exists():
                self.logger.error(f"Projects JSON file not found: {projects_path}")
                return None

            with open(projects_path, 'r') as f:
                projects = json.load(f)
                project = next((p for p in projects if p['name'] == current_project), None)
                if project and 'rootPath' in project:
                    path = project['rootPath']
                    if self.validate_path(path):
                        return path
                    self.logger.error(f"Invalid project path: {path}")
                    return None
                self.logger.error(f"Project '{current_project}' not found or missing rootPath")
        except Exception as e:
            self.logger.error(f"Error loading projects.json: {e}")
        
        return None

    def get_clipboard_content(self) -> Optional[str]:
        """Get content from clipboard with error handling."""
        try:
            content = pyperclip.paste()
            if not content:
                self.logger.warning("Clipboard is empty")
            return content
        except Exception as e:
            self.logger.error(f"Error getting clipboard content: {e}")
            return None

    def process_input(self, args: Dict[str, Any]) -> Dict[str, Union[str, Path, None]]:
        """Process input arguments with comprehensive validation and timing."""
        start_time = time.time()  # Start timing
        result = {
            'project_path': None,
            'llm_content': None
        }

        try:
            # Handle project path with priority order:
            # 1. Command line argument
            # 2. Config file
            # 3. Default git path
            project_path = None
            if args.get('git_path'):
                project_path = args['git_path']
            elif args.get('use_config', True):
                project_path = self.get_current_project_path()
            
            if not project_path and self.default_git_path:
                project_path = self.default_git_path

            if not project_path:
                raise ValueError("No valid project path found from any source")

            validated_path = self.validate_path(project_path)
            if not validated_path:
                raise ValueError(f"Invalid project path: {project_path}")
            
            result['project_path'] = validated_path

            # Handle content with priority order:
            # 1. Command line content
            # 2. Content file
            # 3. Clipboard
            content = None
            if args.get('content'):
                content = args['content']
            elif args.get('content_file'):
                content_path = Path(args['content_file'])
                if content_path.exists() and content_path.is_file():
                    content = content_path.read_text(encoding='utf-8')
            
            if not content:
                content = self.get_clipboard_content()

            if not content:
                raise ValueError("No content provided and clipboard is empty")

            result['llm_content'] = content

        except Exception as e:
            self.logger.error(f"Error processing input: {e}")
            raise

        finally:
            # Record performance metric
            self._performance_metrics['process_input'] = time.time() - start_time

        return result
