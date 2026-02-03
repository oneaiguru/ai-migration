
* * *

# **MyCodeTree2LLM**

MyCodeTree2LLM is a powerful workflow automation tool designed to streamline project management, file selection, and organization. It offers features such as interactive file selection, project switching, and automated directory tree generation. With unified key mappings and intuitive selection logic, it provides a seamless user experience for managing multiple projects.

* * *

## **Table of Contents**

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Configuration](#configuration)
   - [Example Configuration](#example-configuration)
   - [Projects Configuration](#projects-configuration)
5. [Usage](#usage)
   - [Setup Tools](#setup-tools)
   - [Switch Project](#switch-project)
   - [Run Workflow Automation](#run-workflow-automation)
   - [List Projects](#list-projects)
   - [Show Current Project](#show-current-project)
6. [Project Management Commands](#project-management-commands)
7. [Testing](#testing)
8. [Detailed Selection Logic](#detailed-selection-logic)
9. [Key Mapping and Display Improvements](#key-mapping-and-display-improvements)

* * *

## **Features**

- **Automated Workflow Execution**: Automate routine tasks across multiple projects.
- **Project File Selection**: Interactive selection of files and folders with configurable ignore patterns.
- **Project Switching**: Easily switch between project contexts.
- **Directory Tree Generation**: Automatically generates a `tree.txt` file representing the project directory structure.
- **Unified Key Mapping**: Ensures intuitive navigation across tags, folders, and files.

* * *

## **Prerequisites**

- **Python 3.7+**
- Additional packages as listed in `requirements.txt` (e.g., `rich`, `readchar`, `pyperclip`).

* * *

## **Setup**

1. Clone the repository:

   ```bash
   git clone https://github.com/username/MyCodeTree2LLM.git
   cd MyCodeTree2LLM
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Ensure your project directories and configuration files (`config.json` and `projects.json`) are correctly set up.

* * *

## **Configuration**

### **Example Configuration**

```json
{
    "current_project": "MyCodeTree2LLM",
    "projects_json_path": "/Users/m/Library/Application Support/Cursor/User/globalStorage/alefragnani.project-manager/projects.json",
    "tool_files": [
        "automate_workflow.sh",
        "select_files.py",
        "folder_structure_generator.py"
    ]
}
```

### `projects.json` Structure

The `projects.json` file should list each project with at least its name, root path, and enabled status:

```json
[
    {
        "name": "fast whisper",
        "rootPath": "/Users/m/git/personal/fastwhisper",
        "enabled": true
    },
    {
        "name": "lubot",
        "rootPath": "/Users/m/git/personal/lubot",
        "enabled": true
    }
]
```

## Usage

MyCodeTree2LLM provides several commands to automate and streamline project workflows. Each command can be executed directly from the terminal.

1. **Setup Tools**:
    
    ```bash
    python project_manager.py setup
    ```
    
    This command copies essential tool files to the specified project directory.
    
2. **Switch Project**:
    
    ```bash
    python project_manager.py switch -p 1
    ```
    
    Switch to a specific project by providing its index or name.
    
3. **Run Workflow Automation**:
    
    ```bash
    python workflow_automation.py
    ```
    
    Executes the workflow for the current project, generating `tree.txt` and running file selection scripts.
    
4. **List Projects**:
    
    ```bash
    python project_manager.py list
    ```
    
    Lists all available projects with the current project marked with an asterisk (*).
    
5. **Show Current Project**:
    
    ```bash
    python project_manager.py current
    ```
    
    Displays the currently selected project.
    

### Project Management Commands

These commands can be run as aliases if added to your shell profile. For example, you can set up an alias `p` to refer to `project_manager.py`.

```bash
alias p="python /path/to/project_manager.py"
```

Now you can use:

```bash
p setup
p list
p switch -p 1
p current
```

## Testing

Unit tests are available in the `tests/` directory. To run tests, use:

```bash
python -m unittest discover tests
```

* * *



Unified key mapping:

Keys are allocated once across all types (tags/folders/files)
Each key maps to exactly one item
Keys are allocated in priority order: tags -> folders -> files


Selection logic:

Selecting a folder automatically includes all its files
When a folder is selected, its files don't need individual keys
When a folder is deselected, its files get individual keys
Selection state is properly tracked and displayed with checkmarks


Display improvements:

Proper checkmark (✓) display for selected items
Consistent key display
Better formatting and alignment
Clear separation between sections


State management:

Central state management in FileSelectionApp
Proper updating of available files when folders are selected/deselected



Usage flow:

Initial state shows all available items with their keys
Pressing a folder key selects all files in that folder
Pressing a file key toggles individual files (only available for files not in selected folders)
Tags can be toggled independently


---
1. Unified key mapping:
   - Keys are allocated once across all types (tags/folders/files)
   - Each key maps to exactly one item
   - Keys are allocated in priority order: tags -> folders -> files
2. Selection logic:
   - Selecting a folder automatically includes all its files
   - When a folder is selected, its files don't need individual keys
   - When a folder is deselected, its files get individual keys
   - Selection state is properly tracked and displayed with checkmarks
3. Display improvements:
   - Proper checkmark (✓) display for selected items
   - Consistent key display
   - Better formatting and alignment
   - Clear separation between sections
4. State management:
   - Central state management in FileSelectionApp
   - Proper updating of available files when folders are selected/deselected

Usage flow:

1. Initial state shows all available items with their keys
2. Pressing a folder key toggles all files in that folder to be selected or deselected
3. Pressing a file key toggles individual files (also available for files in selected folders so user can first select all files in folder with folder shortcut, then deselect a few and rest will be selected)
4. Tags can be toggled independently

The key mapping is now properly divided between the different types of items, and each key press results in exactly one toggle action. This should make the interface much more intuitive and efficient to use.