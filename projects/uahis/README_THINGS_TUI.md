# Things TUI Clone

A terminal user interface for the Things 3 task management app built with TypeScript and Blessed.

## Status

**Phase 1**: ✅ Complete (Database integration, project setup)  
**Phase 2**: ⏳ In Progress (Interactive UI, keyboard navigation)  
**Phase 3**: ⏳ Planned (Write operations via URL scheme)  
**Phase 4**: ⏳ Planned (Polish and MVP)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Python 3 with `things.py` library
- Things 3 app installed on macOS

### Installation

```bash
cd ~/ai/projects/uahis
npm install
npm run build
```

### Install things.py

```bash
pip install things.py
```

### Run

```bash
node dist/index.js
```

## Architecture

```
Things TUI
├── Database Layer (things.py)
│   ├── Fetch from Today, Upcoming, Anytime, Someday lists
│   └── Type-safe task objects
│
├── TUI Layer (Blessed)
│   ├── Sidebar: List navigation (1-4 keys)
│   ├── Main: Task display
│   └── Status bar: Help & counters
│
└── Utils
    ├── Path utilities
    └── Type definitions
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Show Today |
| `2` | Show Upcoming |
| `3` | Show Anytime |
| `4` | Show Someday |
| `↑/k` | Move up |
| `↓/j` | Move down |
| `Enter` | View task detail |
| `?` | Show help |
| `q` | Quit |

### Phase 2+ Shortcuts
| Key | Action |
|-----|--------|
| `n` | New task |
| `/` | Search |
| `c` | Mark complete |
| `t` | Add tag |
| `e` | Edit task |
| `d` | Delete task |
| `s` | Show in Things |

## Project Structure

```
src/
├── index.ts                 # Entry point
├── database/
│   ├── things-db.ts        # Database wrapper (things.py integration)
│   └── types.ts            # TypeScript interfaces
├── tui/
│   └── app.ts              # Blessed TUI application
└── utils/
    └── path.ts             # Path utilities

dist/                        # Compiled JavaScript (generated)
```

## Database

Uses `things.py` Python library which wraps the Things 3 database. The wrapper:
- Handles complex database schema
- Filters tasks by list (Today, Upcoming, etc.)
- Returns properly typed objects
- Runs via subprocess for compatibility

## Current Status

### Working ✅
- Database connection to Things
- Task fetching from all 4 main lists
- Type-safe TypeScript codebase
- Build system
- Basic Blessed UI setup

### Not Yet Implemented ⏳
- TUI rendering (interactive display)
- Keyboard navigation (key handlers defined but not tested)
- Task detail view
- Search functionality
- Task creation/editing
- Tag filtering

## Development

### Build
```bash
npm run build
```

### Watch mode
```bash
npm run build -- --watch
```

### Run tests (Phase 2+)
```bash
npm test
```

## Known Limitations

- Subprocess calls for each data fetch (~100ms overhead)
- Not optimized for 5,000+ task lists yet
- Terminal-only (no GUI)
- macOS only (Things 3 is macOS exclusive)

## Next Steps

1. **Phase 2**: Interactive TUI
   - Render tasks in Blessed windows
   - Test keyboard navigation
   - Implement list switching

2. **Phase 3**: Write operations
   - New task dialog
   - URL scheme integration
   - Task updates

3. **Phase 4**: Polish
   - Search
   - Tag filtering
   - Settings/config
   - Performance optimization

## Resources

- [Things.py documentation](https://github.com/th-in-gs/things.py)
- [Blessed documentation](https://blessed.readthedocs.io/)
- [TypeScript handbook](https://www.typescriptlang.org/docs/)

## Architecture Decision Notes

See `/Users/m/Desktop/SESSION_1_FINAL_SUMMARY.md` for:
- Why TypeScript (not Python)
- Why Blessed (not Textual)
- Why things-mcp-main as foundation
- Why things.py over direct SQLite

## Session Handoffs

- `/Users/m/Desktop/SESSION_1_FINAL_SUMMARY.md` - Strategic planning
- `/Users/m/Desktop/SESSION_2_HANDOFF.md` - Current status

---

**Status**: Phase 1 Complete ✅  
**Last Updated**: November 23, 2025  
**Next Session**: Phase 2 - Interactive UI
