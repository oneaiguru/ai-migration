# Project Structure Snapshot

```
├── ai-docs/
│   ├── README.md
│   ├── MANIFEST.md
│   ├── RESEARCH_BRIEF.md
│   ├── QUESTIONS.md
│   ├── playground/
│   ├── wrappers-draft/
│   ├── reference/
│   ├── third_party/
│   └── scripts/
├── docs/
│   ├── SOP/
│   ├── System/
│   ├── Tasks/
│   ├── AGENT_PARITY_REPORT.md
│   ├── EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
│   ├── SCREENSHOT_INDEX.md
│   ├── SESSION_HANDOFF.md
│   ├── SESSION_SUMMARY.md
│   ├── TODO_AGENT.md
│   └── ENVIRONMENT_FIX_TODO.md
├── .storybook/               # Storybook (Vite) configuration for wrapper demos
├── playwright.config.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── EmployeeList/
│   │   │   ├── EmployeeListContainer.tsx        # hook + sectional composition
│   │   │   ├── useEmployeeListState.tsx         # extracted state/handlers/constants
│   │   │   ├── Toolbar.tsx / Filters.tsx        # header + filter panel
│   │   │   ├── Table.tsx                        # DataTable wrapper with loading state
│   │   │   ├── BulkEditDrawer.tsx               # sheet overlay
│   │   │   ├── TagManagerOverlay.tsx            # modal overlay
│   │   │   ├── ColumnSettingsOverlay.tsx        # sheet overlay
│   │   │   └── ImportExportModals.tsx           # import/export modals
│   │   ├── EmployeeEditDrawer.tsx
│   │   ├── QuickAddEmployee.tsx
│   │   └── demo-only modules (PhotoGallery, Performance, etc.)
│   ├── hooks/
│   ├── types/
│   │   └── employee.ts
│   ├── utils/
│   │   └── task.ts
│   ├── wrappers/
│   │   ├── ui/ (Dialog, Button, Popover + README)
│   │   ├── form/ (FormField, EmployeeForm + README)
│   │   └── data/ (DataTable + README)
│   └── test/ (Vitest setup files)
├── tests/
│   ├── employee-list.spec.ts
│   └── … Playwright suites
├── src/wrappers/__tests__/   # Wrapper Vitest smoke tests
├── package.json
└── README.md (project root)
```

Update this snapshot when structure changes (new modules, test suites, etc.).
