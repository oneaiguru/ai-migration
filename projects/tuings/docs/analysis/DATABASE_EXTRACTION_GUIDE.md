# Things 3 Database Extraction & Analysis Guide

## Quick Start: Copy & Explore Database

### Step 1: Safely Copy the Database

```bash
# Create project data directory
mkdir -p ~/ai/projects/uahis/data/things-database

# Copy the Things database bundle (non-destructive)
cp -r ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ \
    ~/ai/projects/uahis/data/things-database/

# Extract the main SQLite database
cd ~/ai/projects/uahis/data/things-database/
find . -name "main.sqlite" -type f
```

### Step 2: Explore Database Tables

```bash
# Navigate to database location
DB_PATH=~/ai/projects/uahis/data/things-database

# List all tables
sqlite3 "$DB_PATH/ThingsData-*/Things Database.thingsdatabase/main.sqlite" ".tables"

# Or use the extracted path if you extract it:
# sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite ".tables"
```

### Step 3: View Database Schema

```bash
# View full schema
sqlite3 "$DB_PATH" ".schema"

# View schema for specific table
sqlite3 "$DB_PATH" ".schema TMTask"
sqlite3 "$DB_PATH" ".schema TMTag"
```

---

## Database Structure

### Core Tables (Must Understand)

#### 1. **TMTask** - Individual To-Dos
```
Primary store for all to-do items and projects
```

**Key Columns**:
- `id` (TEXT, PRIMARY KEY) - Unique identifier
- `title` (TEXT) - Task title
- `notes` (TEXT) - Task notes with markdown
- `dueDate` (TIMESTAMP) - Start date (when task activates)
- `dueDateOffset` (INTEGER) - Offset from 0 (today)
- `dueDateTime` (TIMESTAMP) - Specific time for start date
- `deadline` (TIMESTAMP) - Hard deadline
- `deadlineOffset` (INTEGER) - Offset for deadline
- `completionDate` (TIMESTAMP) - When completed/canceled
- `creationDate` (TIMESTAMP) - When created
- `status` (INTEGER) - 0=incomplete, 1=completed, 2=canceled
- `type` (INTEGER) - 0=task, 1=project, 2=heading (probably)
- `list` (INTEGER) - Which list: Inbox, Today, Upcoming, Anytime, Someday, Logbook
- `project` (TEXT, FOREIGN KEY) - Parent project ID
- `area` (TEXT, FOREIGN KEY) - Parent area ID
- `heading` (TEXT, FOREIGN KEY) - Parent heading ID
- `parent` (TEXT) - Generic parent reference
- `index` (INTEGER) - Sort order

#### 2. **TMTag** - Tags
```
All available tags in the system
```

**Key Columns**:
- `id` (TEXT, PRIMARY KEY) - Tag ID
- `title` (TEXT) - Tag name
- `parent` (TEXT, FOREIGN KEY) - Parent tag ID (for hierarchy)
- `index` (INTEGER) - Order in tag list

#### 3. **TMTaskTag** - Task-Tag Relationships
```
Junction table linking tasks to tags (many-to-many)
```

**Key Columns**:
- `task` (TEXT, FOREIGN KEY) - Task ID
- `tag` (TEXT, FOREIGN KEY) - Tag ID

#### 4. **TMProject** - Projects (Also in TMTask as type=1)
```
Projects are actually stored in TMTask with type=1
```

#### 5. **TMArea** - Areas
```
Top-level organization containers
```

**Key Columns**:
- `id` (TEXT, PRIMARY KEY) - Area ID
- `title` (TEXT) - Area name
- `index` (INTEGER) - Order in sidebar

#### 6. **TMChecklistItem** - Checklist Items
```
Items within a task's checklist
```

**Key Columns**:
- `id` (TEXT, PRIMARY KEY) - Item ID
- `task` (TEXT, FOREIGN KEY) - Parent task ID
- `title` (TEXT) - Checklist item text
- `status` (INTEGER) - 0=incomplete, 1=completed, 2=canceled
- `index` (INTEGER) - Order in checklist

#### 7. **TMHeading** - Headings within Projects
```
Section dividers in projects
```

**Key Columns**:
- `id` (TEXT, PRIMARY KEY) - Heading ID
- `project` (TEXT, FOREIGN KEY) - Parent project ID
- `title` (TEXT) - Heading text
- `archived` (BOOLEAN) - Whether archived

---

## Essential SQL Queries

### Get All Tasks for Today

```sql
SELECT id, title, notes, dueDate
FROM TMTask
WHERE list = 'Today'  -- or appropriate list ID
  AND status = 0      -- not completed
ORDER BY index;
```

### Get Tasks by List Type

```sql
-- Tasks in Anytime (active, no date constraint)
SELECT id, title, dueDate
FROM TMTask
WHERE list = 'Anytime'
  AND status = 0
ORDER BY index;

-- Tasks in Someday (vague, no commitment)
SELECT id, title
FROM TMTask
WHERE list = 'Someday'
  AND status = 0;

-- Tasks in Upcoming (future dates)
SELECT id, title, dueDate
FROM TMTask
WHERE list = 'Upcoming'
  AND dueDate > datetime('now')
  AND status = 0
ORDER BY dueDate;
```

### Get Task with Tags

```sql
SELECT 
    t.id,
    t.title,
    t.notes,
    t.dueDate,
    GROUP_CONCAT(tag.title, ', ') as tags
FROM TMTask t
LEFT JOIN TMTaskTag tt ON t.id = tt.task
LEFT JOIN TMTag tag ON tt.tag = tag.id
WHERE t.id = 'TASK_ID'
GROUP BY t.id;
```

### Get All Tags with Hierarchy

```sql
SELECT 
    t1.id,
    t1.title,
    t2.title as parent_tag,
    COUNT(DISTINCT tt.task) as task_count
FROM TMTag t1
LEFT JOIN TMTag t2 ON t1.parent = t2.id
LEFT JOIN TMTaskTag tt ON t1.id = tt.tag
GROUP BY t1.id
ORDER BY CASE WHEN t1.parent IS NULL THEN 0 ELSE 1 END,
         t1.index;
```

### Get Projects with Task Counts

```sql
SELECT 
    p.id,
    p.title,
    COUNT(DISTINCT CASE WHEN t.status = 0 THEN t.id END) as active_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 1 THEN t.id END) as completed_tasks,
    p.dueDate,
    p.completionDate
FROM TMTask p
LEFT JOIN TMTask t ON p.id = t.project
WHERE p.type = 1  -- project type
  AND p.status IN (0, 1)  -- not canceled
GROUP BY p.id
ORDER BY p.index;
```

### Get Areas with Projects

```sql
SELECT 
    a.id,
    a.title,
    COUNT(DISTINCT p.id) as project_count,
    COUNT(DISTINCT CASE WHEN t.status = 0 THEN t.id END) as active_task_count
FROM TMArea a
LEFT JOIN TMTask p ON a.id = p.area AND p.type = 1
LEFT JOIN TMTask t ON p.id = t.project AND t.status = 0
GROUP BY a.id
ORDER BY a.index;
```

### Get Task Details with Everything

```sql
SELECT 
    t.id,
    t.title,
    t.notes,
    t.dueDate,
    t.dueDateTime,
    t.deadline,
    t.status,
    t.creationDate,
    t.completionDate,
    (SELECT GROUP_CONCAT(tag.title, ', ')
     FROM TMTaskTag tt
     JOIN TMTag tag ON tt.tag = tag.id
     WHERE tt.task = t.id) as tags,
    (SELECT COUNT(*)
     FROM TMChecklistItem ci
     WHERE ci.task = t.id
       AND ci.status = 0) as pending_checklist_items,
    (SELECT COUNT(*)
     FROM TMChecklistItem ci
     WHERE ci.task = t.id) as total_checklist_items,
    a.title as area,
    p.title as project,
    h.title as heading
FROM TMTask t
LEFT JOIN TMArea a ON t.area = a.id
LEFT JOIN TMTask p ON t.project = p.id
LEFT JOIN TMHeading h ON t.heading = h.id
WHERE t.id = 'TASK_ID';
```

### Get Checklist Items for a Task

```sql
SELECT 
    id,
    title,
    status,
    index
FROM TMChecklistItem
WHERE task = 'TASK_ID'
ORDER BY index;
```

---

## Python Implementation Template

### Basic Database Wrapper

```python
import sqlite3
from typing import List, Dict, Optional
from datetime import datetime, date

class ThingsDatabase:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    def get_today_tasks(self) -> List[Dict]:
        """Get all tasks scheduled for today"""
        query = """
        SELECT id, title, notes, dueDate, index
        FROM TMTask
        WHERE list = 'Today'
          AND status = 0
        ORDER BY index
        """
        cursor = self.conn.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_upcoming_tasks(self) -> List[Dict]:
        """Get tasks with future start dates"""
        query = """
        SELECT id, title, dueDate, index
        FROM TMTask
        WHERE list = 'Upcoming'
          AND status = 0
        ORDER BY dueDate, index
        """
        cursor = self.conn.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_anytime_tasks(self) -> List[Dict]:
        """Get active tasks with no date constraints"""
        query = """
        SELECT id, title, index
        FROM TMTask
        WHERE list = 'Anytime'
          AND status = 0
        ORDER BY index
        """
        cursor = self.conn.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_someday_tasks(self) -> List[Dict]:
        """Get someday tasks (vague ideas)"""
        query = """
        SELECT id, title, creationDate
        FROM TMTask
        WHERE list = 'Someday'
          AND status = 0
        ORDER BY creationDate DESC
        """
        cursor = self.conn.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_task_details(self, task_id: str) -> Optional[Dict]:
        """Get complete details for a single task"""
        query = """
        SELECT 
            t.id, t.title, t.notes, t.dueDate, t.deadline,
            t.status, t.creationDate, t.completionDate,
            (SELECT GROUP_CONCAT(tag.title, ', ')
             FROM TMTaskTag tt
             JOIN TMTag tag ON tt.tag = tag.id
             WHERE tt.task = t.id) as tags,
            a.title as area,
            p.title as project
        FROM TMTask t
        LEFT JOIN TMArea a ON t.area = a.id
        LEFT JOIN TMTask p ON t.project = p.id
        WHERE t.id = ?
        """
        cursor = self.conn.execute(query, (task_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    def get_tags(self) -> List[Dict]:
        """Get all tags with parent relationships"""
        query = """
        SELECT 
            t.id, t.title, t.parent,
            (SELECT title FROM TMTag WHERE id = t.parent) as parent_title
        FROM TMTag t
        ORDER BY t.index
        """
        cursor = self.conn.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    
    def get_tasks_by_tag(self, tag_id: str) -> List[Dict]:
        """Get all tasks with a specific tag"""
        query = """
        SELECT 
            t.id, t.title, t.dueDate
        FROM TMTask t
        JOIN TMTaskTag tt ON t.id = tt.task
        WHERE tt.tag = ?
          AND t.status = 0
        ORDER BY t.dueDate, t.index
        """
        cursor = self.conn.execute(query, (tag_id,))
        return [dict(row) for row in cursor.fetchall()]
    
    def close(self):
        """Close database connection"""
        self.conn.close()


# Usage example
if __name__ == "__main__":
    db = ThingsDatabase("~/ai/projects/uahis/data/things-database/main.sqlite")
    
    today_tasks = db.get_today_tasks()
    print(f"Today's tasks: {len(today_tasks)}")
    for task in today_tasks:
        print(f"  - {task['title']}")
    
    tags = db.get_tags()
    print(f"\nAvailable tags: {len(tags)}")
    for tag in tags:
        print(f"  - {tag['title']}")
    
    db.close()
```

---

## List IDs Reference

Based on AppleScript documentation, the system lists are:
- `Inbox` - Temporary staging
- `Today` - Current day priorities
- `Upcoming` - Future dated tasks
- `Anytime` - Active, unscheduled
- `Someday` - Vague ideas
- `Logbook` - Completed/canceled

(Note: Actual database storage may use internal IDs rather than names)

---

## Steps to Implement Data Access

1. **Copy Database**
   ```bash
   cp -r ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ \
       ~/ai/projects/uahis/data/
   ```

2. **Examine Schema**
   ```bash
   sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite ".tables"
   sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite ".schema TMTask"
   ```

3. **Test Queries**
   ```bash
   # Test accessing today's tasks
   sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
       "SELECT COUNT(*) as task_count FROM TMTask;"
   ```

4. **Create Python Wrapper**
   - Copy template above to `~/ai/projects/uahis/uahis/db/things_db.py`
   - Update queries based on actual schema
   - Test with sample data

5. **Integrate with Textual TUI**
   - Import `ThingsDatabase` in view classes
   - Use queries to populate list widgets
   - Handle database updates for CRUD operations

---

## Important Notes

- **Database is Read-Only**: Things uses the database actively; consider:
  - Reading when Things is closed
  - Using AppleScript for live updates
  - Creating a copy for testing

- **Date Handling**: Things uses various date formats and offsets
  - Check actual column types with `.schema`
  - May use timestamps, offsets, or custom formats

- **List Organization**: Verify whether "list" column stores names or IDs
  - May need reference table lookups
  - Test with actual query results

- **Sync Awareness**: Understand if database includes:
  - Local-only changes
  - Sync metadata
  - Deleted items (soft delete vs hard delete)

---

## Quick Test Commands

```bash
# Count total tasks
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT COUNT(*) FROM TMTask;"

# List all tables
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite ".tables"

# Show schema of TMTask
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    ".schema TMTask" | head -20

# Count tasks by status
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT status, COUNT(*) FROM TMTask GROUP BY status;"

# List all tags
sqlite3 ~/ai/projects/uahis/data/things-database/main.sqlite \
    "SELECT title FROM TMTag ORDER BY title;"
```

---

## Next: Apply to TUI Implementation

Once you've explored the schema and confirmed the queries:

1. Update `uahis/db/things_db.py` with real column names
2. Create test data fixtures
3. Build view classes that consume database queries
4. Implement keyboard shortcuts bound to database operations
5. Create sync mechanism with Things app

See `DOCUMENTATION_PLAN.md` for architecture overview.
