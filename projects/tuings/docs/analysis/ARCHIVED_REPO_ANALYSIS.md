# Things MCP Analysis & TUI Strategy

**Analysis Date**: November 23, 2025  
**Focus**: Leveraging existing MCP implementations for TUI clone foundation

---

## Executive Summary

You have **two excellent MCP server implementations**:
1. **things-mcp-main** (TypeScript) - Things URL Scheme wrapper for Claude Desktop
2. **things-mcp-master** (Python) - Full Things database + URL Scheme access

For your **TUI project**, the TypeScript approach is better suited. This document outlines:
- How to leverage these existing implementations
- Database access strategies
- Architecture decisions for the TUI
- Avoiding duplication while building incrementally

---

## Repository Comparison

### things-mcp-main (TypeScript) ✅ RECOMMENDED FOR TUI

**Strengths**:
- ✅ Clean, minimal TypeScript implementation
- ✅ Uses Things URL Scheme (no database dependency)
- ✅ MCP server pattern (good foundation for CLI/TUI)
- ✅ Simple: single `index.ts` file, ~580 lines
- ✅ Uses Zod for type validation
- ✅ Perfect foundation for extending to TUI

**Current Tools** (7 implemented):
- `add-todo` - Create single or multiple todos
- `add-project` - Create projects with nested todos
- `update` - Update existing todos
- `update-project` - Update existing projects
- `show` - Navigate to lists/items
- `search` - Search interface
- `json` - Batch operations
- `version` - Get Things version

**Stack**:
- Node.js + TypeScript
- @modelcontextprotocol/sdk
- Zod (validation)
- URLSearchParams (URL encoding)

**Gap**: No **database read** - only writes via URL scheme

---

### things-mcp-master (Python) 

**Strengths**:
- ✅ Full database access (read Things.py library)
- ✅ Comprehensive tools (20+ operations)
- ✅ Data formatting utilities (excellent patterns)
- ✅ Full test suite (51 test cases)

**Current Tools** (20+ implemented):
- List views (inbox, today, upcoming, anytime, someday, logbook, trash)
- Todo operations (get, search, advanced search)
- Project/Area operations
- Tag operations
- Recent items tracking

**Gap**: Database read only - no write operations (uses URL scheme separately)

---

## Strategic Decision: TypeScript for TUI

**Why TypeScript over Python for TUI**:

1. **Better CLI/TUI ecosystem**:
   - Ink.js / Paste.js (terminal components)
   - Blessed (terminal UI - excellent)
   - Commander.js (CLI parsing)
   - Better async/promise handling for real-time UI

2. **Unified stack**:
   - One language (TypeScript)
   - One runtime (Node.js)
   - Easier dependency management

3. **Faster development**:
   - things-mcp-main is minimal and clean
   - Easy to extend with database layer
   - Good foundation already established

4. **Better for TUI specifically**:
   - Node.js better for terminal applications
   - Less overhead than Python process
   - Native child_process for AppleScript calls

---

## Implementation Plan: Extend things-mcp-main for TUI

### Phase 1: Add Database Layer

**Goal**: Read Things database alongside URL scheme

**Add to TypeScript project**:

```typescript
// src/database/things-db.ts
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

export class ThingsDatabase {
  private db: Database.Database;
  
  constructor() {
    const dbPath = this.getDatabasePath();
    this.db = new Database(dbPath);
  }
  
  private getDatabasePath(): string {
    const containerPath = path.join(
      os.homedir(),
      'Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac'
    );
    // Find ThingsData-xxxxx directory
    const thingsDataDir = // ... scan directory
    return path.join(thingsDataDir, 'Things Database.thingsdatabase/main.sqlite');
  }
  
  getTodayTodos(): Todo[] {
    // Query today's tasks
  }
  
  getUpcomingTodos(): Todo[] {
    // Query upcoming tasks
  }
  
  getAnytimeTodos(): Todo[] {
    // Query anytime tasks
  }
  
  getSomedayTodos(): Todo[] {
    // Query someday tasks
  }
  
  getTags(): Tag[] {
    // Get all tags
  }
  
  searchTodos(query: string): Todo[] {
    // Full-text search
  }
}
```

**Dependencies to add**:
```json
{
  "better-sqlite3": "^9.x",
  "@types/better-sqlite3": "^7.x"
}
```

**Why better-sqlite3**:
- Synchronous queries (better for CLI/TUI)
- Direct database access (no ORM overhead)
- Small footprint
- Excellent TypeScript support

### Phase 2: Create TUI Components

**Using Blessed**:

```typescript
// src/tui/lists.ts - Display lists with data from database
// src/tui/tags.ts - Tag filtering panel
// src/tui/task-detail.ts - Task detail view
// src/tui/search.ts - Search interface
// src/tui/quick-entry.ts - Quick add dialog
// src/tui/app.ts - Main TUI application
```

**Example structure**:

```typescript
import blessed from 'blessed';
import { ThingsDatabase } from '../database/things-db';

export class ThingsApp {
  private screen: blessed.Widgets.Screen;
  private db: ThingsDatabase;
  private currentList: 'today' | 'upcoming' | 'anytime' | 'someday' = 'today';
  
  constructor() {
    this.screen = blessed.screen({
      mouse: true,
      title: 'Things',
      escapeKeys: ['q'],
    });
    this.db = new ThingsDatabase();
  }
  
  async run(): Promise<void> {
    // Setup keyboard shortcuts
    this.setupKeyBindings();
    
    // Render initial view
    this.renderTodayList();
    
    // Refresh database every 5 seconds
    setInterval(() => this.refresh(), 5000);
    
    this.screen.render();
  }
  
  private setupKeyBindings(): void {
    this.screen.key(['q'], () => process.exit(0));
    this.screen.key(['1'], () => this.showToday());
    this.screen.key(['2'], () => this.showUpcoming());
    this.screen.key(['3'], () => this.showAnytime());
    this.screen.key(['4'], () => this.showSomeday());
    this.screen.key(['n'], () => this.quickAdd());
  }
  
  private renderTodayList(): void {
    const todos = this.db.getTodayTodos();
    // Render using blessed widgets
  }
}
```

### Phase 3: Integrate URL Scheme

**Reuse from things-mcp-main**:

```typescript
// src/operations/todo-operations.ts
export class TodoOperations {
  async createTodo(params: CreateTodoParams): Promise<void> {
    const url = this.buildTodoUrl(params);
    await execAsync(`open "${url}"`);
  }
  
  async updateTodo(id: string, params: UpdateTodoParams): Promise<void> {
    // Similar to things-mcp-main update logic
  }
  
  private buildTodoUrl(params: CreateTodoParams): string {
    const urlParams = new URLSearchParams();
    // ... parameter mapping
    return `things:///add?${urlParams.toString()}`;
  }
}
```

---

## Database Schema Reference

From analyzing both repos, the core Things database structure:

```sql
-- Main task table (todos and projects)
CREATE TABLE TMTask (
  id TEXT PRIMARY KEY,
  title TEXT,
  notes TEXT,
  dueDate TIMESTAMP,
  deadline TIMESTAMP,
  completionDate TIMESTAMP,
  creationDate TIMESTAMP,
  status INTEGER,  -- 0: incomplete, 1: completed, 2: canceled
  list INTEGER,    -- Inbox, Today, Upcoming, Anytime, Someday, Logbook
  type INTEGER,    -- 0: todo, 1: project, 2: heading
  index INTEGER,   -- Sort order
  area TEXT,       -- Foreign key to TMArea
  project TEXT,    -- Foreign key to parent TMTask
  parent TEXT,     -- Generic parent reference
  heading TEXT     -- Foreign key to TMHeading
);

-- Tags
CREATE TABLE TMTag (
  id TEXT PRIMARY KEY,
  title TEXT,
  parent TEXT,     -- Foreign key for tag hierarchy
  index INTEGER
);

-- Task-Tag relationships
CREATE TABLE TMTaskTag (
  task TEXT,       -- Foreign key to TMTask
  tag TEXT         -- Foreign key to TMTag
);

-- Checklist items
CREATE TABLE TMChecklistItem (
  id TEXT PRIMARY KEY,
  task TEXT,       -- Foreign key to TMTask
  title TEXT,
  status INTEGER,
  index INTEGER
);

-- Areas
CREATE TABLE TMArea (
  id TEXT PRIMARY KEY,
  title TEXT,
  index INTEGER
);

-- Headings
CREATE TABLE TMHeading (
  id TEXT PRIMARY KEY,
  project TEXT,    -- Foreign key to TMTask
  title TEXT,
  archived BOOLEAN
);
```

---

## Key Queries for TUI

```typescript
// Get today's todos
const getTodayTodos = () => {
  return db.prepare(`
    SELECT * FROM TMTask
    WHERE (dueDate = date('now') OR list = 'Today')
    AND status = 0
    ORDER BY index
  `).all();
};

// Get todos with tags
const getTodoWithTags = (todoId: string) => {
  return db.prepare(`
    SELECT 
      t.*,
      GROUP_CONCAT(tag.title, ', ') as tags
    FROM TMTask t
    LEFT JOIN TMTaskTag tt ON t.id = tt.task
    LEFT JOIN TMTag tag ON tt.tag = tag.id
    WHERE t.id = ?
    GROUP BY t.id
  `).get(todoId);
};

// Filter by tag
const getTodosByTag = (tagId: string) => {
  return db.prepare(`
    SELECT t.* FROM TMTask t
    JOIN TMTaskTag tt ON t.id = tt.task
    WHERE tt.tag = ? AND t.status = 0
    ORDER BY t.index
  `).all(tagId);
};
```

---

## File Structure for Extended Project

```
things-tui/                          (new project)
├── src/
│   ├── index.ts                    (entry point)
│   ├── database/
│   │   ├── things-db.ts            (database wrapper)
│   │   ├── queries.ts              (SQL queries)
│   │   └── types.ts                (TypeScript interfaces)
│   ├── tui/
│   │   ├── app.ts                  (main TUI application)
│   │   ├── components/
│   │   │   ├── list-view.ts        (scrollable list)
│   │   │   ├── tag-panel.ts        (tag filtering)
│   │   │   ├── task-detail.ts      (task view)
│   │   │   └── search.ts           (search interface)
│   │   ├── keybindings.ts          (keyboard shortcuts)
│   │   └── styles.ts               (colors, formatting)
│   ├── operations/
│   │   ├── url-scheme.ts           (reuse from mcp-main)
│   │   ├── todo-ops.ts             (create/update todos)
│   │   └── applescript.ts          (AppleScript helpers)
│   └── utils/
│       ├── formatters.ts           (format data for display)
│       └── validators.ts           (input validation)
├── dist/                           (compiled output)
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── DEVELOPMENT.md
```

---

## What to Reuse from Existing Repos

### From things-mcp-main (TypeScript):
- ✅ **URL encoding logic** - `URLSearchParams` patterns
- ✅ **Command execution** - `execAsync` for `open` command
- ✅ **Zod schemas** - Parameter validation
- ✅ **Tool definitions** - Parameter descriptions
- ✅ **Error handling patterns**

### From things-mcp-master (Python):
- ✅ **Data formatting utilities** - Convert database objects to strings
- ✅ **SQL queries** - Adapt to TypeScript/better-sqlite3
- ✅ **Nested data handling** - Projects in areas, todos in projects
- ✅ **Tag hierarchy logic**
- ✅ **Test patterns** - Adapt for Jest instead of pytest

---

## Implementation Strategy

### Don't Duplicate:
- ❌ Don't rewrite Things URL scheme handling
- ❌ Don't reimplement data formatting from scratch
- ❌ Don't rebuild parameter validation

### Do Extend:
- ✅ Add database read layer to things-mcp-main structure
- ✅ Extend with TUI components using Blessed
- ✅ Reuse URL scheme code but adapt for TUI
- ✅ Keep database access separate from MCP

### Progressive Phases:

**Phase 1** (Week 1):
- Add ThingsDatabase class to things-mcp-main
- Test database queries with sample data
- Create basic list display

**Phase 2** (Week 2):
- Build TUI with Blessed
- Render Today/Upcoming/Anytime/Someday lists
- Add keyboard navigation

**Phase 3** (Week 3):
- Add tag filtering
- Implement quick search
- Add tag manager panel

**Phase 4** (Week 4):
- Quick entry dialog
- Task detail view
- Integration with URL scheme for writes

**Phase 5** (Week 5):
- AppleScript integration
- Advanced search
- Configuration UI

**Phase 6** (Week 6):
- Polish, testing, documentation

---

## Key Dependencies for TUI

```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "blessed": "^0.1.81",
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/blessed": "^0.1.21",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

---

## Quick Decision Tree

```
Start building TUI?
├─ Want database read access?
│  └─ YES: Add better-sqlite3 + ThingsDatabase class
├─ Want to create/update todos from TUI?
│  └─ YES: Reuse things-mcp-main URL scheme code
├─ Want keyboard-driven interface?
│  └─ YES: Use Blessed (excellent for this)
└─ Want to keep MCP functionality?
   └─ OPTIONAL: Can still build CLI alongside TUI

Result: TypeScript monorepo with:
  - src/database/ - Database access
  - src/tui/ - Terminal UI
  - src/cli/ - Command-line tools (optional)
  - src/mcp/ - MCP server (optional, can reuse things-mcp-main)
```

---

## Documentation Strategy

### Keep Existing:
- ✅ `/Users/m/Desktop/DOCUMENTATION_PLAN.md` - Feature analysis
- ✅ `/Users/m/Desktop/Things_Documentation/` - All Things docs
- ✅ `/Users/m/Desktop/Things_Screenshots/` - UI reference

### Expand (Don't duplicate):
- **ARCHITECTURE.md** - How TUI integrates with database and URL scheme
- **DATABASE_GUIDE.md** - Queries specific to this project
- **KEYBOARD_REFERENCE.md** - Implemented shortcuts vs docs

### New (Only when needed):
- **DEVELOPMENT.md** - Setup, running, testing the project
- **TROUBLESHOOTING.md** - Common issues and solutions

---

## Next Steps

1. **Decide**: Fork or extend things-mcp-main?
   - Recommendation: Clone, rename, extend

2. **Setup Project**:
   ```bash
   cd ~/ai/projects/
   cp -r /Users/m/Desktop/things-mcp-main things-tui
   cd things-tui
   npm install
   ```

3. **Add Database Layer**:
   - Create `src/database/things-db.ts`
   - Install better-sqlite3
   - Test 3-4 key queries

4. **Test Database Access**:
   - Build, run: `npm run build && node dist/index.ts`
   - Verify database reads work

5. **Begin Phase 1** (Week 1):
   - Add Blessed for TUI
   - Create basic list view
   - Connect database queries

---

## Summary

| Item | Status | Notes |
|------|--------|-------|
| TypeScript Foundation | ✅ Exists | things-mcp-main is good base |
| Database Access | ⚠️ Needs Implementation | Add better-sqlite3 layer |
| TUI Components | ⚠️ Needs Implementation | Use Blessed |
| URL Scheme Integration | ✅ Can Reuse | From things-mcp-main |
| Documentation | ✅ Comprehensive | Already organized on Desktop |
| Database Schema | ✅ Known | Documented in this file |
| Keyboard Shortcuts | ✅ Known | From Things_Documentation |

**Recommendation**: Extend things-mcp-main structure with database + TUI layers. Avoid duplication by reusing existing code patterns and documentation. Build incrementally with clear phase boundaries.

---

**Ready to start?** Create new TypeScript project that:
1. Keeps things-mcp-main's clean structure
2. Adds ThingsDatabase class for reads
3. Wraps with Blessed for TUI
4. Extends with operations for writes

This gives you a single, cohesive TypeScript project that's better than either existing repo individually.
