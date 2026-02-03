# Things TUI: Hybrid Approach - Complete Plan
## Three-Step Strategy: Extract → Build → Integrate

**Date**: November 23, 2025  
**Status**: Ready to Execute

---

## Executive Summary

You're building a Things 3 terminal UI clone. You have:
- ✅ Complete Things documentation (17 files)
- ✅ Visual reference (25 screenshots)
- ✅ Two working MCP implementations (Python + TypeScript)
- ✅ Database schema fully documented
- ✅ Clear strategic decisions already made

**Approach**: Hybrid TypeScript TUI that:
1. **Extracts** database queries from Python reference (things-mcp-master)
2. **Builds** TUI directly in TypeScript (using things-mcp-main foundation)
3. **Integrates** write operations via Things URL scheme (avoid reinventing wheel)

**Timeline**: 4-6 weeks to full MVP

---

## STEP 1: EXTRACT FROM PYTHON (things-mcp-master)

### What You're Extracting
- SQL database queries (read-only)
- Data formatting patterns
- Tag hierarchy logic
- Nested data handling (projects within areas, todos within projects)
- Test patterns and fixtures

### What You're NOT Using
- ❌ MCP server wrapper (not needed for TUI)
- ❌ Python runtime (will use TypeScript instead)
- ❌ AppleScript helpers (will use Node.js equivalent)

### Key Files to Reference

**From `/Users/m/Desktop/things-mcp-master/`**:

1. **things_server.py** (lines 1-100)
   - Tool definitions (read list views)
   - Parameter descriptions
   - Error handling patterns

2. **formatters.py** (full file)
   - `format_todo()` - Convert DB rows to display text
   - `format_project()` - Nested project formatting
   - `format_area()` - Area with nested items
   - `format_tag()` - Tag with count
   - Pattern: Object → String representation

3. **Tests** (`tests/test_formatters.py`)
   - 26 test cases for data formatting
   - Mock fixtures (example todo/project structures)
   - Patterns for testing nested data

### Extraction Pattern

Python approach → TypeScript adaptation:

```python
# Python (reference)
def format_todo(todo):
    return f"{todo.title}\n{todo.notes}"

def get_todos_by_tag(tag_id):
    # Join TMTask + TMTaskTag + TMTag
    # Filter by status=0
```

Becomes:

```typescript
// TypeScript (TUI)
function formatTodo(todo: Todo): string {
  return `${todo.title}\n${todo.notes}`;
}

function getTodosByTag(tagId: string): Todo[] {
  const stmt = db.prepare(`
    SELECT t.* FROM TMTask t
    JOIN TMTaskTag tt ON t.id = tt.task
    WHERE tt.tag = ? AND t.status = 0
  `);
  return stmt.all(tagId) as Todo[];
}
```

### Extraction Checklist

- [ ] Copy database schema from DATABASE_EXTRACTION_GUIDE.md
- [ ] Translate key SQL queries to TypeScript (better-sqlite3 format)
- [ ] Extract data formatting logic → TypeScript functions
- [ ] Copy test fixtures for reference data
- [ ] Document tag hierarchy logic from test cases
- [ ] Identify all status values (0=incomplete, 1=completed, 2=canceled)

---

## STEP 2: BUILD TYPESCRIPT TUI

### Foundation: things-mcp-main

**Why?**:
- ✅ Clean, minimal TypeScript
- ✅ Excellent URL scheme implementation (ready for Phase 3)
- ✅ Single-file structure (easy to understand)
- ✅ Modern Node.js setup
- ✅ Already uses better error handling patterns

### Setup (from TYPESCRIPT_TUI_QUICK_START.md)

```bash
# 1. Clone foundation
cd ~/ai/projects/
cp -r /Users/m/Desktop/things-mcp-main things-tui
cd things-tui

# 2. Add dependencies
npm install better-sqlite3 blessed commander chalk
npm install --save-dev @types/blessed @types/better-sqlite3

# 3. Verify
npm run build
```

### Architecture

```
things-tui/
├── src/
│   ├── index.ts                    ← Entry point
│   ├── database/
│   │   ├── things-db.ts            ← Database wrapper (new)
│   │   └── types.ts                ← TypeScript interfaces (new)
│   ├── tui/
│   │   ├── app.ts                  ← Main TUI (new)
│   │   ├── components/             ← Reusable widgets (Phase 2+)
│   │   └── keybindings.ts          ← Keyboard shortcuts (new)
│   └── operations/
│       └── url-scheme.ts           ← Reuse from things-mcp-main
├── dist/
├── package.json
├── tsconfig.json
└── README.md
```

### Key Implementation Files

#### 1. Database Layer (`src/database/things-db.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Todo, Tag, Project, Area } from './types';

export class ThingsDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = this.findDatabasePath();
    if (!dbPath) throw new Error('Things database not found');
    this.db = new Database(dbPath, { readonly: true });
  }

  private findDatabasePath(): string | null {
    const containerPath = path.join(
      os.homedir(),
      'Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac'
    );
    try {
      const dirs = fs.readdirSync(containerPath);
      const thingsDataDir = dirs.find((d) => d.startsWith('ThingsData-'));
      if (!thingsDataDir) return null;
      return path.join(
        containerPath,
        thingsDataDir,
        'Things Database.thingsdatabase/main.sqlite'
      );
    } catch {
      return null;
    }
  }

  getTodayTodos(): Todo[] {
    const stmt = this.db.prepare(`
      SELECT id, title, notes, dueDate, deadline, status
      FROM TMTask
      WHERE list = 'Today' AND status = 0
      ORDER BY index
    `);
    return stmt.all() as Todo[];
  }

  getUpcomingTodos(): Todo[] {
    const stmt = this.db.prepare(`
      SELECT id, title, notes, dueDate, status
      FROM TMTask
      WHERE list = 'Upcoming' AND status = 0
      ORDER BY dueDate, index
    `);
    return stmt.all() as Todo[];
  }

  getTags(): Tag[] {
    const stmt = this.db.prepare(`
      SELECT id, title, parent as parentId
      FROM TMTag
      ORDER BY index
    `);
    return stmt.all() as Tag[];
  }

  searchTodos(query: string): Todo[] {
    const stmt = this.db.prepare(`
      SELECT id, title, notes, status
      FROM TMTask
      WHERE (title LIKE ? OR notes LIKE ?) AND status = 0
      ORDER BY title
    `);
    const pattern = `%${query}%`;
    return stmt.all(pattern, pattern) as Todo[];
  }

  close(): void {
    this.db.close();
  }
}
```

#### 2. TUI App (`src/tui/app.ts`)

```typescript
import blessed from 'blessed';
import { ThingsDatabase } from '../database/things-db';
import { Todo } from '../database/types';

type ListType = 'today' | 'upcoming' | 'anytime' | 'someday';

export class ThingsTUI {
  private screen: blessed.Widgets.Screen;
  private db: ThingsDatabase;
  private currentList: ListType = 'today';
  private todos: Todo[] = [];
  private listBox: blessed.Widgets.ListElement;

  constructor() {
    this.screen = blessed.screen({
      mouse: true,
      title: 'Things',
      escapeKeys: ['q', 'C-c'],
    });
    this.db = new ThingsDatabase();
    this.listBox = this.createListBox();
    this.setupKeyBindings();
  }

  private createListBox(): blessed.Widgets.ListElement {
    return blessed.list({
      parent: this.screen,
      top: 1,
      left: 0,
      width: '100%',
      height: '100%-2',
      keys: true,
      vi: true,
      mouse: true,
      style: {
        selected: { bg: 'blue', fg: 'white' },
      },
    }) as unknown as blessed.Widgets.ListElement;
  }

  private setupKeyBindings(): void {
    this.screen.key(['q', 'C-c'], () => this.exit());
    this.screen.key(['1'], () => this.switchList('today'));
    this.screen.key(['2'], () => this.switchList('upcoming'));
    this.screen.key(['3'], () => this.switchList('anytime'));
    this.screen.key(['4'], () => this.switchList('someday'));
    this.screen.key(['n'], () => this.quickAdd());
    this.screen.key(['enter'], () => this.showDetail());
    this.screen.key(['/', 'C-f'], () => this.search());
  }

  private switchList(list: ListType): void {
    this.currentList = list;
    this.loadTodos();
  }

  private loadTodos(): void {
    switch (this.currentList) {
      case 'today':
        this.todos = this.db.getTodayTodos();
        break;
      case 'upcoming':
        this.todos = this.db.getUpcomingTodos();
        break;
      // ... more lists
    }
    this.renderList();
  }

  private renderList(): void {
    const items = this.todos.map((t) => t.title);
    this.listBox.setItems(items);
    this.screen.render();
  }

  private quickAdd(): void {
    // Phase 3: Implement with URL scheme
  }

  private showDetail(): void {
    // Phase 2: Implement task detail view
  }

  private search(): void {
    // Phase 2: Implement search
  }

  async run(): Promise<void> {
    this.loadTodos();
    this.screen.render();
    setInterval(() => this.loadTodos(), 5000);
  }

  private exit(): void {
    this.db.close();
    process.exit(0);
  }
}
```

#### 3. Entry Point (`src/index.ts`)

```typescript
#!/usr/bin/env node

import { ThingsTUI } from './tui/app';

async function main() {
  try {
    const app = new ThingsTUI();
    await app.run();
  } catch (error) {
    console.error('Failed to start Things TUI:', error);
    process.exit(1);
  }
}

main();
```

### Build & Test

```bash
# Build
npm run build

# Run
node dist/index.js

# Or with hot-reload
npm install --save-dev nodemon ts-node
npx nodemon --exec 'ts-node' src/index.ts
```

### Success Criteria (Phase 1)
- [ ] Database reads working
- [ ] Lists display (Today, Upcoming, Anytime, Someday)
- [ ] Keyboard navigation works (1-4 keys, q to quit)
- [ ] No database errors
- [ ] Clean exit

---

## STEP 3: INTEGRATE WRITE OPERATIONS

### URL Scheme (from things-mcp-main)

Don't rebuild—reuse existing pattern from `things-mcp-main/src/index.ts`:

```typescript
// src/operations/url-scheme.ts
import { execSync } from 'child_process';

export function buildTodoUrl(params: {
  title: string;
  notes?: string;
  when?: string;
  deadline?: string;
  tags?: string[];
}): string {
  const searchParams = new URLSearchParams();
  
  if (params.title) searchParams.append('title', params.title);
  if (params.notes) searchParams.append('notes', params.notes);
  if (params.when) searchParams.append('when', params.when);
  if (params.tags) searchParams.append('tags', params.tags.join(','));
  
  return `things:///add?${searchParams.toString()}`;
}

export function executeTodosUrl(url: string): void {
  execSync(`open "${url}"`);
}
```

### Integration Points

**Phase 3 tasks**:

1. **Quick Add** (`n` key)
   - Show input dialog with Blessed
   - Build URL using buildTodoUrl()
   - Execute via executeTodosUrl()
   - Refresh database display

2. **Update Todo** (Phase 3+)
   - Get auth token from Things
   - Build update URL
   - Execute and refresh

3. **Complete Task** (Phase 3+)
   - Simple update with status=completed

### No Database Writes

**Important**: The TUI reads from Things database but writes via URL scheme. This means:
- ✅ No sync conflicts
- ✅ No database locking issues
- ✅ Automatic Things app updates
- ✅ Clean separation of concerns

---

## Development Phases

### Phase 1: Basic Display (Week 1)
- [ ] Project setup
- [ ] Database layer working
- [ ] 4 main lists displaying
- [ ] Keyboard navigation (1-4, q)
- **Test**: Can launch, see tasks, switch lists, quit cleanly

### Phase 2: Interactivity (Week 2)
- [ ] Task detail view
- [ ] Search interface
- [ ] Tag display
- [ ] Basic filtering
- **Test**: Can view task details, search, see tags

### Phase 3: Write Operations (Week 3)
- [ ] Quick add dialog
- [ ] URL scheme integration
- [ ] Create todos from TUI
- [ ] Update todos
- **Test**: Create task in TUI, verify in Things app

### Phase 4: Polish (Week 4)
- [ ] Tag manager panel
- [ ] Advanced search
- [ ] Settings/config
- [ ] Performance optimization
- **Test**: Full user workflow

---

## Key Resources

**On Your Desktop**:
- `/Users/m/Desktop/things-mcp-main/` - TypeScript foundation
- `/Users/m/Desktop/things-mcp-master/` - Python reference
- `/Users/m/Desktop/TYPESCRIPT_TUI_QUICK_START.md` - Implementation walkthrough
- `/Users/m/Desktop/DATABASE_EXTRACTION_GUIDE.md` - SQL queries
- `/Users/m/Desktop/DOCUMENTATION_PLAN.md` - Feature analysis

**Documentation**:
- Things_Documentation/ (17 files) - Official Things docs
- Things_Screenshots/ (25 images) - Visual reference

---

## What You're Avoiding

| What | Why You're Skipping It |
|------|------------------------|
| Rebuilding URL scheme | things-mcp-main already has it |
| Data formatting from scratch | Python reference has patterns |
| Complex database sync | Read-only + URL scheme is simpler |
| AppleScript learning | Node.js `execSync` is sufficient |
| Reinventing MCP | Using existing repos as reference only |

---

## Success Metrics

| Phase | Deliverable | How to Test |
|-------|-------------|-----------|
| 1 | Working TUI showing tasks | `npm run build && node dist/index.js` |
| 2 | Task details + search working | Can view full task info, search works |
| 3 | Create/update operations | Create task in TUI, see in Things app |
| 4 | Full MVP | Complete user workflow end-to-end |

---

## Quick Start

```bash
# 1. Setup (5 min)
cd ~/ai/projects/
cp -r /Users/m/Desktop/things-mcp-main things-tui
cd things-tui
npm install better-sqlite3 blessed commander chalk
npm install --save-dev @types/blessed @types/better-sqlite3

# 2. Create database layer (15 min)
# Copy code from TYPESCRIPT_TUI_QUICK_START.md
mkdir -p src/database
# Create things-db.ts and types.ts

# 3. Create TUI app (30 min)
mkdir -p src/tui
# Create app.ts

# 4. Update entry point (5 min)
# Update src/index.ts

# 5. Test (5 min)
npm run build
node dist/index.js
```

**Total time to Phase 1**: ~1.5 hours

---

## Token Optimization Notes

What you've read:
- ✅ things-mcp-master/README.md
- ✅ things-mcp-master/things_server.py
- ✅ things-mcp-master/url_scheme.py
- ✅ things-mcp-master/formatters.py (patterns extracted)
- ✅ things-mcp-main/readme.md
- ✅ things-mcp-main/src/index.ts
- ✅ TYPESCRIPT_TUI_QUICK_START.md (complete code templates)
- ✅ DOCUMENTATION_PLAN.md (feature analysis)
- ✅ DATABASE_EXTRACTION_GUIDE.md (SQL queries)
- ✅ INDEX.md (resource map)
- ✅ README.md (overview)
- ✅ REPO_ANALYSIS_AND_STRATEGY.md (decisions)

**You don't need to read again**:
- Python MCP implementation (reference only)
- Things original documentation (search when needed)
- Screenshots (reference during UI design phase)

---

## Summary Table

| Item | Source | Use For |
|------|--------|---------|
| URL Scheme logic | things-mcp-main | Phase 3 write operations |
| Data formatting | things-mcp-master | Phase 1+ display logic |
| SQL queries | DATABASE_EXTRACTION_GUIDE.md | Phase 1 database layer |
| Feature specs | DOCUMENTATION_PLAN.md | Phase design decisions |
| Code templates | TYPESCRIPT_TUI_QUICK_START.md | Copy-paste into project |
| Database schema | DATABASE_EXTRACTION_GUIDE.md | Type definitions |

---

## Next Action

**Now**: Read this document (10 min)  
**Next** (1-2 hours): Follow TYPESCRIPT_TUI_QUICK_START.md steps 1-4  
**Then** (by end of day): Have Phase 1 working  

**Start with**: `npm run build && node dist/index.js` to verify TUI launches

---

**Status**: 🟢 Ready to execute. All decisions made. Foundation prepared. Go build.
