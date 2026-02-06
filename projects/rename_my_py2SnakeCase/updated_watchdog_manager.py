# Updated watchdog_manager.py to include voice note conversion watchdog

import json
import signal
import subprocess
from pathlib import Path
from typing import Dict
import psutil
import sys
import logging
from logging.handlers import RotatingFileHandler
import argparse

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create rotating file handler
log_file_path = Path(__file__).parent / 'logs' / 'watchdog_manager.log'
log_file_path.parent.mkdir(exist_ok=True)  # Ensure logs directory exists

file_handler = RotatingFileHandler(str(log_file_path), maxBytes=5*1024*1024, backupCount=5)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

# Also add StreamHandler to output to stdout
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

class WatchdogManager:
    def __init__(self, config_path: Path):
        self.config_path = config_path
        self.scripts: Dict[str, dict] = {}
        self.processes: Dict[str, subprocess.Popen] = {}
        self._load_config()

    def _load_config(self):
        if self.config_path.exists():
            with open(self.config_path) as f:
                self.scripts = json.load(f)
        else:
            self.scripts = {}
            self._save_config()

    def _save_config(self):
        with open(self.config_path, 'w') as f:
            json.dump(self.scripts, f, indent=2)

    def add_script(self, name: str, script_path: Path, enabled: bool = True):
        if not script_path.exists():
            raise FileNotFoundError(f"Script not found: {script_path}")

        self.scripts[name] = {
            "path": str(script_path),
            "enabled": enabled,
            "pid": None
        }
        self._save_config()

        if enabled:
            self.start_script(name)

    def remove_script(self, name: str):
        if name in self.scripts:
            self.stop_script(name)
            del self.scripts[name]
            self._save_config()
            logger.info(f"Removed script '{name}'.")
        else:
            logger.warning(f"Script '{name}' not found in configuration.")

    def start_script(self, name: str) -> bool:
        if name not in self.scripts:
            logger.error(f"Script '{name}' not found in configuration.")
            return False

        if self.is_running(name):
            logger.info(f"Script '{name}' is already running.")
            return True

        script_info = self.scripts[name]
        try:
            process = subprocess.Popen(
                [sys.executable, script_info["path"]],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.processes[name] = process
            script_info["pid"] = process.pid
            self._save_config()
            logger.info(f"Started script '{name}' with PID {process.pid}.")
            return True
        except Exception as e:
            logger.error(f"Failed to start script '{name}': {e}")
            return False

    def stop_script(self, name: str) -> bool:
        if name not in self.scripts:
            logger.error(f"Script '{name}' not found in configuration.")
            return False

        script_info = self.scripts[name]
        pid = script_info.get("pid")

        if pid is None:
            logger.info(f"Script '{name}' is not running.")
            return True

        try:
            process = psutil.Process(pid)
            process.terminate()
            process.wait(timeout=5)
            logger.info(f"Stopped script '{name}' with PID {pid}.")
            return True
        except psutil.NoSuchProcess:
            logger.warning(f"Process with PID {pid} does not exist.")
            return True
        except Exception as e:
            logger.error(f"Failed to stop script '{name}': {e}")
            return False
        finally:
            script_info["pid"] = None
            self._save_config()

    def is_running(self, name: str) -> bool:
        if name not in self.scripts:
            return False

        pid = self.scripts[name].get("pid")
        if pid is None:
            return False

        try:
            process = psutil.Process(pid)
            return process.is_running()
        except psutil.NoSuchProcess:
            return False

    def start_all_enabled(self):
        for name, info in self.scripts.items():
            if info.get("enabled", True):
                self.start_script(name)

    def stop_all(self):
        for name in list(self.scripts.keys()):
            self.stop_script(name)

    def list_scripts(self):
        """List all configured scripts and their status."""
        if not self.scripts:
            logger.info("No scripts configured.")
            return

        logger.info("Configured watchdog scripts:")
        for name, info in self.scripts.items():
            status = "RUNNING" if self.is_running(name) else "STOPPED"
            enabled = "ENABLED" if info.get("enabled", True) else "DISABLED"
            logger.info(f"  {name}: {status} ({enabled}) - {info['path']}")

def main():
    parser = argparse.ArgumentParser(description="Watchdog Manager")
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--add', nargs=2, metavar=('NAME', 'PATH'), help='Add a new watchdog script')
    parser.add_argument('--remove', metavar='NAME', help='Remove a watchdog script')
    parser.add_argument('--start', metavar='NAME', help='Start a specific watchdog script')
    parser.add_argument('--stop', metavar='NAME', help='Stop a specific watchdog script')
    parser.add_argument('--status', metavar='NAME', help='Check if a script is running')
    parser.add_argument('--list', action='store_true', help='List all configured scripts')

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    config_path = Path(__file__).parent / "watchdog_config.json"
    manager = WatchdogManager(config_path)

    if args.add:
        name, path = args.add
        script_path = Path(path).expanduser().resolve()
        try:
            manager.add_script(name, script_path)
            logger.info(f"Added script '{name}' with path '{script_path}'.")
        except FileNotFoundError as e:
            logger.error(e)
    elif args.remove:
        manager.remove_script(args.remove)
    elif args.start:
        if manager.start_script(args.start):
            logger.info(f"Started script '{args.start}'.")
        else:
            logger.error(f"Failed to start script '{args.start}'.")
    elif args.stop:
        if manager.stop_script(args.stop):
            logger.info(f"Stopped script '{args.stop}'.")
        else:
            logger.error(f"Failed to stop script '{args.stop}'.")
    elif args.status:
        status = manager.is_running(args.status)
        logger.info(f"Script '{args.status}' is {'running' if status else 'not running'}.")
    elif args.list:
        manager.list_scripts()
    else:
        # Default behavior: start manager and keep it running
        # Add default scripts if not present
        default_scripts = {
            "rename_py_files": Path(__file__).parent / "watch_downloads.py",
            "readme_script": Path(__file__).parent / "readme.py",
            "showall_script": Path(__file__).parent / "showall.py",
            "artifact_manager": Path(__file__).parent / "artifact_manager.py",
            "voice_note_converter": Path(__file__).parent / "watch_voice_notes.py"
        }

        for name, path in default_scripts.items():
            if name not in manager.scripts:
                try:
                    # Voice note converter disabled by default until ffmpeg is confirmed
                    enabled = name != "voice_note_converter"
                    manager.add_script(name, path, enabled=enabled)
                    logger.info(f"Added default script '{name}' with path '{path}' ({'enabled' if enabled else 'disabled'}).")
                except FileNotFoundError as e:
                    logger.warning(f"Could not add default script '{name}': {e}")

        manager.start_all_enabled()

        def cleanup(signum, frame):
            logger.info("Received termination signal. Stopping all scripts.")
            manager.stop_all()
            sys.exit(0)

        signal.signal(signal.SIGTERM, cleanup)
        signal.signal(signal.SIGINT, cleanup)

        logger.info("Watchdog Manager is running. Press Ctrl+C to exit.")
        logger.info("Use --list to see all configured scripts.")
        signal.pause()

if __name__ == "__main__":
    main()