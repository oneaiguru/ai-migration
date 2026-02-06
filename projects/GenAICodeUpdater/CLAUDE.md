# GenAICodeUpdater - Code Management Assistant Memory

## Quick Start
- **Purpose**: Automates code updates from LLM output, parsing code blocks and applying them to projects
- **Use Case**: When Claude/LLM provides code changes, this tool extracts and applies them safely to your codebase
- **Language**: Python 3.7+

## Key Commands
```bash
# Installation
pip install -r requirements.txt
# Or install as package
pip install -e .

# Basic usage - clipboard content
cd /your/project && python -m llmcodeupdater.main --git-path .

# Specify content directly
python -m llmcodeupdater.main --git-path /path/to/project --content "```python..."

# Use content from file
python -m llmcodeupdater.main --git-path /path/to/project --content-file llm_output.txt

# Use project from config.json
python -m llmcodeupdater.main --use-config
```

## Core Modules
| Module | Lines | Function |
|--------|-------|----------|
| `main.py` | 204 | CLI entry point and orchestration |
| `mapping.py` | 263 | File creation/update logic |
| `code_parser.py` | 209 | Parse code blocks from LLM output |
| `file_encoding_handler.py` | 204 | Handle file encoding conversions |
| `input_handler.py` | 173 | Process CLI arguments and config |
| `reporting.py` | 162 | Generate markdown/JSON reports |
| `task_tracking.py` | 154 | Track file processing status |
| `ignore_handler.py` | 109 | Respect .gitignore/.treeignore |
| `backup.py` | 57 | Backup files before modification |
| `validation.py` | 41 | Validate code blocks |

## How It Works
1. **Input Processing** (`input_handler.py:30-98`) - Parse CLI args, get content from clipboard/file/direct input
2. **Code Block Parsing** (`code_parser.py:77-150`) - Extract ```language filename blocks from LLM output
3. **File Collection** (`main.py:41-70`) - Gather existing Python/Markdown files, respect ignore patterns
4. **Backup Creation** (`backup.py:15-45`) - Backup existing files with timestamp
5. **Content Validation** (`code_parser.py:36-68`) - Check for complete code, imports, etc.
6. **File Updates** (`mapping.py:45-120`) - Apply changes to files, create new ones if needed
7. **Report Generation** (`reporting.py:25-85`) - Create markdown and JSON reports of changes

## Configuration Files
- `config.json:1-10` - Project path configuration (references MyCodeTree2LLM setup)
- `.gitignore` - Files to ignore during processing
- `.treeignore` - Additional ignore patterns
- `.selectignore` - Selection-specific ignore patterns

## Testing
- Test files location: `tests/`
- How to run tests: `python -m pytest tests/`
- BDD tests: `tests/features/code_update.feature`
- Coverage: Comprehensive unit tests for all modules

## Integration Points
- Input formats: Clipboard text, file content, direct string input
- Output formats: Updated files, markdown reports, JSON reports
- Can connect with: MyCodeTree2LLM (shares config), any LLM output parser

## Common Issues & Solutions
- **No code blocks found**: Check LLM output has ```language filename format (`code_parser.py:77-120`)
- **File encoding errors**: Automatic UTF-8 conversion (`file_encoding_handler.py:85-150`)
- **Permission errors**: Ensures proper backup and directory creation (`main.py:33-38`)
- **Incomplete code blocks**: Validation detects missing imports/incomplete code (`code_parser.py:36-68`)

## Advanced Features
- **Centralized Storage**: Uses `CENTRALIZED_STORAGE` env var for backups/reports (`config.py:10-21`)
- **Task Tracking**: SQLite database tracks file processing history (`task_tracking.py:25-85`)
- **Performance Metrics**: Times operations and tracks success rates (`input_handler.py:37`)
- **Multi-format Support**: Handles Python, Markdown, and other file types (`main.py:41-70`)
- **Ignore Pattern Support**: Respects multiple ignore file types (`ignore_handler.py:25-60`)

## Code Block Detection Rules
- Pattern: ````language` followed by filename and code content
- Supports: Python (`.py`), Markdown (`.md`), generic files
- Validation: Checks for imports in Python, complete code structure
- File creation: Creates directories as needed for new files

## Backup Strategy
- Timestamp format: `YYYYMMDDHHMMSS`
- Backup location: Centralized storage or project-relative
- Recovery: Manual file restoration from backup directory
- Selective backup: Only existing files are backed up

## Report Outputs
- **Markdown Report**: Human-readable summary with file counts, errors
- **JSON Report**: Machine-readable data for automation
- **Error Report**: Detailed failure analysis for troubleshooting
- **Task Summary**: Database-backed processing history