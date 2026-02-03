# Things TUI Clone - Complete Implementation Roadmap

**Date Created**: November 23, 2025
**Status**: Ready for Development
**All Documentation**: Organized and indexed
**Database Access**: Method documented with SQL templates

---

## Executive Summary

You now have:
- ✅ **Complete Documentation**: 17 markdown files organized by category
- ✅ **Visual Reference**: 25 screenshots with descriptive names
- ✅ **Database Access Plan**: SQLite queries and Python templates
- ✅ **Implementation Guide**: Step-by-step instructions for data export
- ✅ **Architecture Details**: Full schema documentation

---

## Directory Structure Created

```
/Users/m/Desktop/
├── DOCUMENTATION_PLAN.md                    [MAIN ANALYSIS]
├── DATABASE_EXTRACTION_GUIDE.md              [DATA ACCESS]
├── IMPLEMENTATION_ROADMAP.md                 [THIS FILE]
│
├── Things_Documentation/
│   ├── DOCUMENTATION_INDEX.md
│   ├── Core_Features/
│   │   ├── Using_Tags.md
│   │   ├── Scheduling_To-Dos_in_Things.md
│   │   ├── Keyboard_Shortcuts_for_Mac.md
│   │   ├── Searching_and_Navigating_with_Quick_Find.md
│   │   ├── Writing_Notes_in_Things.md
│   │   ├── Creating_Repeating_To-Dos.md
│   │   └── Whats_new_in__the_all-new_Things.md
│   ├── Data_Export/
│   │   ├── Exporting_Your_Data.md
│   │   ├── Things_AppleScript_Guide.md
│   │   └── Things_URL_Scheme.md
│   ├── User_Experience/
│   │   ├── An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md
│   │   ├── Gather_it_all_in_one_place.md
│   │   ├── How_to_Prioritize_To-Dos_in_Things.md
│   │   ├── How_to_Deal_with_Waiting_To-Dos.md
│   │   └── Why_Some_To-Dos_Get_Stuck_and_How_to_Get_Them_Moving_Again.md
│   └── Reference/
│       ├── Markdown_Guide.md
│       └── Things3AppleScriptGuide.pdf
│
├── Things_Screenshots/
│   ├── SCREENSHOT_INDEX.md
│   ├── 01-inbox-overview.png
│   ├── 02-today-list-main.png
│   ├── ... [25 total screenshots]
│   └── 25-search-results-tags.png
│
└── organize_documentation.sh                 [UTILITY SCRIPT]

Project Directory: ~/ai/projects/uahis/
```

---

## Phase 1: Database Setup (This Week)

### 1.1 Copy Things Database

```bash
# Create data directory in project
mkdir -p ~/ai/projects/uahis/data/things-database

# Copy the database bundle (non-destructive)
cp -r ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ \
    ~/ai/projects/uahis/data/things-database/

# Extract path to main.sqlite
find ~/ai/projects/uahis/data/things-database -name "main.sqlite" -type f
# Should output something like:
# ~/ai/projects/uahis/data/things-database/ThingsData-xxxxx/Things Database.thingsdatabase/main.sqlite
```

### 1.2 Explore Database Schema

```bash
# List tables
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite ".tables"

# Expected output: TMTask, TMTag, TMArea, TMProject, etc.

# View TMTask schema
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite ".schema TMTask"
```

### 1.3 Run Test Queries

```bash
# Count total tasks
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT COUNT(*) as count FROM TMTask;"

# List all tags
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT title FROM TMTag ORDER BY title LIMIT 10;"

# Get today's tasks
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT title FROM TMTask LIMIT 5;"
```

### Deliverables for Phase 1:
- [ ] Database copied to `~/ai/projects/uahis/data/things-database/`
- [ ] Schema documented (save output of `.schema` to file)
- [ ] Sample queries tested and working
- [ ] Create `data/SCHEMA.md` with actual column names

---

## Phase 2: Database Abstraction Layer (Week 1-2)

### 2.1 Create Database Module

**File**: `~/ai/projects/uahis/uahis/db/things_db.py`

```python
import sqlite3
from typing import List, Dict, Optional
from datetime import date

class ThingsDatabase:
    """Wrapper around Things SQLite database"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    # Core queries for each list type
    def get_today_tasks(self) -> List[Dict]:
        """Tasks scheduled for today"""
        # See DATABASE_EXTRACTION_GUIDE.md for full implementation
        
    def get_upcoming_tasks(self) -> List[Dict]:
        """Tasks with future start dates"""
        
    def get_anytime_tasks(self) -> List[Dict]:
        """Active tasks with no date constraint"""
        
    def get_someday_tasks(self) -> List[Dict]:
        """Vague ideas without start date"""
        
    def get_inbox_tasks(self) -> List[Dict]:
        """Unprocessed tasks"""
        
    # Tag operations
    def get_tags(self) -> List[Dict]:
        """All tags with hierarchy"""
        
    def get_tasks_by_tag(self, tag_id: str) -> List[Dict]:
        """Tasks filtered by tag"""
        
    # Task operations
    def get_task_detail(self, task_id: str) -> Dict:
        """Complete task with all properties"""
        
    def get_task_checklist(self, task_id: str) -> List[Dict]:
        """Checklist items for task"""
        
    # Project/Area operations
    def get_projects(self) -> List[Dict]:
        """All projects"""
        
    def get_areas(self) -> List[Dict]:
        """All areas"""
        
    def get_project_tasks(self, project_id: str) -> List[Dict]:
        """Tasks in specific project"""
```

### 2.2 Create Configuration

**File**: `~/ai/projects/uahis/config/database.toml`

```toml
[database]
path = "~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/"
bundle_name = "Things Database.thingsdatabase"
sqlite_file = "main.sqlite"
read_only = true

[cache]
enable = true
ttl_seconds = 300  # Refresh every 5 minutes

[sync]
use_applescript = false  # Can enable for live updates
update_interval = 60  # seconds
```

### 2.3 Create Test Fixtures

**File**: `~/ai/projects/uahis/tests/fixtures/sample_queries.sql`

Create sample data for testing UI without Things app:

```sql
-- Sample tasks
INSERT INTO TMTask (id, title, notes, list) 
VALUES 
  ('task1', 'Review project proposal', 'Check the details', 'Today'),
  ('task2', 'Send email to client', 'Update on progress', 'Today'),
  ('task3', 'Research new tools', 'For Q4 planning', 'Anytime');

-- Sample tags
INSERT INTO TMTag (id, title) 
VALUES 
  ('tag1', 'Work'),
  ('tag2', 'Home'),
  ('tag3', 'Urgent');
```

### Deliverables for Phase 2:
- [ ] `uahis/db/things_db.py` with all queries implemented
- [ ] `config/database.toml` with settings
- [ ] Unit tests in `tests/test_database.py`
- [ ] Sample data fixtures for testing
- [ ] Database module fully tested with real data

---

## Phase 3: TUI Implementation - List Views (Week 2-3)

### 3.1 Implement List Widgets

**File**: `~/ai/projects/uahis/uahis/ui/views/list_view.py`

Using Textual framework:

```python
from textual.widget import Widget
from textual.containers import Container
from uahis.db.things_db import ThingsDatabase

class TaskListView(Widget):
    """Display tasks in a scrollable list"""
    
    def __init__(self, db: ThingsDatabase, list_type: str):
        self.db = db
        self.list_type = list_type  # today, upcoming, anytime, someday
        self.tasks = []
        
    def render(self):
        """Render task list"""
        # Format and display tasks from database
        
    def load_tasks(self):
        """Load tasks from database based on list_type"""
        if self.list_type == "today":
            self.tasks = self.db.get_today_tasks()
        elif self.list_type == "upcoming":
            self.tasks = self.db.get_upcoming_tasks()
        # ... etc
```

### 3.2 Build Navigation

**File**: `~/ai/projects/uahis/uahis/ui/app.py`

Main TUI application:

```python
from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from uahis.ui.views.list_view import TaskListView
from uahis.ui.panels.sidebar import Sidebar
from uahis.ui.panels.tag_manager import TagManager

class ThingsTUI(App):
    """Main Things TUI Application"""
    
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("cmd+1", "show_inbox", "Inbox"),
        ("cmd+2", "show_today", "Today"),
        ("cmd+3", "show_upcoming", "Upcoming"),
        ("cmd+4", "show_anytime", "Anytime"),
        ("cmd+5", "show_someday", "Someday"),
        ("cmd+n", "new_task", "New Task"),
    ]
    
    def compose(self) -> ComposeResult:
        yield Sidebar()
        yield TaskListView(self.db, "today")
        yield TagManager()
```

### 3.3 Keyboard Shortcuts

**File**: `~/ai/projects/uahis/config/keybindings.yaml`

```yaml
navigation:
  inbox: ['cmd+1']
  today: ['cmd+2']
  upcoming: ['cmd+3']
  anytime: ['cmd+4']
  someday: ['cmd+5']
  logbook: ['cmd+6']

editing:
  new_task: ['cmd+n']
  new_todo_below: ['space']
  edit_task: ['return']
  complete_task: ['cmd+k']
  cancel_task: ['cmd+alt+k']

scheduling:
  show_when: ['cmd+s']
  start_today: ['cmd+t']
  start_evening: ['cmd+e']
  start_anytime: ['cmd+r']
  start_someday: ['cmd+o']

tags:
  open_tag_manager: ['cmd+ctrl+t']
  tag_current: ['cmd+shift+t']
```

### Deliverables for Phase 3:
- [ ] All four list views (Today, Upcoming, Anytime, Someday) implemented
- [ ] Basic keyboard navigation working
- [ ] Database queries populating views
- [ ] Sidebar showing all lists
- [ ] Basic styling and layout

---

## Phase 4: Tag System & Filtering (Week 3-4)

### 4.1 Tag Manager Widget

**File**: `~/ai/projects/uahis/uahis/ui/panels/tag_manager.py`

```python
class TagManager(Widget):
    """Display and manage tags"""
    
    def __init__(self, db: ThingsDatabase):
        self.db = db
        self.tags = db.get_tags()
        self.selected_tag = None
        
    def render(self):
        """Display tag list with hierarchy"""
        
    def assign_shortcut(self, tag_id: str, key: str):
        """Assign keyboard shortcut to tag"""
        
    def filter_by_tag(self, tag_id: str):
        """Filter current list by tag"""
```

### 4.2 Tag Filtering Logic

```python
def filter_tasks_by_tags(self, task_list: List[Dict], tag_ids: List[str]) -> List[Dict]:
    """Filter tasks that have ALL specified tags"""
    return [
        task for task in task_list
        if all(tag_id in task.get('tags', []) for tag_id in tag_ids)
    ]
```

### Deliverables for Phase 4:
- [ ] Tag manager panel fully functional
- [ ] Tag filtering works on all lists
- [ ] Keyboard shortcut assignment for tags
- [ ] Multiple tag filtering (AND logic)
- [ ] Tag hierarchy display

---

## Phase 5: Task Editing & Details (Week 4-5)

### 5.1 Task Detail Panel

**File**: `~/ai/projects/uahis/uahis/ui/panels/task_detail.py`

```python
class TaskDetailPanel(Widget):
    """Show and edit task details"""
    
    def __init__(self, db: ThingsDatabase, task_id: str):
        self.db = db
        self.task = db.get_task_detail(task_id)
        
    def render(self):
        """Display task title, notes, tags, dates, checklist"""
        
    def update_title(self, new_title: str):
        """Update task title (requires Things integration)"""
```

### 5.2 Quick Entry Dialog

```python
class QuickEntryDialog(Widget):
    """Add new task quickly (Cmd+Ctrl+Space)"""
    
    def __init__(self, db: ThingsDatabase):
        self.db = db
        
    def compose(self) -> ComposeResult:
        yield Input(placeholder="Task title...")
        yield Input(placeholder="Notes...")
        yield Input(placeholder="Tags (comma-separated)...")
```

### Deliverables for Phase 5:
- [ ] Task detail view with all properties
- [ ] Quick entry dialog for new tasks
- [ ] Note editing with markdown support
- [ ] Checklist item management
- [ ] Date/deadline picker

---

## Phase 6: Integration & Refinement (Week 5-6)

### 6.1 AppleScript Integration

Enable bidirectional sync:

```bash
# Create script to update Things from TUI changes
scripts/applescript/update_task.scpt

# Create script to read live updates
scripts/applescript/get_events.scpt
```

### 6.2 Data Persistence

Write back to Things database or use AppleScript:

```python
def create_task(self, title: str, notes: str = "", tags: List[str] = []) -> str:
    """Create new task (via AppleScript to Things)"""
    # Use AppleScript to create task while Things is running
    # Falls back to direct DB write when Things is closed
```

### 6.3 Search Implementation

```python
def search(self, query: str) -> List[Dict]:
    """Full-text search across tasks, notes, tags"""
    # Implement Quick Find equivalent
```

### Deliverables for Phase 6:
- [ ] Full create/update/delete operations
- [ ] Live sync with Things app
- [ ] Search across all tasks
- [ ] Settings/configuration UI
- [ ] Data export to JSON/CSV

---

## Implementation Checklist

### Database Phase
- [ ] Copy Things database to project
- [ ] Document actual schema
- [ ] Implement `ThingsDatabase` class
- [ ] Test all query methods
- [ ] Create test fixtures

### UI Phase
- [ ] Set up Textual framework
- [ ] Implement list views
- [ ] Add keyboard shortcuts
- [ ] Build sidebar navigation
- [ ] Create task detail panel

### Features Phase
- [ ] Tag manager and filtering
- [ ] Quick entry dialog
- [ ] Task editing
- [ ] Note/markdown support
- [ ] Checklist management

### Polish Phase
- [ ] AppleScript integration
- [ ] Settings/config UI
- [ ] Full keyboard shortcut set
- [ ] Search functionality
- [ ] Data export

---

## Key Files to Create

```
uahis/
├── db/
│   ├── __init__.py
│   └── things_db.py                    [Database wrapper]
├── ui/
│   ├── app.py                          [Main TUI app]
│   ├── views/
│   │   ├── __init__.py
│   │   ├── list_view.py               [Task list display]
│   │   └── search_view.py             [Search results]
│   └── panels/
│       ├── __init__.py
│       ├── sidebar.py                 [Navigation sidebar]
│       ├── tag_manager.py             [Tag management]
│       ├── task_detail.py             [Task detail view]
│       └── quick_entry.py             [Quick add dialog]
├── models/
│   ├── task.py                         [Task data model]
│   ├── tag.py                          [Tag data model]
│   └── project.py                      [Project data model]
├── utils/
│   ├── applescript.py                 [AppleScript interface]
│   ├── export.py                      [Export to JSON/CSV]
│   └── shortcuts.py                   [Keyboard shortcuts]
└── config/
    ├── database.toml                  [Database settings]
    └── keybindings.yaml               [Keyboard config]
```

---

## Testing Strategy

### Unit Tests
```bash
tests/
├── test_database.py          # Database query tests
├── test_models.py            # Model validation
└── test_utils.py             # Utility function tests
```

### Integration Tests
```bash
tests/
└── test_ui.py                # UI component tests with fixtures
```

### Manual Testing
1. Test each keyboard shortcut
2. Test tag filtering with multiple tags
3. Test task creation/editing
4. Test with real Things data
5. Test export functionality

---

## Success Criteria

**MVP (Minimum Viable Product)**:
- [ ] Display all 4 default lists (Today, Upcoming, Anytime, Someday)
- [ ] Basic keyboard navigation
- [ ] Tag filtering
- [ ] View task details
- [ ] Read-only access to Things database

**v1.0**:
- [ ] Create/edit/delete tasks (via AppleScript)
- [ ] Full keyboard shortcut support
- [ ] Quick entry dialog
- [ ] Search functionality
- [ ] Settings UI

**v1.1+**:
- [ ] Live sync with Things
- [ ] Project/area support
- [ ] Advanced filtering
- [ ] Custom themes
- [ ] Data export

---

## Documents Reference

| Document | Purpose | Location |
|----------|---------|----------|
| DOCUMENTATION_PLAN.md | Complete analysis | `/Users/m/Desktop/` |
| DATABASE_EXTRACTION_GUIDE.md | Data access methods | `/Users/m/Desktop/` |
| IMPLEMENTATION_ROADMAP.md | This document | `/Users/m/Desktop/` |
| DOCUMENTATION_INDEX.md | All docs index | `Things_Documentation/` |
| SCREENSHOT_INDEX.md | Visual reference | `Things_Screenshots/` |

---

## Next Action

```bash
# Step 1: Copy database
cp -r ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ \
    ~/ai/projects/uahis/data/things-database/

# Step 2: Verify structure
find ~/ai/projects/uahis/data/things-database -name "main.sqlite"

# Step 3: Test first query
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT COUNT(*) FROM TMTask;"

# Step 4: Begin Phase 1 implementation
cd ~/ai/projects/uahis
python -m pytest tests/test_database.py
```

---

**Ready to start?** Begin with Phase 1: Database Setup → Phase 2: Database Abstraction → Phase 3: TUI Implementation

All documentation is organized and accessible. All screenshots are labeled and categorized. Database access method is documented with working code templates.

Good luck with the Things TUI clone!
