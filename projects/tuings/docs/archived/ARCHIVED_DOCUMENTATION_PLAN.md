# Things TUI Clone - Complete Documentation & Data Export Plan

## Summary

This document outlines the complete research, organization, and data export strategy for the Things TUI clone project. All documentation from Desktop has been analyzed, screenshots catalogued, and a systematic approach to database export is provided.

---

## Part 1: Documentation Files Analysis

### Core Documentation Files (13 files)

#### Feature Documentation:
1. **Whats_new_in__the_all-new_Things.md** - Overview of Things 3 features
2. **Using_Tags.md** - Tag creation, management, filtering, keyboard shortcuts
3. **Scheduling_To-Dos_in_Things.md** - Default lists (Today, Upcoming, Anytime, Someday)
4. **Searching_and_Navigating_with_Quick_Find.md** - Search and navigation features
5. **Writing_Notes_in_Things.md** - Notes and markdown support
6. **Creating_Repeating_To-Dos.md** - Recurring task implementation
7. **How_to_Prioritize_To-Dos_in_Things.md** - Prioritization strategies
8. **Keyboard_Shortcuts_for_Mac.md** - Complete keyboard shortcut reference
9. **Markdown_Guide.md** - Markdown formatting in Things
10. **An_In-Depth_Look_at_Today,_Upcoming,_Anytime,_and_Someday.md** - List semantics

#### Integration & Data Access:
11. **Things_AppleScript_Guide.md** - AppleScript automation (comprehensive)
12. **Things_URL_Scheme.md** - URL scheme for external integration
13. **Exporting_Your_Data.md** - Official data export procedure

#### Additional Resources:
14. **Things3AppleScriptGuide.pdf** - PDF version of AppleScript guide
15. **prompt.md** - Project requirements and goals

---

## Part 2: Screenshot Catalog (25 screenshots)

### Current State
- **Location**: `/Users/m/Desktop/Screenshot_*.png`
- **Count**: 25 images
- **Size Range**: 29KB to 206KB
- **Naming**: Generic timestamp format (05.42.50 through 05.45.06)

### Screenshot Renaming Strategy

Screenshots should be renamed to reflect their content. Approximate categorization:

```
Screenshots appear to cover:
- Tag management interface
- List views (Today, Upcoming, Anytime, Someday)
- Project/Area creation
- Quick Entry panel
- Keyboard shortcuts panel
- Tag filtering
- Search/Quick Find interface
- Note editing
- Checklist items
```

**Recommended naming pattern**:
```
01-things-inbox-overview.png
02-things-today-list.png
03-things-upcoming-week-view.png
04-things-anytime-list.png
05-things-someday-list.png
06-things-tag-manager.png
07-things-quick-entry.png
08-things-tag-filtering.png
09-things-keyboard-shortcuts.png
10-things-note-editing.png
... etc
```

---

## Part 3: Database Export & Access Strategy

### Official Export Method (from Exporting_Your_Data.md)

**Database Location**:
```
~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-xxxxx/
Things Database.thingsdatabase
```

**Database File Structure**:
```
Things Database.thingsdatabase (Bundle)
└── main.sqlite (actual SQLite database)
```

### Three Data Export Approaches

#### Approach 1: Direct SQLite Export (RECOMMENDED for TUI Clone)
```bash
# Prerequisites:
# 1. Quit Things 3 on Mac
# 2. Find & copy the database

# Step 1: Locate the database bundle
open "~/Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/"

# Step 2: Copy (don't move!) the bundle
cp -r ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-*/\ Things\ Database.thingsdatabase ~/Desktop/

# Step 3: Extract the actual SQLite file
cd ~/Desktop/Things\ Database.thingsdatabase
sqlite3 main.sqlite ".tables"

# Step 4: Explore the schema
sqlite3 main.sqlite ".schema"

# Step 5: Query the database
sqlite3 main.sqlite "SELECT * FROM TMTask LIMIT 5;"
```

**Advantages**:
- Direct access to all data
- No external tools needed
- Full schema understanding
- Can be read while Things is closed

#### Approach 2: AppleScript Extraction (for Mac integration)
```applescript
tell application "Things3"
    -- Get all to-dos
    set allToDos to every to do
    
    -- Iterate and export
    repeat with toDo in allToDos
        set name to name of toDo
        set notes to notes of toDo
        set tags to tag names of toDo
        -- Export to file
    end repeat
end tell
```

**Use Cases**:
- Programmatic access while Things is running
- Event-based triggers
- Real-time synchronization

#### Approach 3: URL Scheme (for external app integration)
```
things:///show?query=inbox
things:///add?title=New Task&when=today&tags=Errand
things:///search?query=vacation
```

**Use Cases**:
- Create tasks from external tools
- Navigate to specific lists
- Basic automation

---

## Part 4: Key Database Tables (SQLite Schema)

### Important Tables to Query

From AppleScript and Things documentation, the key tables are:

1. **TMTask** - Individual to-dos
   - Columns: id, title, notes, dueDate, dueDateTime, activationDate, etc.
   - Properties: completed, canceled, status

2. **TMProject** - Projects
   - Columns: id, title, notes, dueDate, area references
   - Relationships: contains TMTasks

3. **TMArea** - Areas
   - Columns: id, title, color
   - Relationships: contains TMProjects

4. **TMTag** - Tags
   - Columns: id, title, parent relationships
   - Properties: Supports hierarchical structure

5. **TMChecklistItem** - Checklist items within tasks
   - Columns: id, title, completed, parent task reference

6. **TMHeading** - Headings within projects
   - Columns: id, title, project reference

### Queries to Extract Data

```sql
-- Get all tasks with tags
SELECT t.id, t.title, t.notes, t.activationDate, 
       GROUP_CONCAT(tag.title) as tags
FROM TMTask t
LEFT JOIN TMTaskTag tt ON t.id = tt.task_id
LEFT JOIN TMTag tag ON tt.tag_id = tag.id
GROUP BY t.id;

-- Get projects with task counts
SELECT p.id, p.title, COUNT(t.id) as task_count
FROM TMProject p
LEFT JOIN TMTask t ON p.id = t.project_id
GROUP BY p.id;

-- Get areas with nested structure
SELECT a.id, a.title, 
       COUNT(DISTINCT p.id) as project_count,
       COUNT(DISTINCT t.id) as task_count
FROM TMArea a
LEFT JOIN TMProject p ON a.id = p.area_id
LEFT JOIN TMTask t ON p.id = t.project_id
GROUP BY a.id;

-- Get all tags with hierarchy
SELECT t1.id, t1.title, t2.title as parent_tag
FROM TMTag t1
LEFT JOIN TMTag t2 ON t1.parent_id = t2.id;
```

---

## Part 5: Implementation Roadmap

### Phase 1: Data Exploration (This Week)
- [ ] Quit Things 3
- [ ] Copy database bundle to project directory
- [ ] Extract main.sqlite
- [ ] Run `.schema` to understand structure
- [ ] Execute sample queries
- [ ] Document all tables and relationships

### Phase 2: Database Wrapper (Week 2)
Create Python module: `uahis/db/things_db.py`
```python
class ThingsDatabase:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        
    def get_all_tasks(self):
        # Return list of tasks
        
    def get_tasks_by_list(self, list_type):
        # Return tasks in Today, Upcoming, Anytime, Someday
        
    def get_tags(self):
        # Return all tags with hierarchy
        
    def get_projects(self):
        # Return all projects with nested tasks
```

### Phase 3: TUI Implementation (Week 3+)
- Build list views using Textual
- Implement keyboard shortcuts
- Add tag filtering
- Integrate database queries

### Phase 4: Sync & Export (Week 4+)
- Read-only sync from Things database
- Export functionality to other formats
- AppleScript integration for real-time events

---

## Part 6: Key Findings from Documentation

### Default Lists (Most Critical)
- **Today** (with optional "This Evening" section)
- **Upcoming** (with 7-day view at top)
- **Anytime** (active tasks, no date constraint)
- **Someday** (vague ideas, no start date)
- **Inbox** (temporary staging)
- **Logbook** (completed/canceled archive)

### Tag System
- Tags can be hierarchical (parent-child relationships)
- Can be assigned keyboard shortcuts (Ctrl + key)
- Support filtering by multiple tags simultaneously
- Can be assigned to to-dos, projects, and areas
- Inherited tags don't show on children but are queryable

### Keyboard Shortcuts (Critical for TUI)
- **Cmd N** - New to-do
- **Cmd S** - Show "When" picker
- **Cmd T** - Start Today
- **Cmd E** - Start This Evening
- **Cmd R** - Start Anytime
- **Cmd O** - Start Someday
- **Ctrl + shortcut** - Toggle tag on/off
- **Ctrl + Opt + shortcut** - Filter by tag
- **Cmd 1-6** - Navigate to built-in lists

### AppleScript Key Commands
- Get all to-dos: `to dos of list "Today"`
- Get projects: `projects`
- Get areas: `areas`
- Set tags: `tag names of toDo`
- Move items: `move toDo to list "Today"`
- Complete items: `set status of toDo to completed`

---

## Part 7: Next Steps

1. **Organize Desktop Files**
   - Create `/Desktop/Things_Documentation/` folder
   - Move all .md files there
   - Create `/Desktop/Things_Screenshots/` folder
   - Rename screenshots with descriptive names
   - Archive and organize by category

2. **Extract Database**
   ```bash
   # Safe copy (non-destructive)
   cp -r ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ \
       ~/ai/projects/uahis/data/things-database-backup/
   ```

3. **Create Data Dictionary**
   - Document all tables
   - List all columns and data types
   - Show relationships and foreign keys
   - Provide sample queries for each use case

4. **Build Database Layer**
   - Create Python wrapper for Things SQLite DB
   - Write abstraction for data access
   - Build export functions to JSON/CSV

5. **Start TUI Development**
   - Use database layer in Textual widgets
   - Implement list views with real Things data
   - Add keyboard shortcuts mapping

---

## File Structure After Organization

```
/Users/m/Desktop/
├── DOCUMENTATION_PLAN.md (this file)
├── Things_Documentation/
│   ├── Core_Features/
│   │   ├── Using_Tags.md
│   │   ├── Scheduling_To-Dos_in_Things.md
│   │   ├── Keyboard_Shortcuts_for_Mac.md
│   │   └── ...
│   ├── Data_Export/
│   │   ├── Exporting_Your_Data.md
│   │   ├── Things_AppleScript_Guide.md
│   │   └── Things_URL_Scheme.md
│   └── Reference/
│       ├── Markdown_Guide.md
│       └── Things3AppleScriptGuide.pdf
├── Things_Screenshots/
│   ├── 01-interface-overview.png
│   ├── 02-today-list.png
│   ├── 03-tag-manager.png
│   └── ... (25 total)
└── prompt.md
```

---

## Quick Reference: Things TUI Requirements

| Feature | Priority | Database Table | Implementation |
|---------|----------|-----------------|-----------------|
| List management (4 lists) | CRITICAL | TMTask | Core view logic |
| Tags | HIGH | TMTag, TMTaskTag | Filter/search |
| Keyboard shortcuts | HIGH | Config | Input handler |
| Projects/Areas | HIGH | TMProject, TMArea | Nested views |
| Checklist items | MEDIUM | TMChecklistItem | Within tasks |
| Notes/Markdown | MEDIUM | TMTask.notes | Text rendering |
| Reminders | LOW | TMTask.dueDateTime | Timer system |

---

## Summary

**Total Documentation**: 15 files + 25 screenshots
**Database Access Method**: SQLite (main.sqlite)
**Primary Tables**: TMTask, TMProject, TMArea, TMTag (4 core tables)
**Key Shortcuts to Implement**: 30+ keyboard combinations
**Export Strategy**: Read database when Things is closed, use AppleScript for live updates

**Next Action**: Copy database bundle and run `sqlite3 main.sqlite ".tables"` to confirm structure.

---

## ARCHIVAL NOTE

This document is from Session 1 planning phase (November 23, 2025).
Parts 1-4 and 6 remain useful for database schema and keyboard shortcut reference.
Parts 5-7 describe old Python/Textual architecture (superseded by TypeScript/BDD in tuings/).

**Current Status**: Use docs/analysis/PROMPT.md for current requirements.
See tuings/PROGRESS.md for actual Phase 1-2 completion status.