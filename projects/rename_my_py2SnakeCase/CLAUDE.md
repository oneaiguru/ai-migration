# rename_my_py2SnakeCase - File Management Automation Memory

## Quick Start
- **Purpose**: Automated file management suite using watchdog - renames Python files, manages artifacts, updates READMEs
- **Type**: Background service / File system monitor
- **Language**: Python 3.8+

## Installation
```bash
# Navigate to rename_my_py2SnakeCase directory
cd /path/to/rename_my_py2SnakeCase/

# Set up virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python watchdog_manager.py --help
```

## Common Usage
```bash
# Start watchdog manager (all scripts)
python watchdog_manager.py

# Start with verbose logging
python watchdog_manager.py --verbose

# Manage individual scripts
python watchdog_manager.py --start rename_py_files
python watchdog_manager.py --stop artifact_manager
python watchdog_manager.py --status readme_script

# Add custom script
python watchdog_manager.py --add custom_script /path/to/script.py

# Use shell wrapper
./start_manager.sh
```

## Architecture
| Component | Lines | Role |
|-----------|-------|------|
| `watchdog_manager.py` | 1-221 | Process orchestration and management |
| `watch_downloads.py` | 1-150 | Python file renaming (kebab→snake_case) |
| `artifact_manager.py` | 1-200 | Claude AI artifact organization |
| `readme.py` | 1-100 | README.md auto-updates from ChatGPT |
| `watchdog_config.json` | - | Script configuration and state |

## How It Works
1. **Load config** - `watchdog_manager.py:39-45` reads script definitions
2. **Start processes** - `watchdog_manager.py:74-97` launches background scripts
3. **Monitor health** - `watchdog_manager.py:127-139` checks process status
4. **File watching** - Individual scripts use watchdog for real-time monitoring
5. **Process management** - `watchdog_manager.py:99-125` handles start/stop/cleanup

## Configuration
- Config file: `watchdog_config.json` - script paths, enabled status, PIDs
- Log directory: `logs/` - rotating logs with 5MB max, 5 backups
- Environment setup: Virtual environment recommended
- macOS integration: Launch agent plist for startup automation

## Script Functionality
| Script | Purpose | Monitors |
|--------|---------|----------|
| `watch_downloads.py` | Rename kebab-case.py → snake_case.py | ~/Downloads/*.py |
| `artifact_manager.py` | Move Claude artifacts to project folders | Downloads, auto-commit |
| `readme.py` | Update README.md with latest ChatGPT messages | .md files |
| `watch_voice_notes.py` | Process voice transcription files | Voice memos |
| `watch_small_files.py` | Handle small file organization | File size based |

## API/Library Usage
```python
# Import manager
from watchdog_manager import WatchdogManager
from pathlib import Path

# Initialize manager
config_path = Path("watchdog_config.json")
manager = WatchdogManager(config_path)

# Add and start script
manager.add_script("my_script", Path("/path/to/script.py"))
manager.start_script("my_script")

# Check status
is_running = manager.is_running("my_script")
```

## Integration Points
- **Input sources**: File system events (watchdog), Downloads folder, project directories
- **Output formats**: Renamed files, git commits, updated documentation
- **macOS integration**: Launch agents, system notifications
- **Can chain with**: Git workflows, project management, Claude AI artifacts

## Performance
- **Speed**: Real-time file system monitoring, <1s response to changes
- **Memory**: ~20MB per active script, scales with file system activity
- **Startup time**: <5 seconds to initialize all default scripts
- **Process management**: Automatic restart on crashes, clean shutdown

## Process Management Features
| Feature | Lines | Purpose |
|---------|-------|---------|
| Script discovery | `watchdog_manager.py:192-205` | Auto-add default scripts |
| Health monitoring | `watchdog_manager.py:127-139` | Check process status |
| Clean shutdown | `watchdog_manager.py:209-218` | Signal handling |
| Config persistence | `watchdog_manager.py:47-49` | Save state to JSON |
| Error recovery | Built-in | Automatic restart on failure |

## Debugging
- **Log location**: `logs/watchdog_manager.log` (rotating, 5MB max)
- **Verbose mode**: `--verbose` flag for detailed logging
- **Common errors**:
  - Script not found: Check file paths in config.json
  - Permission denied: Ensure scripts are executable
  - Process zombie: Use `ps aux | grep python` to check processes
  - Config corruption: Delete watchdog_config.json to reset

## Examples
```bash
# Example 1: Basic file renaming setup
python watchdog_manager.py --add rename_files ./watch_downloads.py
python watchdog_manager.py --start rename_files
# Now Downloads/*.py files automatically renamed kebab→snake_case

# Example 2: Claude artifact management
python watchdog_manager.py --start artifact_manager  
# Downloads Claude artifacts moved to ~/Documents/projects/ with git commits

# Example 3: README automation
python watchdog_manager.py --start readme_script
# README.md updated automatically when new .md files appear

# Example 4: Custom script integration
cat > my_custom_monitor.py << 'EOF'
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class CustomHandler(FileSystemEventHandler):
    def on_created(self, event):
        print(f"New file: {event.src_path}")

observer = Observer()
observer.schedule(CustomHandler(), "/path/to/watch", recursive=True)
observer.start()
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
EOF

python watchdog_manager.py --add custom_monitor ./my_custom_monitor.py
python watchdog_manager.py --start custom_monitor
```

## macOS Launch Agent Setup
```bash
# Create launch agent for startup automation
cat > ~/Library/LaunchAgents/com.user.watchdog_manager.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.watchdog_manager</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/path/to/watchdog_manager.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load the agent
launchctl load ~/Library/LaunchAgents/com.user.watchdog_manager.plist
```

## File Processing Patterns
```python
# Pattern 1: File renaming
# kebab-case-file.py → kebab_case_file.py
def rename_to_snake_case(filepath):
    directory = os.path.dirname(filepath)
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)
    
    snake_name = name.replace('-', '_')
    new_path = os.path.join(directory, snake_name + ext)
    
    if filepath != new_path:
        os.rename(filepath, new_path)
        return new_path
    return filepath

# Pattern 2: Artifact management  
# Move Claude-generated files to appropriate project folders
def organize_artifact(filepath, projects_dir):
    # Determine project from content or filename
    # Move to appropriate folder
    # Create git commit
    pass

# Pattern 3: README updates
# Extract latest ChatGPT message from .md files
def update_readme_from_chatgpt(md_file, readme_path):
    # Parse ChatGPT message format
    # Extract latest response
    # Update README.md section
    pass
```

## Advanced Configuration
```json
{
  "rename_py_files": {
    "path": "/path/to/watch_downloads.py",
    "enabled": true,
    "pid": null,
    "options": {
      "watch_directory": "~/Downloads",
      "file_patterns": ["*.py"],
      "rename_pattern": "kebab_to_snake"
    }
  },
  "artifact_manager": {
    "path": "/path/to/artifact_manager.py", 
    "enabled": true,
    "pid": null,
    "options": {
      "downloads_dir": "~/Downloads",
      "projects_dir": "~/Documents/projects",
      "extensions": [".py", ".md", ".txt", ".json", ".html", ".css", ".js"],
      "auto_commit": true
    }
  }
}
```

## Testing
```bash
# Run unit tests
python -m unittest discover

# Test specific script
python test_watchdog_manager.py
python test_watch_downloads.py

# Integration testing
python -c "
import tempfile, os
from watchdog_manager import WatchdogManager
from pathlib import Path

# Create test config
test_config = Path(tempfile.mkdtemp()) / 'test_config.json'
manager = WatchdogManager(test_config)

# Test script management
print('Manager initialized successfully')
"
```