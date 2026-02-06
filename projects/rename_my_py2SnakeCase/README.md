# Rename My Py2SnakeCase

A tool suite to automate file management and code artifact handling using `watchdog`. Includes scripts for Python file renaming, artifact management, README updates, and process management.

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- Usage
  - [Starting the Watchdog Manager](#starting-the-watchdog-manager)
  - [Managing Watchdog Scripts](#managing-watchdog-scripts)
  - [Artifact Manager](#artifact-manager)
- [Testing](#testing)
- [Setup on macOS](#setup-on-macos)
- [CLI Commands](#cli-commands)
- [Shell Scripts](#shell-scripts)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Automatic Renaming:** Monitors the `Downloads` folder for new Python files and renames them from kebab-case to snake_case.
- **Artifact Management:** Moves Claude AI artifacts from Downloads to appropriate project folders with automatic git commits.
- **Process Management:** Manages multiple watchdog scripts, ensuring they run continuously.
- **Readme Management:** Automatically updates `README.md` with the latest ChatGPT messages from markdown files.
- **Content Display:** Reads and displays the contents of specified files or entire folders.
- **Cross-Platform:** Designed to work on macOS and other Unix-like systems.
- **Extensible:** Easily add or remove scripts as needed.

## Directory Structure

```
rename_my_py2SnakeCase/
├── README.md
├── artifact_manager.py
├── logs/
│   ├── watchdog_manager.err
│   └── watchdog_manager.out
│   └── watchdog_manager.log
├── plist
├── readme.py
├── requirements.txt
├── test_watch_downloads.py
├── test_watchdog_manager.py
├── watch_downloads.py
├── watchdog_config.json
├── watchdog_manager.py
└── wiki/
    ├── Design_Overview.md
    ├── Introduction.md
    └── Usage_Guide.md
```

- **artifact_manager.py:** Script to manage Claude AI artifacts, moving them to project folders.
- **logs/:** Directory to store log files, including error and output logs.
- **plist:** Launch agent configuration for macOS.
- **readme.py:** Script to update `README.md` with the latest ChatGPT message.
- **requirements.txt:** Python dependencies.
- **test_watch_downloads.py:** Unit tests for `watch_downloads.py`.
- **test_watchdog_manager.py:** Unit tests for `watchdog_manager.py`.
- **watch_downloads.py:** Script to monitor and rename Python files in `Downloads`.
- **watchdog_config.json:** Configuration file for managing watchdog scripts.
- **watchdog_manager.py:** Manager to handle multiple watchdog scripts.
- **wiki/:** Documentation directory with detailed guides.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/rename_my_py2SnakeCase.git
   cd rename_my_py2SnakeCase
   ```

2. **Set Up Virtual Environment (Recommended):**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

## Configuration

The `watchdog_config.json` file manages the scripts handled by the `WatchdogManager`. It stores script paths, their enabled status, and process IDs.

### Example `watchdog_config.json`:

```json
{
  "rename_py_files": {
    "path": "/Users/m/git/tools/rename_my_py2SnakeCase/watch_downloads.py",
    "enabled": true,
    "pid": null
  },
  "readme_script": {
    "path": "/Users/m/git/tools/rename_my_py2SnakeCase/readme.py",
    "enabled": true,
    "pid": null
  },
  "artifact_manager": {
    "path": "/Users/m/git/tools/rename_my_py2SnakeCase/artifact_manager.py",
    "enabled": true,
    "pid": null
  }
}
```

**Notes:**

- **Adding Scripts:** Use the CLI or manually add entries to manage more scripts.
- **Enabling/Disabling:** Toggle the `enabled` field to start or stop scripts automatically.

## Usage

### Starting the Watchdog Manager

To start the manager manually:

```bash
python watchdog_manager.py
```

For verbose logging:

```bash
python watchdog_manager.py --verbose
```

### Managing Watchdog Scripts

Use the `WatchdogManager` class to add, remove, start, or stop scripts.

#### **Adding a Script:**

```bash
python watchdog_manager.py --add script_name /path/to/script.py
```

#### **Removing a Script:**

```bash
python watchdog_manager.py --remove script_name
```

#### **Starting a Script:**

```bash
python watchdog_manager.py --start script_name
```

#### **Stopping a Script:**

```bash
python watchdog_manager.py --stop script_name
```

#### **Checking Status:**

```bash
python watchdog_manager.py --status script_name
```

### Artifact Manager

The Artifact Manager is a specialized tool for handling Claude AI artifacts:

```bash
python artifact_manager.py --downloads /path/to/downloads --projects /path/to/projects
```

Options:

- `--downloads`: Path to Downloads folder (default: ~/Downloads)
- `--projects`: Path to Projects directory (default: ~/Documents)
- `--extensions`: Comma-separated list of file extensions to watch (default: .py,.md,.txt,.json,.html,.css,.js)
- `--verbose`: Enable verbose logging
- `--process-file FILE`: Process a specific file (one-time operation)

## Testing

Run unit tests to ensure the functionality of your scripts.

```bash
python -m unittest discover
```

Or run specific tests:

```bash
python test_watchdog_manager.py
python test_watch_downloads.py
```

## Setup on macOS

To have the `WatchdogManager` start automatically on macOS startup:

1. **Create a Launch Agent Plist File:**

   ```bash
   nano ~/Library/LaunchAgents/com.user.watchdog_manager.plist
   ```

2. **Populate the Plist File:**

   Replace `/Users/m/git/tools/rename_my_py2SnakeCase` with your actual project path.

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.user.watchdog_manager</string>
       <key>ProgramArguments</key>
       <array>
           <string>/usr/bin/python3</string>
           <string>/Users/m/git/tools/rename_my_py2SnakeCase/watchdog_manager.py</string>
       </array>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
       <key>StandardErrorPath</key>
       <string>/Users/m/git/tools/rename_my_py2SnakeCase/logs/watchdog_manager.err</string>
       <key>StandardOutPath</key>
       <string>/Users/m/git/tools/rename_my_py2SnakeCase/logs/watchdog_manager.out</string>
       <key>WorkingDirectory</key>
       <string>/Users/m/git/tools/rename_my_py2SnakeCase</string>
   </dict>
   </plist>
   ```

3. **Create Logs Directory:**

   ```bash
   mkdir -p /Users/m/git/tools/rename_my_py2SnakeCase/logs
   ```

4. **Load the Launch Agent:**

   ```bash
   launchctl load ~/Library/LaunchAgents/com.user.watchdog_manager.plist
   ```

5. **Verify the Agent is Running:**

   ```bash
   launchctl list | grep watchdog_manager
   ```

6. **Unloading the Agent (If Needed):**

   To stop the agent:

   ```bash
   launchctl unload ~/Library/LaunchAgents/com.user.watchdog_manager.plist
   ```

## CLI Commands

The `WatchdogManager` includes a command-line interface to manage scripts conveniently.

### **Examples:**

- **Add a Script:**

  ```bash
  python watchdog_manager.py --add showall_script /path/to/showall.py
  ```

- **Remove a Script:**

  ```bash
  python watchdog_manager.py --remove showall_script
  ```

- **Start a Script:**

  ```bash
  python watchdog_manager.py --start showall_script
  ```

- **Stop a Script:**

  ```bash
  python watchdog_manager.py --stop showall_script
  ```

- **Check Status:**

  ```bash
  python watchdog_manager.py --status showall_script
  ```

## Shell Scripts

You can create shell scripts to simplify common tasks.

### **Start Manager Script (`start_manager.sh`):**

```bash
#!/bin/bash

# Navigate to project directory
cd /Users/m/git/tools/rename_my_py2SnakeCase

# Activate virtual environment if any
# source venv/bin/activate

# Start the manager
python watchdog_manager.py --verbose
```

**Make it Executable:**

```bash
chmod +x start_manager.sh
```

**Run the Script:**

```bash
./start_manager.sh
```

### **Stop Manager Script (`stop_manager.sh`):**

```bash
#!/bin/bash

# Find the process ID using the config file
pid=$(jq '.readme_script.pid' /Users/m/git/tools/rename_my_py2SnakeCase/watchdog_config.json)

if [ "$pid" != "null" ]; then
    kill $pid
    echo "Watchdog Manager stopped."
else
    echo "Watchdog Manager is not running."
fi
```

**Make it Executable:**

```bash
chmod +x stop_manager.sh
```

**Run the Script:**

```bash
./stop_manager.sh
```

*Note: This example uses `jq` to parse JSON. Install it via `brew install jq` if not already installed.*

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.