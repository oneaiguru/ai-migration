# TypeScript TUI - Quick Start Guide

**Goal**: Build Things TUI using TypeScript + Blessed + better-sqlite3

---

## 1. Project Setup (5 minutes)

```bash
# Clone things-mcp-main as foundation
cd ~/ai/projects/
cp -r /Users/m/Desktop/things-mcp-main things-tui
cd things-tui

# Update package.json
npm install better-sqlite3 blessed commander chalk
npm install --save-dev @types/blessed @types/better-sqlite3

# Verify
npm run build
```

---

## 2. Add Database Layer (15 minutes)

**Create**: `src/database/types.ts`

```typescript
export interface Todo {
  id: string;
  title: string;
  notes?: string;
  dueDate?: Date;
  deadline?: Date;
  status: 'incomplete' | 'completed' | 'canceled';
  tags?: string[];
  checklist?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  status: 'incomplete' | 'completed' | 'canceled';
}

export interface Tag {
  id: string;
  title: string;
  parentId?: string;
}

export interface Project {
  id: string;
  title: string;
  notes?: string;
  area?: string;
}

export interface Area {
  id: string;
  title: string;
}
```

**Create**: `src/database/things-db.ts`

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
    if (!dbPath) {
      throw new Error('Things database not found');
    }
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

  getAnytimeTodos(): Todo[] {
    const stmt = this.db.prepare(`
      SELECT id, title, notes, status
      FROM TMTask
      WHERE list = 'Anytime' AND status = 0
      ORDER BY index
    `);
    return stmt.all() as Todo[];
  }

  getSomedayTodos(): Todo[] {
    const stmt = this.db.prepare(`
      SELECT id, title, notes, creationDate
      FROM TMTask
      WHERE list = 'Someday' AND status = 0
      ORDER BY creationDate DESC
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
      WHERE (title LIKE ? OR notes LIKE ?)
      AND status = 0
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

---

## 3. Create TUI App (30 minutes)

**Create**: `src/tui/app.ts`

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
    return this.screen.key(
      [],
      blessed.list({
        parent: this.screen,
        top: 1,
        left: 0,
        width: '100%',
        height: '100%-2',
        keys: true,
        vi: true,
        mouse: true,
        style: {
          selected: {
            bg: 'blue',
            fg: 'white',
          },
        },
      })
    ) as unknown as blessed.Widgets.ListElement;
  }

  private setupKeyBindings(): void {
    // Navigation
    this.screen.key(['q', 'C-c'], () => this.exit());
    this.screen.key(['1'], () => this.switchList('today'));
    this.screen.key(['2'], () => this.switchList('upcoming'));
    this.screen.key(['3'], () => this.switchList('anytime'));
    this.screen.key(['4'], () => this.switchList('someday'));

    // Actions
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
      case 'anytime':
        this.todos = this.db.getAnytimeTodos();
        break;
      case 'someday':
        this.todos = this.db.getSomedayTodos();
        break;
    }
    this.renderList();
  }

  private renderList(): void {
    const items = this.todos.map((t) => t.title);
    this.listBox.setItems(items);
    this.screen.render();
  }

  private async quickAdd(): Promise<void> {
    // TODO: Implement quick entry dialog
  }

  private showDetail(): void {
    // TODO: Show selected task details
  }

  private search(): void {
    // TODO: Open search dialog
  }

  async run(): Promise<void> {
    this.loadTodos();
    this.screen.render();

    // Refresh every 5 seconds
    setInterval(() => {
      this.loadTodos();
    }, 5000);
  }

  private exit(): void {
    this.db.close();
    process.exit(0);
  }
}
```

**Create**: `src/index.ts` (update)

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

---

## 4. Test It (5 minutes)

```bash
# Build
npm run build

# Run
node dist/index.js

# Or with ts-node for development
npm install --save-dev ts-node
npx ts-node src/index.ts
```

**Keyboard controls**:
- `1-4` - Switch lists (Today, Upcoming, Anytime, Someday)
- `q` - Quit
- Arrow keys - Navigate
- `n` - New todo (not yet implemented)
- `/` - Search (not yet implemented)

---

## 5. Key Files to Understand

| File | Purpose |
|------|---------|
| `src/database/things-db.ts` | Database access wrapper |
| `src/database/types.ts` | TypeScript interfaces |
| `src/tui/app.ts` | Main TUI application |
| `package.json` | Dependencies |
| `tsconfig.json` | TypeScript config |

---

## 6. What You're Building

```
Phase 1: Basic Display ✅ (You are here)
├─ Display today list
├─ Display upcoming list
├─ Display anytime list
└─ Display someday list

Phase 2: Interactivity (Next)
├─ Select and view task details
├─ Quick entry dialog
├─ Tag filtering
└─ Search

Phase 3: Write Operations
├─ Create todos
├─ Update todos
├─ Complete tasks
└─ Delete todos

Phase 4: Advanced
├─ Projects/Areas
├─ Notes editing
├─ Checklist management
└─ AppleScript integration
```

---

## 7. Essential Blessed Patterns

### Create a text box:
```typescript
const input = blessed.textbox({
  parent: this.screen,
  keys: true,
  mouse: true,
  style: {
    focus: { bg: 'green' },
  },
});
```

### Create a list:
```typescript
const list = blessed.list({
  parent: this.screen,
  keys: true,
  vi: true,
  items: ['Item 1', 'Item 2'],
  style: {
    selected: { bg: 'blue' },
  },
});
```

### Listen for selection:
```typescript
list.on('select', (item, index) => {
  console.log(`Selected: ${item} at ${index}`);
});
```

### Render:
```typescript
this.screen.render();
```

---

## 8. Blessed Documentation

**Key resources**:
- Official: https://github.com/yaronn/blessed
- Common widgets: `screen`, `list`, `box`, `text`, `input`, `textarea`
- Key binding: `screen.key(['q'], () => {})`
- Styling: `style: { bg: 'blue', fg: 'white' }`

---

## 9. Database Query Debugging

Test queries directly:

```bash
# Open database in sqlite3
sqlite3 ~/Library/Group\ Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-*/Things\ Database.thingsdatabase/main.sqlite

# Test query
.mode column
SELECT title, status FROM TMTask LIMIT 5;
```

---

## 10. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Database not found | Ensure Things 3 is installed and has been opened |
| Blessed not rendering | Call `screen.render()` after changes |
| Keys not working | Use `this.screen.key()` before `run()` |
| Database locked | Things must be closed for readonly access |
| Data not updating | Add manual refresh interval |

---

## Next Steps After Phase 1

1. **Add Task Detail View** (30 min)
   - Show selected task in detail panel
   - Display notes, tags, deadline, etc.

2. **Add Quick Entry** (45 min)
   - Simple input dialog
   - Create todo via URL scheme

3. **Add Tag Filtering** (60 min)
   - Display tags for current list
   - Filter todos by tag

4. **Add Search** (45 min)
   - Input box for search
   - Display results

---

## Commands for Development

```bash
# Watch and rebuild
npm run build -- --watch

# Run with dev dependencies
npm install --save-dev nodemon ts-node
npx nodemon --exec 'ts-node' src/index.ts

# Test if installed
npm test

# Clean build
rm -rf dist && npm run build
```

---

## File Structure After Phase 1

```
things-tui/
├── src/
│   ├── index.ts                    ← Entry point
│   ├── database/
│   │   ├── things-db.ts            ← Database wrapper
│   │   └── types.ts                ← Interfaces
│   └── tui/
│       └── app.ts                  ← Main TUI
├── dist/                           ← Compiled JS
├── package.json
├── tsconfig.json
└── README.md
```

---

## Verification Checklist

After setup, you should have:

- [ ] Project cloned from things-mcp-main
- [ ] Dependencies installed (better-sqlite3, blessed, etc.)
- [ ] Database layer working (can read todos)
- [ ] TUI launching without errors
- [ ] Lists displaying correctly
- [ ] Keyboard navigation working (1-4 keys)
- [ ] Can exit cleanly (q key)

---

**Total Time to Phase 1 Completion**: ~1.5 hours

**Result**: Working TUI that displays Things tasks from database with navigation between lists.

**Ready to start?** Follow steps 1-4 above, then test in step 5. Continue to Phase 2 after verification.
